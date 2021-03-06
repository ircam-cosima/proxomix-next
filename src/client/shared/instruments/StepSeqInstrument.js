import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';
import Instrument from './Instrument';

const template = `
  <canvas class="background"></canvas>
  <div class="foreground fit-container">
    <div class="section-top"></div>
    <div class="section-center flex-middle">
      <div class="inst-icon-container">
        <div class="inst-icon" style="background-image: url(<%= icon %>)"></div>
      </div>
       <div class="loop-button-container"></div>
    </div>
    <div class="section-bottom"></div>
  </div>
`;

const highlightColorWhite = '#ffffff';
const highlightColorBlack = '#000000';

const seqColorsBlack = [
  'rgba(0, 0, 0, 0.3)',
  'rgba(0, 0, 0, 0.6)',
  'rgba(0, 0, 0, 0.8)',
];

const seqColorsWhite = [
  'rgba(255, 255, 255, 0.3)',
  'rgba(255, 255, 255, 0.6)',
  'rgba(255, 255, 255, 0.8)',
];

const stepColorBlack = '#000000';
const stepColorWhite = '#ffffff';

const iconsWhite = [
  "url('icons/button-stepseq-1-white.png')",
  "url('icons/button-stepseq-2-white.png')",
  "url('icons/button-stepseq-3-white.png')",
];

const iconsBlack = [
  "url('icons/button-stepseq-1-black.png')",
  "url('icons/button-stepseq-2-black.png')",
  "url('icons/button-stepseq-3-black.png')",
];

function radToDegrees(radians) {
  return radians * 180 / Math.PI;
}

function createArray(length) {
  const array = [];

  for(let i = 0; i < length; i++)
    array.push(0);

  return array;
}

function copyArray(length) {
  const array = [];

  for(let i = 0; i < length; i++)
    array.push(0);

  return array;
}

function cloneArray(array) {
  const copy = [];

  for(let e of array)
    copy.push(e);

  return copy;
}

function fillQuantile(quantile, numActives, numSounds) {
  const length = quantile.length;
  let sum = 0;
  let idx = numSounds;
  let k = 0;

  for (let i = 0; i < numSounds; i++) {
    sum += numActives;

    if (sum > length)
      sum = length;

    while (k < sum) {
      quantile[length - 1 - k] = idx;
      k++;
    }

    idx--;
  }

  while (k < length) {
    quantile[length - 1 - k] = 0;
    k++;
  }
}

function getRandomFromQuantile(quantile) {
  const length = quantile.length;
  const i = Math.floor(Math.random() * length);
  return quantile[i];
}

function generateRandomSequence(quantile, length) {
  const sequence = [];

  for (let i = 0; i < length; i++)
    sequence.push(getRandomFromQuantile(quantile));

  return sequence;
}

function makeAngles(numSegs, radius, gap) {
  const angles = [];
  const width = 2 * Math.PI / numSegs;

  for (let i = 0; i < numSegs; i++) {
    const angle = i * width - Math.PI / 2;
    const delta = gap / radius;

    angles.push({
      start: angle - 0.5 * width + delta,
      stop: angle + 0.5 * width - delta,
    });
  }

  return angles;
}

class OffScreenRenderer extends soundworks.Canvas2dRenderer {
  constructor() {
    super(0);

    this.offCanvas = null;
    this.offCtx = null;
    this.renderers = new Set();
  }

  init() {
    this.offCanvas = document.createElement('canvas');
    this.offCanvas.width = this.canvasWidth;
    this.offCanvas.height = this.canvasHeight;
    this.offCtx = this.offCanvas.getContext('2d');
    this.refresh();
  }

  remove() {
    this.offCanvas = null;
    this.offCtx = null;
  }

  add(renderer) {
    this.renderers.add(renderer);
  }

  delete(renderer) {
    this.renderers.remove(renderer);
  }

  update(dt) {}

