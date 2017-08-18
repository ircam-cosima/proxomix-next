import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';
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

const template = `
  <div class="foreground fit-container">
    <div class="tutti flex-middle huge">Tutti</div>
  </div>
`;

class TuttiExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'], showDialog: false });
    this.sharedParams = this.require('shared-params');
    this.metricScheduler = this.require('metric-scheduler');

    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      files: rawMixSetup
    });

    this.instruments = [];
    this.activeIds = new Set();

    const lowpass2 = audioContext.createBiquadFilter();
    lowpass2.connect(audioContext.destination);
    lowpass2.type = 'lowpass';
    lowpass2.frequency.value = 250;

    const lowpass1 = audioContext.createBiquadFilter();
    lowpass1.connect(lowpass2);
    lowpass1.type = 'lowpass';
    lowpass1.frequency.value = 250;

    const gain = audioContext.createGain();
    gain.connect(lowpass1);    

    this.gain = gain;
    this.lowpass1 = lowpass1;
    this.lowpass2 = lowpass2;

    this.chooserView = null;

    this.onAcknowledge = this.onAcknowledge.bind(this);
    this.onActivate = this.onActivate.bind(this);
    this.onDeactivate = this.onDeactivate.bind(this);
    this.onControl = this.onControl.bind(this);
  }

  start() {
    super.start();

    this.view = new soundworks.View(template);

    this.show().then(() => {
      this.send('request');
      this.receive('acknowledge', this.onAcknowledge);
      this.receive('activate', this.onActivate);
      this.receive('deactivate', this.onDeactivate);
      this.receive('control', this.onControl);

      this.showChooser();
    });

    const mixSetup = this.audioBufferManager.data;
    const commonConfig = mixSetup.common;
    const loopPlayer = new LoopPlayer(this.metricScheduler, commonConfig.measureLength, commonConfig.tempo, commonConfig.tempoUnit, 0.05);

    const instrumentEnv = {
      metricScheduler: this.metricScheduler,
      loopPlayer: loopPlayer,
    };

    // create instruments
    for (let name in mixSetup.instruments) {
      const instrumentSetup = mixSetup.instruments[name];
      const instrument = instrumentFactory.createInstrument(instrumentEnv, instrumentSetup.type, instrumentSetup);
      instrument.connect(this.gain);
      this.instruments.push(instrument);
    }

    this.sharedParams.addParamListener('tuttiCutoff', (value) => this.setCutoff(value));
    this.sharedParams.addParamListener('tuttiGain', (value) => this.setGain(value));
  }

  setCutoff(value) {
    this.lowpass1.frequency.value = value;
    this.lowpass2.frequency.value = value;
  }

  setGain(value) {
    this.gain.gain.value = decibelToLinear(value);
  }

  showChooser() {
    const iconList = [];

    for (let prop in rawMixSetup.instruments)
      iconList.push(rawMixSetup.instruments[prop].icon.chooser);

    const chooserView = new ChooserView(iconList, this.activeIds);
    chooserView.render();
    chooserView.show();
    chooserView.appendTo(this.view.$el);
    this.chooserView = chooserView;
  }

  onAcknowledge(ids, states) {
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      const state = states[i];
      this.onActivate(id, state);
    }
  }

  onActivate(id, state) {
    const instrument = this.instruments[id];
    instrument.setState(state);
    instrument.start();

    this.activeIds.add(id);
    this.chooserView.update();
  }

  onDeactivate(id) {
    const instrument = this.instruments[id];
    instrument.stop();

    this.activeIds.delete(id);
    this.chooserView.update();
  }

  onControl(id, name, value) {
    const instrument = this.instruments[id];
    instrument.setParam(name, value);
  }
}

export default TuttiExperience;