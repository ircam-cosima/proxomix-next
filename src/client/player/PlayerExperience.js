import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';
import Beacon from '../../shared/services/client/Beacon';
import Mixer from './Mixer';
import LoopPlayer from './LoopPlayer';
import CircularView from './instrument/CircularView';
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

const viewTemplate = `
  <div class="background fit-container">
    <div class="section-top flex-middle">
      <% if (run) { %><p class="big bold">ProXoMix</p><% } %>
    </div>

    <% if (run) { %>
    <div class="section-center flex-center run">
    <% } else { %>
    <div class="section-center flex-center">
    <% } %>
      <% if (wait) { %><p>Please wait...</p><% } %>
      <% if (sorry) { %><p>Sorry,<br />no place available</p><% } %>
    </div>

    <div class="section-bottom flex-middle">
      <% if (run) { %>
        <p class="small soft-blink">Touch the screen to join!</p>
      <% } %>
    </div>
  </div>
  <div class="foreground fit-container" id="instrument-container"></div>
`;

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

    this.onAccelerationIncludingGravity = this.onAccelerationIncludingGravity.bind(this);
    this.onBeaconRanging = this.onBeaconRanging.bind(this);
    this.onCutoffControl = this.onCutoffControl.bind(this);
    this.onPlayerEntered = this.onPlayerEntered.bind(this);
    this.onPlayerExit = this.onPlayerExit.bind(this);
    this.runAudioPreview = this.runAudioPreview.bind(this);
    this.runApplication = this.runApplication.bind(this);
    this.refuseApplication = this.refuseApplication.bind(this);
  }

  start() {
    super.start();

    const viewModel = {
      wait: true,
      run: false,
      sorry: false,
    };
    this.view = new soundworks.SegmentedView(viewTemplate, viewModel, {}, {});
    this.show();

    if (client.urlParams !== null) {
      const intrumentName = client.urlParams.join('-');
      const index = instrumentList.indexOf(intrumentName);

      if (index !== -1)
        this.playerId = index;
    }

    this.lastCutoff = -Infinity;

    this.send('player:enter', this.playerId);
    this.receive('player:ack', this.runAudioPreview);
    this.receive('player:refused', this.refuseApplication);
  }

  refuseApplication() {
    this.view.model.wait = false;
    this.view.model.sorry = true;
    this.view.render('.background');
  }

  runAudioPreview(playerId, playerIds) {
    const audioSetup = this.audioBufferManager.data;
    const instrumentId = instrumentList[playerId];
    const instrumentConfig = audioSetup.instruments[instrumentId];
    let loop = instrumentConfig.loop;

    if(Array.isArray(loop)) {
      const previewSegmentIndex = instrumentConfig.preview || 0;
      loop = loop[previewSegmentIndex];
    }

    const time = audioContext.currentTime;
    const measureDuration = audioSetup.common.measureDuration;
    const fadeTime = 0.05;

    const env = audioContext.createGain();
    env.connect(audioContext.destination);
    env.gain.value = 0;
    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(1, time + fadeTime);

    const src = audioContext.createBufferSource();
    src.connect(env);
    src.buffer = loop.audioBuffer;
    src.start(time, loop.startOffset - fadeTime);
    src.loopStart = loop.startOffset;
    src.loopEnd = loop.startOffset + loop.length * measureDuration;
    src.loop = true;

    const length = 2;
    const endTime = time + length * measureDuration;
    env.gain.setValueAtTime(1, endTime);
    env.gain.linearRampToValueAtTime(0, endTime + fadeTime);
    src.stop(endTime + fadeTime);

    this.view.model.wait = false;
    this.view.model.run = true;
    this.view.render('.background');

    // console.log(client.platform);
    const interaction = client.platform.interaction === 'touch' ?
      'touchstart' : 'mousedown';

    this.view.installEvents({
      [interaction]: () => {
        this.view.installEvents({}, true);
        this.view.model.run = false;
        this.view.render('.background');

        // launch the actual application
        this.runApplication(playerId, playerIds);
      },
    });
  }

  runApplication(playerId, playerIds) {
    this.playerId = playerId;
    this.playerIds = new Set(playerIds);

    if (this.playerId >= instrumentList.length)
      throw new Error(`Invalid (out of range) playerId - something doesn't work properly`);

    console.log(instrumentList);
    console.log(`=> Running "${instrumentList[this.playerId]}" instrument (id: ${this.playerId})`);

    // init audio
    this.loopPlayer = new LoopPlayer(this.metricScheduler, 4 / 4, 121, 1 / 4, 0.05);

    this.mixer = new Mixer(this.metricScheduler);
    this.mixer.connect(audioContext.destination);

    // create instruments
    const audioSetup = this.audioBufferManager.data;
    const commonConfig = audioSetup.common;
    const metricScheduler = this.metricScheduler;
    const playerInstrumentId = instrumentList[this.playerId];
    const isSolo = audioSetup.instruments[playerInstrumentId].solo;

    // loop track test
    for (let index = 0; index < numInstruments; index++) {
      const instrumentId = instrumentList[index];
      const instrumentConfig = audioSetup.instruments[instrumentId];
      // init instrument audio
      const loop = instrumentConfig.loop;
      const audioBuffer = loop.buffer;

      const loopTrack = this.loopPlayer.addLoopTrack(index, loop);
      this.mixer.createChannel(index, loopTrack);

      // @debug: start all instruments
      // const gain = (i === this.playerId) ? 1 : 0.1;
      // this.mixer.setGain(instrumentId, gain);
      // loopTrack.active = true;

      // init view if local instrument
      if (index === this.playerId) {
        this.mixer.setGain(index, 1);
        loopTrack.active = true;

        const displayConfig = instrumentConfig.display;

        if (displayConfig) {
          displayConfig.playerId = this.playerId;
          const instrumentView = new CircularView(commonConfig, displayConfig, metricScheduler);
          instrumentView.render();
          instrumentView.show();
          instrumentView.appendTo(this.view.$el.querySelector('#instrument-container'));
        }
      }
    }

    this.motionInput.addListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);

    this.receive('cutoff:control', this.onCutoffControl);
    this.receive('player:entered', this.onPlayerEntered);
    this.receive('player:exit', this.onPlayerExit);

    this.beacon.minor = this.playerId;
    this.beacon.addListener(this.onBeaconRanging);
    this.beacon.startAdvertising();
    this.beacon.startRanging();
  }

  onAccelerationIncludingGravity(data) {
    const accX = data[0];
    const accY = data[1];
    const accZ = data[2];

    const pitch = 2 * Math.atan2(accY, Math.sqrt(accZ * accZ + accX * accX)) / Math.PI;
    const roll = -2 * Math.atan2(accX, Math.sqrt(accY * accY + accZ * accZ)) / Math.PI;
    const cutoff = 0.5 + Math.max(-0.8, Math.min(0.8, (accZ / 9.81))) / 1.6;

    if (Math.abs(cutoff - this.lastCutoff) > 0.01) {
      this.lastCutoff = cutoff;
      // update local audio
      this.loopPlayer.setCutoff(this.playerId, cutoff);
      // update server (hence neighbors)
      this.send('cutoff:control', this.playerId, cutoff);
    }
  }

  onCutoffControl(playerId, value) {
    this.loopPlayer.setCutoff(playerId, value);
  }

  onPlayerEntered(playerId) {
    this.playerIds.add(playerId);
  }

  onPlayerExit(playerId) {
    // reset mixer and stop track
    this.mixer.setAutomation(playerId, 0, 0.05);
    this.loopPlayer.getLoopTrack(playerId).active = false;

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