  refresh() {
    const ctx = this.offCtx;
    const width = this.canvasWidth;
    const height = this.canvasHeight;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    for (let r of this.renderers)
      r.refresh(ctx, width, height);

    ctx.restore();
  }

  render(ctx) {
    ctx.drawImage(this.offCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
  }

  onResize(width, height) {
    super.onResize(width, height);

    if (this.offCanvas) {
      this.offCanvas.width = this.canvasWidth;
      this.offCanvas.height = this.canvasHeight;
    }
  }
}

class SequenceRenderer {
  constructor(sequence, angles, radius, lineWidth) {
    this.sequence = sequence;
    this.angles = angles;
    this.radius = radius;
    this.lineWidth = lineWidth;

    this.colors = seqColorsWhite;
  }

  refresh(ctx, width, height) {
    const angles = this.angles;
    const sequence = this.sequence;
    const x0 = width / 2;
    const y0 = height / 2;

    for (let i = 0; i < sequence.length; i++) {
      const value = sequence[i];
      const angle = angles[i];

      ctx.strokeStyle = this.colors[value];
      ctx.lineWidth = this.lineWidth;
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(x0, y0, this.radius, angle.start, angle.stop, false);
      ctx.stroke();
      ctx.closePath();
    }
  }
}

class StepRenderer extends soundworks.Canvas2dRenderer {
  constructor(angles, radius, lineWidth) {
    super(0);

    this.angles = angles;
    this.radius = radius;
    this.lineWidth = lineWidth;

    this.color = highlightColorWhite;

    this.highlight = -1;
  }

  init() {}

  update(dt) {}

  render(ctx) {
    if (this.highlight >= 0) {
      const width = this.canvasWidth;
      const height = this.canvasHeight;

      ctx.save();

      const x0 = this.canvasWidth / 2;
      const y0 = this.canvasHeight / 2;
      const angle = this.angles[this.highlight];

      ctx.strokeStyle = this.color;
      ctx.lineWidth = this.lineWidth;
      ctx.globalAlpha = 0.8;

      ctx.beginPath();
      ctx.arc(x0, y0, this.radius, angle.start, angle.stop, false);
      ctx.stroke();
      ctx.closePath();

      ctx.restore();
    }
  }
}

class StepSeqView extends soundworks.CanvasView {
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

    this.offScreen = null;
    this.innerSequenceRenderer = null;
    this.outerSequenceRenderer = null;
    this.touchSurface = null;

    this.numSteps = setup.steps;
    this.minRadius = 0;
    this.maxRadius = 0;
    this.centerRadius = 0;

    this.icons = iconsWhite;

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchButton = this.onTouchButton.bind(this);
  }

  init() {
    super.init();

    this.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

    const canvasMin = Math.min(window.innerWidth, window.innerHeight);
    const numSteps = this.numSteps;
    const C = (numSteps - Math.PI) / (numSteps + Math.PI);
    const Q = 2 * Math.PI / numSteps;
    const margin = 10;
    const outerRadius = (canvasMin / 2 - margin) / (1 + C * Q / 2);
    const innerRadius = outerRadius * C;
    const innerLineWidth = Q * outerRadius;
    const outerLineWidth = Q * innerRadius;

    this.minRadius = innerRadius - innerLineWidth / 2 - 4;
    this.maxRadius = outerRadius + outerLineWidth / 2 + 4;
    this.centerRadius = innerRadius + innerLineWidth / 2;

    const gap = 2;
    const innerAngles = makeAngles(numSteps, innerRadius, gap);
    const outerAngles = makeAngles(numSteps, outerRadius, gap);

    const instrument = this.instrument;
    const innerSequenceRenderer = new SequenceRenderer(instrument.inner, innerAngles, innerRadius, innerLineWidth - 2 * gap);
    this.innerSequenceRenderer = innerSequenceRenderer;

    const outerSequenceRenderer = new SequenceRenderer(instrument.outer, outerAngles, outerRadius, outerLineWidth - 2 * gap);
    this.outerSequenceRenderer = outerSequenceRenderer;

    const offScreen = new OffScreenRenderer();
    this.addRenderer(offScreen);
    offScreen.add(innerSequenceRenderer);
    offScreen.add(outerSequenceRenderer);
    this.offScreen = offScreen;

    const stepRenderer = new StepRenderer(outerAngles, outerRadius, outerLineWidth - 2 * gap);
    this.addRenderer(stepRenderer);
    this.stepRenderer = stepRenderer;

    instrument.addViewListener('touchstart', this.onTouchStart);
    this.makeButtons(3);
  }

