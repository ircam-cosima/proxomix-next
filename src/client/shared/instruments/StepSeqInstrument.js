import * as soundworks from 'soundworks/client';
import { decibelToLinear } from 'soundworks/utils/math';
import instrumentFactory from './instrumentFactory';
import Instrument from './Instrument';
const audioContext = soundworks.audioContext;
const audioScheduler = soundworks.audio.getScheduler();

const template = `
  <canvas class="background flex-middle"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-middle">
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

const colors = [
  '#2f2f2f',
  '#5f5f5f',
  '#afafaf',
  '#7F7F7F',
];

const highlightColor = '#ffffff';

function radToDegrees(radians) {
  return radians * 180 / Math.PI;
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

function setSequence(sequence, values) {
  const length = Math.min(sequence.length, values.length);

  for (let i = 0; i < length; i++)
    sequence[i] = value[i];
}

class SequenceRenderer extends soundworks.Canvas2dRenderer {
  constructor(states, angles, radius, lineWidth) {
    super(0);

    this.states = states;
    this.angles = angles;
    this.radius = radius;
    this.lineWidth = lineWidth;
  }

  init() {
    this.$cachedCanvas = document.createElement('canvas');
    this.$cachedCanvas.width = this.canvasWidth;
    this.$cachedCanvas.height = this.canvasHeight;
    this.cachedCtx = this.$cachedCanvas.getContext('2d');

    this.renderOff();
  }

  update(dt) {}

  renderOff() {
    const ctx = this.cachedCtx;
    const width = this.canvasWidth;
    const height = this.canvasHeight;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    const angles = this.angles;
    const states = this.states;
    const x0 = this.canvasWidth / 2;
    const y0 = this.canvasHeight / 2;

    for (let i = 0; i < states.length; i++) {
      const state = states[i];
      const angle = angles[i];

      ctx.strokeStyle = colors[state];
      ctx.lineWidth = this.lineWidth;
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(x0, y0, this.radius, angle.start, angle.stop, false);
      ctx.stroke();
      ctx.closePath();
    }

    ctx.restore();
  }

  render(ctx) {
    ctx.drawImage(this.$cachedCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
  }

  onResize(width, height) {
    super.onResize(width, height);

    if (this.$cachedCanvas) {
      this.$cachedCanvas.width = this.canvasWidth;
      this.$cachedCanvas.height = this.canvasHeight;
    }
  }
}

class StepRenderer extends soundworks.Canvas2dRenderer {
  constructor(angles, radius, lineWidth) {
    super(0);

    this.angles = angles;
    this.radius = radius;
    this.lineWidth = lineWidth;

    this.highlight = 0;
  }

  init() {}

  update(dt) {}

  render(ctx) {
    const width = this.canvasWidth;
    const height = this.canvasHeight;

    ctx.save();

    const x0 = this.canvasWidth / 2;
    const y0 = this.canvasHeight / 2;
    const angle = this.angles[this.highlight];

    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = this.lineWidth;
    ctx.globalAlpha = 0.8;

    ctx.beginPath();
    ctx.arc(x0, y0, this.radius, angle.start, angle.stop, false);
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
  }

  onResize(width, height) {
    super.onResize(width, height);

    if (this.$cachedCanvas) {
      this.$cachedCanvas.width = this.canvasWidth;
      this.$cachedCanvas.height = this.canvasHeight;
    }
  }
}

class StepSeqView extends soundworks.CanvasView {
  constructor(metricScheduler, innerSequence, outerSequence, buttonCallback, options) {
    super(template, {
      symbol: options.symbol,
    }, {}, {
      preservePixelRatio: true,
      ratios: {
        '.section-top': 0,
        '.section-center': 1,
        '.section-bottom': 0,
      }
    });

    this.metricScheduler = metricScheduler;
    this.innerSequence = innerSequence;
    this.outerSequence = outerSequence;
    this.buttonCallback = buttonCallback;
    this.options = options;

    this.innerSequenceRenderer = null;
    this.outerSequenceRenderer = null;
    this.touchSurface = null;

    const numSteps = Math.min(innerSequence.length, outerSequence.length);
    this.numSteps = numSteps;
    this.innerLineWidth = 0;
    this.outerLineWidth = 0;
    this.innerRadius = 0;
    this.outerRadius = 0;
    this.innerAngles = null;

    this.onTouchStart = this.onTouchStart.bind(this);
  }

  init() {
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
    this.outerLineWidth = innerLineWidth;
    this.innerLineWidth = outerLineWidth;

    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.minRadius = innerRadius - innerLineWidth / 2 - 4;
    this.maxRadius = outerRadius + this.outerLineWidth / 2 + 4;
    this.centerRadius = innerRadius + innerLineWidth / 2;

    const gap = 2;
    const innerAngles = makeAngles(numSteps, innerRadius, gap);
    const outerAngles = makeAngles(numSteps, outerRadius, gap);

    const innerSequenceRenderer = new SequenceRenderer(this.innerSequence, innerAngles, innerRadius, innerLineWidth - 2 * gap);
    this.addRenderer(innerSequenceRenderer);
    this.innerSequenceRenderer = innerSequenceRenderer;

    const outerSequenceRenderer = new SequenceRenderer(this.outerSequence, outerAngles, outerRadius, outerLineWidth - 2 * gap);
    this.addRenderer(outerSequenceRenderer);
    this.outerSequenceRenderer = outerSequenceRenderer;

    const stepRenderer = new StepRenderer(outerAngles, outerRadius, outerLineWidth - 2 * gap);
    this.addRenderer(stepRenderer);
    this.stepRenderer = stepRenderer;

    const touchSurface = new soundworks.TouchSurface(this.$el, { normalizeCoordinates: false });
    touchSurface.addListener('touchstart', this.onTouchStart);
    this.touchSurface = touchSurface;
  }

  remove() {
    super.remove();

    this.touchSurface.removeListener('touchstart', this.onTouchStart);
    this.touchSurface.destroy();
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
      const index = Math.floor((numSteps * (450 - angle) / 360) + 0.5) % numSteps;

      if(radius < this.centerRadius) {
        this.buttonCallback(index, false);
        this.innerSequenceRenderer.renderOff();
      } else {
        this.buttonCallback(index, true);
        this.outerSequenceRenderer.renderOff();
      }
    }
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);
    this._boundingClientRect = this.$el.getBoundingClientRect();
  }
}

class StepSeqInstrument extends Instrument {
  constructor(environment, options) {
    super(environment, options);

    this.view = null;

    this.numSteps = options.numSteps;
    this.numInnerLayers = this.options.inner.length;
    this.numOuterLayers = this.options.outer.length;

    this.innerSequence = new Array(this.numSteps);
    this.outerSequence = new Array(this.numSteps);
    this.clear();

    this.minCutoffFreq = 5;
    this.maxCutoffFreq = audioContext.sampleRate / 2;
    this.logCutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    const cutoff = audioContext.createBiquadFilter();
    cutoff.type = 'lowpass';
    cutoff.frequency.value = this.maxCutoffFreq;
    this.cutoff = cutoff;

    this.onViewButton = this.onViewButton.bind(this);
    this.onMetroBeat = this.onMetroBeat.bind(this);
    this.onAccelerationIncludingGravity = this.onAccelerationIncludingGravity.bind(this);
  }

  setCutoff(value) {
    const cutoffFreq = this.minCutoffFreq * Math.exp(this.logCutoffRatio * Math.sqrt(value));
    this.cutoff.frequency.value = cutoffFreq;
  }

  setInnerSequence(values) {
    setSequence(this.innerSequence, values);
  }

  setOuterSequence(values) {
    setSequence(this.outerSequence, values);
  }

  setControl(name, value) {
    switch (name) {
      case 'cutoff':
        this.setCutoff(value);
        break;

      case 'inner-sequence':
        this.setInnerSequence(values);
        break;

      case 'outer-sequence':
        this.setOuterSequence(values);
        break;
    }
  }

  showScreen() {
    const environment = this.environment;
    const view = new StepSeqView(environment.metricScheduler, this.innerSequence, this.outerSequence, this.onViewButton, this.options);
    view.render();
    view.show();
    view.appendTo(environment.screenContainer);
    this.view = view;
  }

  hideScreen() {
    this.view.remove();
  }

  startSensors() {
    this.lastCutoff = -Infinity;

    const environment = this.environment;
    environment.motionInput.addListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  stopSensors() {
    const environment = this.environment;
    environment.motionInput.removeListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  startSound() {
    const environment = this.environment;
    environment.metricScheduler.addMetronome(this.onMetroBeat, this.numSteps, this.numSteps, 1, 0, true);
  }

  stopSound() {
    const environment = this.environment;
    environment.metricScheduler.removeMetronome(this.onMetroBeat);
  }

  connect(output) {
    this.cutoff.connect(output);
  }

  disconnect(output) {
    this.cutoff.disconnect(output);
  }

  clear() {
    const numSteps = this.numSteps;

    for (let i = 0; i < numSteps; i++)
      this.innerSequence[i] = 0;

    for (let i = 0; i < numSteps; i++)
      this.outerSequence[i] = 0;
  }

  onViewButton(index, outer) {
    if(!outer) {
      const state = (this.innerSequence[index] + 1) % (this.numInnerLayers + 1);
      this.innerSequence[index] = state;
      this.environment.sendControl('inner-sequence', this.innerSequence);
    } else {
      const state = (this.outerSequence[index] + 1) % (this.numOuterLayers + 1);
      this.outerSequence[index] = state;
      this.environment.sendControl('outer-sequence', this.outerSequence);
    }
  }

  makeSound(sounds, state) {
    if (state > 0) {
      const time = audioScheduler.currentTime;
      const sound = sounds[state - 1];

      const gain = audioContext.createGain();
      gain.connect(this.cutoff);
      gain.gain.value = decibelToLinear(sound.gain);

      const src = audioContext.createBufferSource();
      src.connect(gain);
      src.buffer = sound.buffer;
      src.start(time);
    }    
  }

  onMetroBeat(measure, beat) {
    const innerState = this.innerSequence[beat];
    this.makeSound(this.options.inner, innerState);

    const outerState = this.outerSequence[beat];
    this.makeSound(this.options.outer, outerState);

    this.view.setHighlight(beat);
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

instrumentFactory.addCtor('stepseq', StepSeqInstrument);

export default StepSeqInstrument;
