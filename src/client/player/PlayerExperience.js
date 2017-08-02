import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';
import Beacon from '../../shared/services/client/Beacon';
import ChooserView from '../shared/ChooserView';
import LoopPlayer from '../shared/instruments/LoopPlayer';
import instrumentFactory from '../shared/instruments/instrumentFactory';
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

    this.availableIds = new Set();
    this.chooserView = null;

    this.playerId = undefined;
    this.groupId = undefined;

    this.instrument = null;
    this.instruments = [];

    this.onAcknowledge = this.onAcknowledge.bind(this);
    this.onHomeButton = this.onHomeButton.bind(this);
    this.onChooserButton = this.onChooserButton.bind(this);
    this.onAcknowledgeId = this.onAcknowledgeId.bind(this);
    this.onAvailable = this.onAvailable.bind(this);
    this.onUnavailable = this.onUnavailable.bind(this);
    this.onActivate = this.onActivate.bind(this);
    this.onDeactivate = this.onDeactivate.bind(this);
    this.onGroup = this.onGroup.bind(this);

    this.onControl = this.onControl.bind(this);
    this.onBeaconRanging = this.onBeaconRanging.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.View('');
    this.view.$el.classList.add('black');

    this.show().then(() => {
      this.send('request');
      this.receive('acknowledge', this.onAcknowledge);
      this.receive('acknowledge-id', this.onAcknowledgeId);
      this.receive('available', this.onAvailable);
      this.receive('unavailable', this.onUnavailable);
      this.receive('activate', this.onActivate);
      this.receive('deactivate', this.onDeactivate);
      this.receive('group', this.onGroup);
      this.receive('control', this.onControl);
    });

    const mixSetup = this.audioBufferManager.data;
    const commonConfig = mixSetup.common;
    const loopPlayer = new LoopPlayer(this.metricScheduler, commonConfig.measureLength, commonConfig.tempo, commonConfig.tempoUnit, 0.05);
    const instrumentEnv = {
      screenContainer: this.view.$el,
      motionInput: this.motionInput,
      sendParam: this.sendIntrumentControl().bind(this),
      metricScheduler: this.metricScheduler,
      loopPlayer: loopPlayer,
    };

    // create instruments
    for (let name in mixSetup.instruments) {
      const instrumentSetup = mixSetup.instruments[name];
      const instrument = instrumentFactory.createInstrument(instrumentEnv, instrumentSetup.type, instrumentSetup);
      instrument.connect(audioContext.destination);
      this.instruments.push(instrument);
    }

  }

  showChooser() {
    const iconList = [];

    // set black view background
    this.view.$el.style.backgroundColor = '#000000';

    for (let prop in rawMixSetup.instruments)
      iconList.push(rawMixSetup.instruments[prop].icon.chooser);

    const chooserView = new ChooserView(iconList, this.availableIds, this.onChooserButton);
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
      this.chooserView.update();
    }
  }

  onChooserButton(id) {
    if (this.availableIds.has(id))
      this.send('request-id', id);
  }

  onAcknowledge(availableIds) {
    this.availableIds = new Set(availableIds);
    this.showChooser();
  }

  onAcknowledgeId(id) {
    this.hideChooser();
    this.enterApplication(id);
  }

  addHomeButton(instrument) {
    const container = instrument.view.$el;
    const button = document.createElement("div");
    button.classList.add('home-button');
    button.classList.add('white');
    button.addEventListener('touchstart', this.onHomeButton);
    container.appendChild(button);
  }

  removeHomeButton(instrument) {
    const container = instrument.view.$el;
    const button = container.querySelector('.home-button');
    container.removeChild(button);
  }

  updateHomeButton(foreground) {
    const button = container.querySelector('.home-button');

    if (button) {
      if (foreground == 'white') {
        button.classList.remove('black');
        button.classList.add('white');
      } else {
        button.classList.remove('white');
        button.classList.add('black');
      }
    }
  }

  onHomeButton() {
    this.exitApplication();
    this.showChooser();
  }

  stopInstruments() {
    for (let instrument of this.instruments) {
      instrument.hide();
      instrument.stop();
    }
  }

  startBeaconing(id) {
    this.beacon.minor = id;
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

  enterApplication(id) {
    this.playerId = id;
    this.availableIds.delete(id);

    const mixSetup = this.audioBufferManager.data;
    const instrument = this.instruments[id];
    instrument.show();
    instrument.start();
    this.instrument = instrument;

    this.addHomeButton(instrument);
    this.setGroupColor();
    this.startBeaconing(id);
  }

  exitApplication() {
    const id = this.playerId;

    if (id !== undefined) {
      this.removeHomeButton(this.instrument);

      this.stopBeaconing();
      this.stopInstruments();

      this.send('exit', id);

      this.playerId = undefined;
      this.groupId = undefined;

      this.instrument = null;
    }
  }

  sendIntrumentControl() {
    return (name, value) => this.send('control', this.playerId, name, value);
  }

  onAvailable(id) {
    this.availableIds.add(id);
    this.updateChooser();
  }

  onUnavailable(id) {
    this.availableIds.delete(id);
    this.updateChooser();
  }

  onActivate(ids, states) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const state = states[i];
      const instrument = this.instruments[id];
      instrument.setState(state);
      instrument.start();
    }
  }

  onDeactivate(ids) {
    for (let id of ids) {
      const instrument = this.instruments[id];
      instrument.stop();
    }
  }

  setGroupColor(group) {
    const instrument = this.instrument;

    if (instrument) {
      let background = '#000000';
      let foreground = 'white';

      if (group !== undefined) {
        const mixSetup = this.audioBufferManager.data;
        const colors = mixSetup.colors[group];

        background = colors.background;
        foreground = colors.foreground;
      }

      this.view.$el.style.backgroundColor = background;
      instrument.foreground = foreground;

      this.updateHomeButton(foreground);
    }
  }

  onGroup(id) {
    this.groupId = id;

    const instrument = this.instrument;
    if (instrument)
      this.setGroupColor(id);
  }

  onControl(id, name, value) {
    const instrument = this.instruments[id];
    instrument.setParam(name, value);
  }

  onBeaconRanging(pluginResults) {
    const data = [];

    pluginResults.beacons.forEach((beacon, index) => {
      const minor = beacon.minor;
      const rssi = beacon.rssi;

      if (minor < this.instruments.length && rssi < 0) {
        data.push(minor);
        data.push(rssi);
      }
    });

    if (data.length > 0)
      this.send('beacons', this.playerId, data);
  }}

export default PlayerExperience;