  setInnerSequence(value) {
    this.innerSequenceRenderer.sequence = value;
  }

  setOuterSequence(value) {
    this.outerSequenceRenderer.sequence = value;
  }

  remove() {
    this.removeRenderer(this.offScreen);
    this.removeRenderer(this.stepRenderer);

    this.offScreen.remove();

    this.instrument.removeViewListener('touchstart', this.onTouchStart);

    super.remove();
  }

  makeButtons(numButtons) {
    const buttonContainer = this.$el.querySelector('.loop-button-container');
    const space = 100 / (numButtons + 1);
    let pos = space;

    this.buttons = [];

    for (let i = 0; i < numButtons; i++) {
      const button = document.createElement("div");

      button.classList.add('loop-button');
      button.style.left = `${pos}%`;
      button.style.backgroundImage = this.icons[i];
      button.addEventListener('touchstart', this.onTouchButton(i));

      buttonContainer.appendChild(button);
      this.buttons.push(button);

      pos += space;
    }
  }

  onTouchButton(index) {
    return () => {
      const instrument = this.instrument;
      let innerSequence, outerSequence;

      switch (index) {
        case 0:
          innerSequence = createArray(this.numSteps);
          outerSequence = createArray(this.numSteps);
          break;

        case 1:
          innerSequence = cloneArray(this.setup.inner.preset);
          outerSequence = cloneArray(this.setup.outer.preset);
          break;

        case 2:
          innerSequence = generateRandomSequence(instrument.innerQuantile, this.numSteps);
          outerSequence = generateRandomSequence(instrument.outerQuantile, this.numSteps);
          break;
      }

      instrument.setInnerSequence(innerSequence, true);
      instrument.setOuterSequence(outerSequence, true);
      this.offScreen.refresh();
    };
  }

  setForegroudColor(color) {
    const isWhite = (color == 'white');
    const seqColors = isWhite ? seqColorsWhite : seqColorsBlack;
    const stepColor = isWhite ? stepColorWhite : stepColorBlack;
    const icons = isWhite ? iconsWhite : iconsBlack;
    const buttonColor = seqColors[2];

    // set button color
    if (this.buttons) {
      const buttons = this.buttons;

      for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.style.borderColor = buttonColor;
        button.style.backgroundImage = icons[i];
      }
    }

    const instrumentIcons = this.setup.icon.instrument;
    const icon = isWhite ? instrumentIcons.white : instrumentIcons.black;
    this.model.icon = icon;
    this.render('.inst-icon-container');

    this.stepRenderer.color = stepColor;
    this.innerSequenceRenderer.colors = seqColors;
    this.outerSequenceRenderer.colors = seqColors;
    this.offScreen.refresh();
  }

  setHighlight(index) {
    this.stepRenderer.highlight = index;
  }

  onTouchStart(id, x, y) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const x0 = width / 2;
    const y0 = height / 2;
    const relX = x - x0;
    const relY = y - y0;
    const radius = Math.sqrt(relX * relX + relY * relY);
    const angle = Math.floor(radToDegrees(Math.atan2(-relY, relX)));
    const numSteps = this.numSteps;

    if (radius > this.minRadius && radius <= this.maxRadius) {
      const instrument = this.instrument;
      const index = Math.floor((numSteps * (450 - angle) / 360) + 0.5) % numSteps;

      if (radius < this.centerRadius)
        instrument.setInnerStep(index);
      else
        instrument.setOuterStep(index);

      this.offScreen.refresh();
    }
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);
    this._boundingClientRect = this.$el.getBoundingClientRect();
  }
}

