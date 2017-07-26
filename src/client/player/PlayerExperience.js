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

audioScheduler.lookahead = 0.30;
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
    this.groupId = undefined;
    this.intrumentConfig = null;
    this.availablePlayers = null;

    this.instrument = null;
    this.instruments = [];
    this.instrumentEnv = null;

    this.onPlayerAcknwoledge = this.onPlayerAcknwoledge.bind(this);
    this.onHomeButton = this.onHomeButton.bind(this);
    this.onChooserButton = this.onChooserButton.bind(this);
    this.onPlayerConfirm = this.onPlayerConfirm.bind(this);
    this.onPlayerAvailable = this.onPlayerAvailable.bind(this);
    this.onPlayerUnavailable = this.onPlayerUnavailable.bind(this);
    this.onPlayerActivate = this.onPlayerActivate.bind(this);
    this.onPlayerDisactivate = this.onPlayerDisactivate.bind(this);
    this.onPlayerGroup = this.onPlayerGroup.bind(this);

    this.onInstrumentControl = this.onInstrumentControl.bind(this);
    this.onBeaconRanging = this.onBeaconRanging.bind(this);
  }

  start() {
    super.start();

    const viewModel = {
      sorry: false,
    };
    const colors = this.audioBufferManager.data.colors;

    this.view = new soundworks.View('');
    this.view.$el.style.backgroundColor = colors[client.index].background;
    this.view.$el.classList.add('black');


    this.show().then(() => {
      this.send('player:request');
      this.receive('player:acknowledge', this.onPlayerAcknwoledge);
      this.receive('player:confirm', this.onPlayerConfirm);
      this.receive('player:available', this.onPlayerAvailable);
      this.receive('player:unavailable', this.onPlayerUnavailable);
      this.receive('player:activate', this.onPlayerActivate);
      this.receive('player:disactivate', this.onPlayerDisactivate);
      this.receive('player:group', this.onPlayerGroup);
      this.receive('instrument:control', this.onInstrumentControl);
    });

    const mixSetup = this.audioBufferManager.data;
    const commonConfig = mixSetup.common;
    const loopPlayer = new LoopPlayer(this.metricScheduler, commonConfig.measureLength, commonConfig.tempo, commonConfig.tempoUnit, 0.05);

    this.instrumentEnv = {
      screenContainer: this.view.$el,
      motionInput: this.motionInput,
      sendControl: this.sendIntrumentControl().bind(this),
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
    const colors = this.audioBufferManager.data.colors;
    const foregroundColor = colors[client.index].foreground;

    for (let prop in rawMixSetup.instruments)
      iconList.push(rawMixSetup.instruments[prop].icon.chooser);

    const chooserView = new ChooserView(iconList, this.availablePlayers, this.onChooserButton, foregroundColor);
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

    const mixSetup = this.audioBufferManager.data;
    const instrument = this.instruments[playerId];
    instrument.foreground = mixSetup.colors[playerId].foreground;
    instrument.visible = true;
    instrument.active = true;
    this.instrument = instrument;

    this.addHomeButton(instrument);
    this.mixer.setGain(playerId, 1);

    this.startBeaconing();
  }

  exitApplication() {
    const playerId = this.playerId;

    if (playerId !== undefined) {
      this.stopBeaconing();
      this.stopInstruments();

      this.send('player:exit', playerId);

      this.playerId = undefined;
      this.groupId = undefined;

      this.setGroupColor();
      this.instrument = null;
    }
  }

  sendIntrumentControl() {
    return (name, value) => this.send('instrument:control', this.playerId, name, value);
  }

  onPlayerAvailable(playerId) {
    this.availablePlayers.add(playerId);
    this.updateChooser();
  }

  onPlayerUnavailable(playerId) {
    this.availablePlayers.delete(playerId);
    this.updateChooser();
  }

  onPlayerActivate(playerIds) {
    for (let id of playerIds) {
      this.mixer.setAutomation(id, 1, 0.05);

      const instrument = this.instruments[id];
      instrument.active = true;
    }
  }

  onPlayerDisactivate(playerIds) {
    for (let id of playerIds) {
      this.mixer.setAutomation(id, 0, 0.05);

      const instrument = this.instruments[id];
      instrument.active = false;
    }
  }

  setGroupColor(groupId) {
    const instrument = this.instrument;

    if (instrument) {
      let background = '#000000';
      let foreground = 'white';

      if (groupId !== undefined) {
        const mixSetup = this.audioBufferManager.data;
        const colors = mixSetup.colors[groupId];

        background = colors.background;
        background = colors.foreground;
      }

      this.view.$el.style.backgroundColor = background;
      instrument.foreground = foreground;
    }
  }

  onPlayerGroup(groupId) {
    this.groupId = groupId;
    this.setGroupColor(groupId);
  }

  onInstrumentControl(playerId, name, value) {
    const instrument = this.instruments[playerId];
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