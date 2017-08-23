import * as soundworks from 'soundworks/client';
import instrumentFactory from './instrumentFactory';
import Instrument from './Instrument';

const template = `
  <canvas class="background"></canvas>
  <div class="foreground fit-container">
    <div class="section-top"></div>
    <div class="section-center flex-middle">
      <div class="chooser-container"></div>
    </div>
    <div class="section-bottom"></div>
  </div>
`;


const fillColorsWhite = [
  'rgba(255, 255, 255, 0.3)',
  'rgba(255, 255, 255, 0.8)',
];

const fillColorsBlack = [
  'rgba(0, 0, 0, 0.3)',
  'rgba(0, 0, 0, 0.8)',
];


class PadView extends soundworks.CanvasView {
  constructor(instrument, setup) {
    super(template, {
      icon: setup.icon.instrument.white,
    }, {}, {
      preservePixelRatio: false,
      skipFrames: 3,
      ratios: {
        '.section-top': 0,
        '.section-center': 1,
        '.section-bottom': 0,
      }
    });

    this.instrument = instrument;
    this.setup = setup;

    this.touchSurface = null;

    this.selectedPad = -1;

    this.length = setup.length;
    this.setup = setup;

    this.onTouchStartPad = this.onTouchStartPad.bind(this);
    this.onTouchEndPad = this.onTouchEndPad.bind(this);

  }

  init() {
    super.init();

    this.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

    const instrument = this.instrument;
    const container = this.$el.querySelector('.chooser-container');

    const numPads = this.setup.sounds.length;

    const margin = 20;
    const numRows = Math.ceil(numPads / 2);
    const numCols = 2;
    const width = (window.innerWidth - margin) / numCols - margin;
    const height = width;
    const shiftToCenter = (window.innerHeight - height * numRows) / 2 - margin;

    this.pads = [];

    for (let i = 0; i < numPads; i++) {
      const col = i % numCols;
      const row = Math.floor(i / numCols);
      const left = margin + col * (width + margin);
      const top = margin + row * (height + margin);
      const pad = document.createElement("div");

      pad.classList.add('chooser-pad');
      pad.style.width = `${width}px`;
      pad.style.height = `${height}px`;
      pad.style.left = `${left}px`;
      pad.style.top = `${top + shiftToCenter}px`;
      pad.style.borderColor = "white";
      pad.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      pad.addEventListener('touchstart', this.onTouchStartPad(i), false);
      pad.addEventListener('touchend', this.onTouchEndPad(i), false);


      container.appendChild(pad);
      this.pads.push(pad);
    }
  }

  remove() {
    super.remove();
  }

  setForegroudColor(color) {
    const isWhite = (color == 'white');
    const fillColors = isWhite ? fillColorsWhite : fillColorsBlack;

    this.fillColors = fillColors;

    for(let i = 0; i < this.pads.length; i++)
      this.updatePadColor(i, (i !== this.selectedPad));
  }

  updatePadColor(id, color) {
    const newColor = (color + 1) % 2;
    const fillColor = this.fillColors[newColor];
    const pad = this.pads[id];

    pad.style.backgroundColor = fillColor;
  }

  onTouchStartPad(id) {
    const instrument = this.instrument;

    return () => {
      if (this.selectedPad < 0) {
        this.selectedPad = id;
        instrument.setSound(id, true);
        this.updatePadColor(id, 0);
      }
    };
  }

  onTouchEndPad(id) {
    const instrument = this.instrument;

    return () => {
      if(id === this.selectedPad) {
        this.selectedPad = -1;
        instrument.setSound(-1, true);
        this.updatePadColor(id, 1);
      }
    };
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);
    this._boundingClientRect = this.$el.getBoundingClientRect();
  }
}


class PadInstrument extends Instrument {
  constructor(environment, setup) {
    super(environment, setup);

    this.view = null;

    this.setup = setup;

    this.sound = -1;
    this.cutoff = 0;

    const audioContext = this.audioContext;
    this.minCutoffFreq = 5;
    this.maxCutoffFreq = audioContext.sampleRate / 2;
    this.logCutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.maxCutoffFreq;
    this.filter = filter;

    this.onAccelerationIncludingGravity = this.onAccelerationIncludingGravity.bind(this);
  }

  resetState() {
    this.cutoff = 1;
    this.sound = -1;
  }

  setSound(value, send) {
    this.sound = value;

    if(value >= 0)
      this.startPadSound(value);
    else
      this.stopPadSound();

    if (send)
      this.sendParam('sound', value);
  }

  setCutoff(value, send) {
    const cutoffFreq = this.minCutoffFreq * Math.exp(this.logCutoffRatio * Math.sqrt(value));
    this.filter.frequency.value = cutoffFreq;

    if (send)
      this.sendParam('cutoff', value);
  }

  setParam(name, value) {
    switch (name) {
      case 'cutoff':
        this.setCutoff(value, false);
        break;

      case 'sound':
        this.setSound(value, false);
        break;
    }
  }

  showScreen() {
    const view = new PadView(this, this.setup);
    this.addView(view);
    this.addMotionListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  hideScreen() {
    this.removeView();
    this.removeMotionListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  startSound() {}

  stopSound() {
    this.stopPadSound();
  }

  connect(output) {
    this.filter.connect(output);
  }

  disconnect(output) {
    this.filter.disconnect(output);
  }

  set foreground(value) {
    if (this.view)
      this.view.setForegroudColor(value);
  }

  startPadSound(index) {
    if (!this.src) {
      const sounds = this.setup.sounds;
      const sound = sounds[index];
      const src = this.audioContext.createBufferSource();
      const gain = this.audioContext.createGain();
      const time = this.currentTime;

      src.buffer = sound.buffer;
      src.connect(gain);
      gain.connect(this.filter);

      src.start(time);

      this.gain = gain;
      this.src = src;
    }
  }

  stopPadSound() {
    if (this.src) {
      const gainNode = this.gain;
      const src = this.src;
      const time = this.currentTime;
      const fadeDuration = 1;

      gainNode.gain.setValueAtTime(1, time);
      gainNode.gain.linearRampToValueAtTime(0, time + fadeDuration);

      src.stop(time + fadeDuration);

      this.gain = undefined;
      this.src = undefined;
    }
  }

  onAccelerationIncludingGravity(data) {
    const accX = data[0];
    const accY = data[1];
    const accZ = data[2];
    const pitch = 2 * Math.atan2(accY, Math.sqrt(accZ * accZ + accX * accX)) / Math.PI;
    const roll = -2 * Math.atan2(accX, Math.sqrt(accY * accY + accZ * accZ)) / Math.PI;
    const cutoff = Math.max(0, Math.min(1, 0.5 + accZ / (9.81 * 1.6))); // ±0.8 * 9.81 --> 0...1

    if (Math.abs(cutoff - this.cutoff) > 0.01)
      this.setCutoff(cutoff, true);
  }
}

export default PadInstrument;