class StepSeqInstrument extends Instrument {
  constructor(environment, setup) {
    super(environment, setup);

    this.numSteps = setup.steps;
    this.resetState();

    this.stepsPerMeasure = this.numSteps / setup.length;
    this.numInnerSounds = this.setup.inner.sounds.length;
    this.numOuterSounds = this.setup.outer.sounds.length;

    this.innerQuantile = new Array(this.numSteps);
    this.outerQuantile = new Array(this.numSteps);
    fillQuantile(this.innerQuantile, this.setup.inner.random, this.numInnerSounds);
    fillQuantile(this.outerQuantile, this.setup.outer.random, this.numOuterSounds);

    const audioContext = this.audioContext;
    this.minCutoffFreq = 5;
    this.maxCutoffFreq = audioContext.sampleRate / 2;
    this.logCutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = this.maxCutoffFreq;
    this.filter = filter;

    this.onMetroBeat = this.onMetroBeat.bind(this);
    this.onAccelerationIncludingGravity = this.onAccelerationIncludingGravity.bind(this);
  }

  resetState() {
    this.cutoff = 1;
    this.inner = createArray(this.numSteps);
    this.outer = createArray(this.numSteps);
  }

  setCutoff(value, send) {
    this.cutoff = value;
    this.filter.frequency.value = this.minCutoffFreq * Math.exp(this.logCutoffRatio * Math.sqrt(value));

    if (send)
      this.sendParam('cutoff', value);
  }

  setInnerSequence(value, send) {
    this.inner = value;

    if(this.view)
      this.view.setInnerSequence(value);

    if (send)
      this.sendParam('inner', value);
  }

  setOuterSequence(value, send) {
    this.outer = value;

    if(this.view)
      this.view.setOuterSequence(value);

    if (send)
      this.sendParam('outer', value);
  }

  setInnerStep(index) {
    const value = (this.inner[index] + 1) % (this.numInnerSounds + 1);
    this.inner[index] = value;
    this.sendParam('inner', this.inner);
  }

  setOuterStep(index) {
    const value = (this.outer[index] + 1) % (this.numOuterSounds + 1);
    this.outer[index] = value;
    this.sendParam('outer', this.outer);
  }

  setParam(name, value) {
    switch (name) {
      case 'cutoff':
        this.setCutoff(value, false);
        break;

      case 'inner':
        this.setInnerSequence(value, false);
        break;

      case 'outer':
        this.setOuterSequence(value, false);
        break;
    }
  }

  showScreen() {
    const view = new StepSeqView(this, this.setup);
    this.addView(view);
    this.addMotionListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  hideScreen() {
    this.removeView();
    this.removeMotionListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  startSound() {
    this.addMetronome(this.onMetroBeat, this.numSteps, this.stepsPerMeasure);
  }

  stopSound() {
    this.removeMetronome(this.onMetroBeat);
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

  makeSound(sounds, value) {
    if (value > 0) {
      const audioContext = this.audioContext;
      const time = this.currentTime;
      const sound = sounds[value - 1];
      const src = audioContext.createBufferSource();
      src.connect(this.filter);
      src.buffer = sound.buffer;
      src.start(time);
    }
  }

  onMetroBeat(measure, beat) {
    const setup = this.setup;
    this.makeSound(setup.inner.sounds, this.inner[beat]);
    this.makeSound(setup.outer.sounds, this.outer[beat]);

    const view = this.view;
    if (view)
      view.setHighlight(beat);
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

export default StepSeqInstrument;
