import Instrument from './Instrument';
import { CanvasView } from 'soundworks/client';
import CursorRenderer from './circular-renderers/CursorRenderer';
import MeasureRenderer from './circular-renderers/MeasureRenderer';

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

const lowColorWhite = 'rgba(255, 255, 255, 0.3)';
const highColorWhite = 'rgba(255, 255, 255, 0.6)';
const lowColorBlack = 'rgba(0, 0, 0, 0.3)';
const highColorBlack = 'rgba(0, 0, 0, 0.6)';

class LoopView extends CanvasView {
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

    this.highColor = highColorWhite;
    this.lowColor = lowColorWhite;

    this.cursorRenderer = null;
    this.measureRenderer = null;

    this.selectedButton = 0;
    this.activatedButton = 0;

    this.length = setup.length;
    this.setup = setup;

    this.onMeasureStart = this.onMeasureStart.bind(this);
  }

  // CanvasView.init
  init() {
    super.init();

    this.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

    const measureOptions = {
      zone: 0,
      color: this.lowColor,
      opacity: 1,
    };

    const measureRenderer = new MeasureRenderer(this.length, measureOptions);
    this.addRenderer(measureRenderer);
    this.measureRenderer = measureRenderer;

    const cursorOptions = {
      type: 'cursor',
      color: '#ffffff',
      opacity: 1,
      fadeOpacity: 0.02,
      numZones: 1,
      active: false, // define if can trigger actions or not, if true should define an id
    };

    const cursorRenderer = new CursorRenderer(this.length, cursorOptions, () => this.instrument.currentPosition);
    this.addRenderer(cursorRenderer);
    this.cursorRenderer = cursorRenderer;

    this.instrument.addMetronome(this.onMeasureStart, 1, 1);
    this.makeButtons(this.setup.loops.length);
  }

  remove() {
    super.remove();
    this.instrument.removeMetronome(this.onMeasureStart);
  }

  selectButton(index) {
    if (index !== this.selectedButton) {
      this.selectedButton = index;
      this.setSelectedButton(index);
      this.measureRenderer.setColor(this.lowColor);
      this.instrument.setLoop(index, true);
    }
  }

  activateSelectedButton() {
    const selectedButton = this.selectedButton;

    if (selectedButton !== this.activatedButton) {
      this.activatedButton = selectedButton;
      this.setActivatedButton(selectedButton);
    }

    this.measureRenderer.setColor(this.highColor);
  }

  setSelectedButton(index) {
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];

      if (index === i)
        button.style.borderColor = this.highColor;
      else
        button.style.borderColor = this.lowColor;
    }
  }

  setActivatedButton(index) {
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];
      const dot = button.firstChild;

      if (index === i)
        dot.style.opacity = 1;
      else
        dot.style.opacity = 0;
    }
  }

  makeButtons(numButtons) {
    if (numButtons > 1) {
      const container = this.$el.querySelector('.loop-button-container');
      const space = 100 / (numButtons + 1);
      let pos = space;

      this.buttons = [];

      for (let i = 0; i < numButtons; i++) {
        const button = document.createElement("div");

        const dot = document.createElement("div");
        dot.style.backgroundColor = this.highColor;

        button.appendChild(dot);

        button.classList.add('loop-button');
        button.style.left = `${pos}%`;
        button.addEventListener('touchstart', this.onTouchStart(i));

        container.appendChild(button);
        this.buttons.push(button);

        pos += space;
      }

      const loop = this.instrument.loop;
      this.setSelectedButton(loop);
      this.setActivatedButton(loop);
    }
  }

  setForegroudColor(color) {
    const isWhite = (color == 'white');
    const highColor = isWhite ? highColorWhite : highColorBlack;
    const lowColor = isWhite ? lowColorWhite : lowColorBlack;

    this.highColor = highColor;
    this.lowColor = lowColor;

    // set button color
    if (this.buttons) {
      for (let button of this.buttons) {
        const dot = button.firstChild;
        dot.style.backgroundColor = highColor;
      }

      this.setSelectedButton(this.selectedButton);
      this.setActivatedButton(this.activatedButton);
    }

    // const cursorColor = isWhite ? '#ffffff' : '#000000';
    // this.cursorRenderer.setColor(cursorColor);

    const instrumentIcons = this.setup.icon.instrument;
    const icon = isWhite ? instrumentIcons.white : instrumentIcons.black;
    this.model.icon = icon;
    this.render('.inst-icon-container');

    this.measureRenderer.setColor(lowColor);
  }

  onTouchStart(index) {
    return () => {
      this.selectButton(index);
    };
  }

  onMeasureStart(audioTime, measureCount) {
    this.activateSelectedButton();
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);
    this._boundingClientRect = this.$el.getBoundingClientRect();
  }
}

class LoopInstrument extends Instrument {
  constructor(environment, setup) {
    super(environment, setup);

    this.resetState();
    this.loopTrack = null;

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
    this.loop = 0;
  }

  setLoop(value, send) {
    this.loop = value;

    if(this.loopTrack)
      this.loopTrack.setLoop(value);

    if (send)
      this.sendParam('loop', value);
  }

  setCutoff(value, send) {
    this.cutoff = value;
    this.filter.frequency.value = this.minCutoffFreq * Math.exp(this.logCutoffRatio * Math.sqrt(value));

    if (send)
      this.sendParam('cutoff', value);
  }

  setParam(name, value) {
    switch (name) {
      case 'cutoff':
        this.setCutoff(value, false);
        break;

      case 'loop':
        this.setLoop(value, false);
        break;
    }
  }

  showScreen() {
    const view = new LoopView(this, this.setup);
    this.addView(view);
    this.addMotionListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  hideScreen() {
    this.removeView();
    this.removeMotionListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  startSound() {
    this.loopTrack = this.addLoopTrack(this.filter, this.setup.loops);
    this.loopTrack.setLoop(this.loop);
  }

  stopSound() {
    const loopTrack = this.loopTrack;

    if (loopTrack)
      this.removeLoopTrack(loopTrack);
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

export default LoopInstrument;
