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
      txPower: -55,
      major: 0,
      skipService: false,
      debug: false,
    };

    beaconConfig.emulate = (!!window.cordova) ? null : { numPeers: 0 };
    this.beacon = this.require('beacon', beaconConfig);

    this.chooserView = null;

    this.playerId = undefined;
    this.intrumentConfig = null;
    this.activePlayers = null;
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
    if(this.availablePlayers.has(playerId))
      this.send('player:id', playerId);
  }

  onPlayerAcknwoledge(availablePlayers, activePlayers) {
    this.availablePlayers = new Set(availablePlayers);
    this.activePlayers = new Set(activePlayers);
    this.showChooser();
  }

  onPlayerConfirm(playerId) {
    if (playerId !== undefined) {
      this.hideChooser();
      this.enterApplication(playerId);
    }
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

  startInstruments() {
    const mixSetup = this.audioBufferManager.data;
    const instrumentList = Object.keys(mixSetup.instruments);
    const numInstruments = instrumentList.length;

    for (let i = 0; i < numInstruments; i++) {
      let instrument = this.instruments[i];

      // create instrument if necessary
      if (!instrument) {
        const instrumentId = instrumentList[i];
        const instrumentDescr = mixSetup.instruments[instrumentId];
        instrument = instrumentFactory.createInstrument(this.instrumentEnv, instrumentDescr.type, instrumentDescr);
        this.instruments[i] = instrument;
      }

      // add instrement to mixer
      this.mixer.createChannel(i, instrument);

      const debug = false;

      if (i === this.playerId) {
        instrument.visible = true;
        instrument.active = true;
        this.mixer.setGain(i, 1);
        this.addHomeButton(instrument);
      } else if (debug) {
        instrument.active = true;
        this.mixer.setGain(i, 0.5);
      }
    }
  }

  stopInstruments() {
    for (let instrument of this.instruments) {
      if (instrument) {
        instrument.visible = false;
        instrument.active = false;
      }
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
    this.activePlayers.add(playerId);
    this.send('player:enter', this.playerId);

    this.startInstruments();
    this.startBeaconing();
  }

  exitApplication() {
    const playerId = this.playerId;

    if (playerId !== undefined) {
      this.stopBeaconing();
      this.stopInstruments();

      this.activePlayers.delete(playerId);
      this.send('player:exit', playerId);

      this.playerId = undefined;
    }
  }

  sendIntrumentControl(playerId) {
    return (name, value) => this.send('instrument:control', playerId, name, value);
  }

  onPlayerEnter(playerId) {
    this.availablePlayers.delete(playerId);
    this.activePlayers.add(playerId);
    this.updateChooser();
  }

  onPlayerExit(playerId) {
    this.activePlayers.delete(playerId);

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

  /**
   * @warning - a peer who kill its app still send beacon informations for
   * around 10 seconds. That's why we must keep a booking of the connected
   * clientts according to the server informations.
   */
  onBeaconRanging(pluginResults) {
    const offThreshold = -60;

    pluginResults.beacons.forEach((beacon, index) => {
      if (beacon.minor === this.playerId)
        throw new Error('Invalid peer beacon minor, is equal to this.playerId');

      const playerId = beacon.minor;

      // prevent exited players to trigger automation and activation
      if (this.activePlayers.has(playerId)) {
        const estimatedDistance = this.beacon.rssiToDist(beacon.rssi);
        const constRadius = 1;
        const offRadius = 3;
        let gain = 0;

        if (estimatedDistance < offRadius) {
          gain = 1;

          if (estimatedDistance > constRadius) {
            const level = offThreshold * (estimatedDistance - constRadius) / (offRadius - constRadius);
            gain = decibelToLinear(level);
          }
        }

        this.mixer.setAutomation(playerId, gain, 0.5);
      }
    });
  }
}

export default PlayerExperience;
