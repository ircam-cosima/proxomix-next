import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';
import Beacon from '../../shared/services/client/Beacon';
import ChooserView from './ChooserView';
import LoopPlayer from '../shared/instruments/LoopPlayer';
import instrumentFactory from '../shared/instruments/instrumentFactory';
import Mixer from './Mixer';
import rawMixSetup from '../../shared/setup';

const client = soundworks.client;
const audio = soundworks.audio;
const audioContext = soundworks.audioContext;
const audioScheduler = soundworks.audio.getScheduler();

audioScheduler.lookahead = 0.15;
audioScheduler.period = 0.05;

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain, beaconUUID) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin');
    this.metricScheduler = this.require('metric-scheduler');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: rawMixSetup
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity'],
    });

    const beaconConfig = {
      uuid: beaconUUID,
      major: 0,
      skipService: false,
      debug: false,
    };

    beaconConfig.emulate = (!!window.cordova) ? null : { numPeers: 0 };
    this.beacon = this.require('beacon', beaconConfig);

    this.chooserView = null;

    this.playerId = undefined;
    this.intrumentConfig = null;
    this.availablePlayers = null;

    this.instruments = [];
    this.instrumentEnv = null;

    this.onPlayerAcknwoledge = this.onPlayerAcknwoledge.bind(this);
    this.onHomeButton = this.onHomeButton.bind(this);
    this.onChooserButton = this.onChooserButton.bind(this);
    this.onPlayerConfirm = this.onPlayerConfirm.bind(this);

    this.onPlayerEnter = this.onPlayerEnter.bind(this);
    this.onPlayerExit = this.onPlayerExit.bind(this);
    this.onPlayerAvailable = this.onPlayerAvailable.bind(this);

    this.onBeaconRanging = this.onBeaconRanging.bind(this);
    this.onInstrumentControl = this.onInstrumentControl.bind(this);
  }

  start() {
    super.start();

    const viewModel = {
      sorry: false,
    };

    this.view = new soundworks.View('');

    this.show().then(() => {
      this.send('player:request');
      this.receive('player:acknowledge', this.onPlayerAcknwoledge);
      this.receive('player:confirm', this.onPlayerConfirm);
      this.receive('instrument:control', this.onInstrumentControl);

      this.receive('player:enter', this.onPlayerEnter);
      this.receive('player:exit', this.onPlayerExit);
      this.receive('player:available', this.onPlayerAvailable);
    });

    const mixSetup = this.audioBufferManager.data;
    const commonConfig = mixSetup.common;
    const loopPlayer = new LoopPlayer(this.metricScheduler, commonConfig.measureLength, commonConfig.tempo, commonConfig.tempoUnit, 0.05);

    this.instrumentEnv = {
      screenContainer: this.view.$el,
      motionInput: this.motionInput,
      sendControl: this.sendIntrumentControl(this.playerId),
      metricScheduler: this.metricScheduler,
      loopPlayer: loopPlayer,
    };

    this.mixer = new Mixer(this.metricScheduler);
    this.mixer.connect(audioContext.destination);

    // create instruments
    const instrumentList = Object.keys(mixSetup.instruments);
    const numInstruments = instrumentList.length;

    for (let i = 0; i < numInstruments; i++) {
      const instrumentId = instrumentList[i];
      const instrumentSetup = mixSetup.instruments[instrumentId];
      const instrument = instrumentFactory.createInstrument(this.instrumentEnv, instrumentSetup.type, instrumentSetup);
      this.mixer.createChannel(i, instrument);
      this.instruments[i] = instrument;
    }
  }

  showChooser() {
    const iconList = [];

    for (let prop in rawMixSetup.instruments)
      iconList.push(rawMixSetup.instruments[prop].icon.chooser);

    const chooserView = new ChooserView(iconList, this.availablePlayers, this.onChooserButton);
    chooserView.render();
    chooserView.show();
    chooserView.appendTo(this.view.$el);
    this.chooserView = chooserView;
  }

  hideChooser() {
    if (this.chooserView) {
      this.chooserView.remove();
      this.chooserView = null;
    }
  }

  updateChooser() {
    if (this.chooserView) {
      this.chooserView.update(this.availablePlayers);
    }
  }

  onChooserButton(playerId) {
    if (this.availablePlayers.has(playerId))
      this.send('player:id', playerId);
  }

  onPlayerAcknwoledge(availablePlayers) {
    this.availablePlayers = new Set(availablePlayers);
    this.showChooser();
  }

  onPlayerConfirm(playerId) {
    this.hideChooser();
    this.enterApplication(playerId);
  }

  addHomeButton(instrument) {
    const container = instrument.view.$el;
    const button = document.createElement("div");
    button.classList.add('home-button');
    button.addEventListener('touchstart', this.onHomeButton);
    container.appendChild(button);
  }

  removeHomeButton(instrument) {
    const container = instrument.view.$el;
    const button = container.querySelector('.home-button');
    container.removeChild(button);
  }

  onHomeButton() {
    this.exitApplication();
    this.showChooser();
  }

  startInstruments(playerId) {
    const mixSetup = this.audioBufferManager.data;
    const instrument = this.instruments[playerId];

    instrument.foreground = mixSetup.colors[playerId].foreground;
    instrument.visible = true;
    instrument.active = true;

    this.addHomeButton(instrument);
    this.mixer.setGain(playerId, 1);

    // const instrumentList = Object.keys(mixSetup.instruments);
    // const numInstruments = instrumentList.length;
    // for (let i = 0; i < numInstruments; i++) {
    //   if (i !== this.playerId) {
    //     instrument.active = true;
    //     this.mixer.setGain(i, 0.5);
    //   }
    // }
  }

  stopInstruments() {
    for (let instrument of this.instruments) {
      instrument.visible = false;
      instrument.active = false;
    }
  }

  startBeaconing() {
    this.beacon.minor = this.playerId;
    this.beacon.addListener(this.onBeaconRanging);
    this.beacon.startAdvertising();
    this.beacon.startRanging();
  }

  stopBeaconing() {
    this.beacon.minor = 999;
    this.beacon.removeListener(this.onBeaconRanging);
    this.beacon.stopAdvertising();
    this.beacon.stopRanging();
  }

  enterApplication(playerId) {
    this.playerId = playerId;
    this.availablePlayers.delete(playerId);
    this.send('player:enter', playerId);

    this.startInstruments(playerId);
    this.startBeaconing();
  }

  exitApplication() {
    const playerId = this.playerId;

    if (playerId !== undefined) {
      this.stopBeaconing();
      this.stopInstruments();

      this.send('player:exit', playerId);

      this.playerId = undefined;
    }
  }

  sendIntrumentControl(playerId) {
    return (name, value) => this.send('instrument:control', playerId, name, value);
  }

  onPlayerEnter(playerId) {
    this.availablePlayers.delete(playerId);
    this.updateChooser();
  }

  onPlayerExit(playerId) {
    this.mixer.setAutomation(playerId, 0, 0.05);

    const instrument = this.instruments[playerId];
    if (instrument)
      instrument.active = false;
  }

  onPlayerAvailable(playerId) {
    this.availablePlayers.add(playerId);
    this.updateChooser();
  }

  onInstrumentControl(playerId, name, value) {
    const instrument = this.instruments[playerId];

    if (instrument)
      instrument.setControl(name, value);
  }

  onBeaconRanging(pluginResults) {
    const data = [];

    pluginResults.beacons.forEach((beacon, index) => {
      data.push(beacon.minor);
      data.push(beacon.rssi);
    });

    this.send('player:beacons', this.playerId, data);
  }
}

export default PlayerExperience;