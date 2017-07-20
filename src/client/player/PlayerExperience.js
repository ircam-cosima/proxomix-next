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

audioScheduler.lookahead = 0.1;
audioScheduler.period = 0.05;

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain, beaconUUID) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin');
    this.metricScheduler = this.require('metric-scheduler');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain + 'sounds/',
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

    this.playerId = null;
    this.intrumentConfig = null;
    this.activePlayers = null;
    this.availablePlayers = null;

    this.instruments = [];
    this.localInstrumentEnv = null;
    this.remoteInstrumentEnv = null;

    this.onBeaconRanging = this.onBeaconRanging.bind(this);
    this.onInstrumentControl = this.onInstrumentControl.bind(this);
    this.onPlayerAcknwoledge = this.onPlayerAcknwoledge.bind(this);
    this.onChooserButton = this.onChooserButton.bind(this);
    this.enterApplication = this.enterApplication.bind(this);

    this.onPlayerAvailable = this.onPlayerAvailable.bind(this);
    
    this.onPlayerEnter = this.onPlayerEnter.bind(this);
    this.onPlayerExit = this.onPlayerExit.bind(this);

    this.chooserView = new ChooserView(Object.keys(rawMixSetup.instruments), this.onChooserButton);
    this.chooserVisible = false;
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
    });
  }

  getInstrument(index) {
    let instrument = this.instruments[index];

    if (!instrument) {
      const mixSetup = this.audioBufferManager.data;
      const instrumentList = Object.keys(mixSetup.instruments);
      const instrumentId = instrumentList[index];
      const instrumentDescr = mixSetup.instruments[instrumentId];
      const instrumentEnv = (index === this.playerId) ? this.localInstrumentEnv : this.remoteInstrumentEnv;
      this.instruments[index] = instrument = instrumentFactory.createInstrument(instrumentEnv, instrumentDescr.type, instrumentDescr);
    }

    return instrument;
  }

  onPlayerAvailable(playerId) {
    this.availablePlayers.add(playerId);
  }

  onPlayerEnter(playerId) {
    this.availablePlayers.delete(playerId);
    this.activePlayers.add(playerId);
  }

  onPlayerExit(playerId) {
    this.activePlayers.delete(playerId);

    this.mixer.setAutomation(playerId, 0, 0.05);

    const instrument = this.instruments[playerId];
    if (instrument)
      instrument.active = false;
  }

  onPlayerAcknwoledge(availabalePlayers, activePlayers) {
    this.receive('player:available', this.onPlayerAvailable);
    this.receive('player:enter', this.onPlayerEnter);

    this.availabalePlayers = new Set(availabalePlayers);
    this.activePlayers = new Set(activePlayers);

    this.showChooser();
  }

  onChooserButton(playerId) {
    this.playerId = playerId;
    this.hideChooser();
    this.enterApplication();
  }

  showChooser() {
    this.chooserVisible = true;

    const chooserView = this.chooserView;
    chooserView.render();
    chooserView.show();
    chooserView.appendTo(this.view.$el);
    this.chooserView = chooserView;
  }

  hideChooser() {
    if(this.chooserVisible)
      this.chooserView.remove();
  }

  updateChooser() {
    if(this.chooserVisible) {

    }
  }

  enterApplication() {
    const mixSetup = this.audioBufferManager.data;
    const instrumentList = Object.keys(mixSetup.instruments);
    const numInstruments = instrumentList.length;
    const commonConfig = mixSetup.common;

    this.applicationRunning = true;
    this.send('player:enter', this.playerId);

    const loopPlayer = new LoopPlayer(this.metricScheduler, commonConfig.measureLength, commonConfig.tempo, commonConfig.tempoUnit, 0.05);

    this.localInstrumentEnv = {
      screenContainer: this.view.$el,
      motionInput: this.motionInput,
      sendControl: this.sendIntrumentControl(this.playerId),
      metricScheduler: this.metricScheduler,
      loopPlayer: loopPlayer,
    };

    this.remoteInstrumentEnv = {
      screenContainer: null,
      motionInput: null,
      sendControl: null,
      metricScheduler: this.metricScheduler,
      loopPlayer: loopPlayer,
    };

    // init audio
    this.mixer = new Mixer(this.metricScheduler);
    this.mixer.connect(audioContext.destination);

    // loop track test
    for (let index = 0; index < numInstruments; index++) {
      const instrument = this.getInstrument(index);

      // add instrement to mixer
      this.mixer.createChannel(index, instrument);

      const debug = false;

      // init view if local instrument
      if (index === this.playerId) {
        instrument.visible = true;
        instrument.active = true;
        this.mixer.setGain(index, 1);
      } else if (debug) {
        instrument.active = true;
        this.mixer.setGain(index, 0.5);
      }
    }

    const instrument = this.instruments[this.playerId];
    const container = instrument.view.$el;
    const button = document.createElement("div");
    button.classList.add('home-button');
    container.appendChild(button);

    this.receive('instrument:control', this.onInstrumentControl);

    this.beacon.minor = this.playerId;
    this.beacon.addListener(this.onBeaconRanging);
    this.beacon.startAdvertising();
    this.beacon.startRanging();
  }

  exitApplication() {
    this.applicationRunning = false;
  }

  sendIntrumentControl(playerId) {
    return (name, value) => this.send('instrument:control', playerId, name, value);
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
