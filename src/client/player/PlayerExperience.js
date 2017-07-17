import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';
import Beacon from '../../shared/services/client/Beacon';
import Mixer from './Mixer';
import LoopPlayer from './LoopPlayer';
import instrumentFactory from './instrumentFactory';
import setup from '../../shared/setup';

const client = soundworks.client;
const audio = soundworks.audio;
const audioContext = soundworks.audioContext;
const audioScheduler = soundworks.audio.getScheduler();

audioScheduler.lookahead = 0.1;
audioScheduler.period = 0.05;

const instrumentList = Object.keys(setup.instruments);
const numInstruments = instrumentList.length;

const tempo = 121;
const beatDuration = 60 / tempo;
const measureDuration = 4 * beatDuration;

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain, beaconUUID) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.metricScheduler = this.require('metric-scheduler');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain + 'sounds/',
      files: setup
    });

    this.motionInput = this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity'],
    });

    const beaconConfig = {
      uuid: beaconUUID,
      txPower: -55, // in dB (see beacon service for detail)
      major: 0,
      skipService: false,
      debug: false,
    };

    beaconConfig.emulate = (!!window.cordova) ? null : { numPeers: 0 };
    this.beacon = this.require('beacon', beaconConfig);

    this.playerId = null;
    this.intrumentConfig = null;
    this.playerIds = null;

    this.instruments = [];
    this.localInstrumentEnv = null;
    this.remoteInstrumentEnv = null;

    this.onBeaconRanging = this.onBeaconRanging.bind(this);
    this.onInstrumentControl = this.onInstrumentControl.bind(this);
    this.onPlayerEntered = this.onPlayerEntered.bind(this);
    this.onPlayerExit = this.onPlayerExit.bind(this);
    this.runApplication = this.runApplication.bind(this);
    this.refuseApplication = this.refuseApplication.bind(this);
  }

  start() {
    super.start();

    const viewModel = {
      sorry: false,
    };

    this.view = new soundworks.View('');

    this.show().then(() => {
      if (client.urlParams !== null) {
        const intrumentName = client.urlParams.join('-');
        const index = instrumentList.indexOf(intrumentName);

        if (index !== -1)
          this.playerId = index;
      }

      this.send('player:enter', this.playerId);
      this.receive('player:ack', this.runApplication);
      this.receive('player:refused', this.refuseApplication);
    });
  }

  getInstrument(index) {
    let instrument = this.instruments[index];

    if (!instrument) {
      const audioSetup = this.audioBufferManager.data;
      const instrumentId = instrumentList[index];
      const instrumentDescr = audioSetup.instruments[instrumentId];
      const instrumentEnv = (index === this.playerId) ? this.localInstrumentEnv : this.remoteInstrumentEnv;
      this.instruments[index] = instrument = instrumentFactory.createInstrument(instrumentEnv, instrumentDescr.type, instrumentDescr);
    }

    return instrument;
  }

  refuseApplication() {
    console.log('Sorry, no place :-(');
  }

  runApplication(playerId, playerIds) {
    const audioSetup = this.audioBufferManager.data;
    const commonConfig = audioSetup.common;

    this.playerId = playerId;
    this.playerIds = new Set(playerIds);

    if (this.playerId >= instrumentList.length)
      throw new Error(`Invalid (out of range) playerId - something doesn't work properly`);

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

    // create instruments
    const playerInstrumentId = instrumentList[this.playerId];

    // loop track test
    for (let index = 0; index < numInstruments; index++) {
      const instrument = this.getInstrument(index);

      // add instrement to mixer
      this.mixer.createChannel(index, instrument);

      const debug = true;

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

    this.receive('instrument:control', this.onInstrumentControl);
    this.receive('player:entered', this.onPlayerEntered);
    this.receive('player:exit', this.onPlayerExit);

    this.beacon.minor = this.playerId;
    this.beacon.addListener(this.onBeaconRanging);
    this.beacon.startAdvertising();
    this.beacon.startRanging();
  }

  sendIntrumentControl(playerId) {
    return (name, value) => this.send('instrument:control', playerId, name, value);
  }

  onInstrumentControl(playerId, name, value) {
    const instrument = this.instruments[playerId];

    if (instrument)
      instrument.setControl(name, value);
  }

  onPlayerEntered(playerId) {
    this.playerIds.add(playerId);
  }

  onPlayerExit(playerId) {
    // reset mixer and stop track
    this.mixer.setAutomation(playerId, 0, 0.05);

    const instrument = this.instruments[playerId];
    if (instrument)
      instrument.active = false;

    this.playerIds.delete(playerId);
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
      if (this.playerIds.has(playerId)) {
        const instrumentId = instrumentList[playerId];
        const instrument = setup.instruments[instrumentId];
        const estimatedDistance = this.beacon.rssiToDist(beacon.rssi);
        const constRadius = instrument.constRadius !== undefined ? instrument.constRadius : 1;
        const offRadius = instrument.offRadius !== undefined ? instrument.offRadius : 3;
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
