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

    this.selectedPad = 0;

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
    const height = (window.innerHeight - margin) / (2 * numRows) - margin;
    const shiftToCenter = (height * numRows) / 2 + margin;

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
  }

  updatePadColor(id, color) {
    if (this.fillColors) {
      const newColor = (color + 1) % 2;
      const fillColor = this.fillColors[newColor];
      const pad = this.pads[id];

      pad.style.backgroundColor = fillColor;
    }
  }

  onTouchStartPad(id) {
    const instrument = this.instrument;
    const color = 0;
    return () => {
      instrument.nbOfPad.push(0);
      if (instrument.gain === undefined) {
        instrument.makeSound(id);
        this.updatePadColor(id, color);
      }
    };
  }

  onTouchEndPad(id) {
    const instrument = this.instrument;
    const color = 1;

    return () => {
      instrument.stopPadSound();
      this.updatePadColor(id, color);
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

    this.lastCutoff = 0;

    const nbOfPad = [];
    this.nbOfPad = nbOfPad;

    const audioContext = this.audioContext;
    this.minCutoffFreq = 5;
    this.maxCutoffFreq = audioContext.sampleRate / 2;
    this.logCutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    const src = audioContext.createBufferSource();
    this.src = src;
    this.src.start();

    const cutoff = audioContext.createBiquadFilter();
    cutoff.type = 'lowpass';
    cutoff.frequency.value = this.maxCutoffFreq;
    this.cutoff = cutoff;

    this.onAccelerationIncludingGravity = this.onAccelerationIncludingGravity.bind(this);
  }

  setCutoff(value) {
    const cutoffFreq = this.minCutoffFreq * Math.exp(this.logCutoffRatio * Math.sqrt(value));
    this.cutoff.frequency.value = cutoffFreq;
  }

  showScreen(environment) {
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
    this.cutoff.connect(output);
  }

  disconnect(output) {
    this.cutoff.disconnect(output);
  }

  set foreground(value) {
    if (this.view)
      this.view.setForegroudColor(value);
  }

  makeSound(index) {
    const sounds = this.setup.sounds;
    const sound = sounds[index];
    const src = this.audioContext.createBufferSource();
    const gain = this.audioContext.createGain();
    const time = this.currentTime;

    src.buffer = sound.buffer;
    src.connect(gain);
    gain.connect(this.cutoff);

    src.start(time);

    this.gain = gain;
    this.src = src;
  }

  stopPadSound() {
    if (this.gain) {
      if (this.nbOfPad.length < 2) {
        const gainNode = this.gain;
        const src = this.src;
        const time = this.currentTime;
        const fadeDuration = 1;

        gainNode.gain.setValueAtTime(1, time);
        gainNode.gain.linearRampToValueAtTime(0, time + fadeDuration);

        this.gain = undefined;
        src.stop(time + fadeDuration);
      }
      this.nbOfPad.splice(0, 1);
    }
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

      this.setCutoff(cutoff);
      this.environment.sendControl('cutoff', cutoff);
    }
  }
}

export default PadInstrument;
