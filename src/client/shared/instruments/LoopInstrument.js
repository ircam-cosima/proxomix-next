import instrumentFactory from './instrumentFactory';
import Instrument from './Instrument';
import { CanvasView } from 'soundworks/client';
import CursorRenderer from './circular-renderers/CursorRenderer';
import MeasureRenderer from './circular-renderers/MeasureRenderer';

const template = `
  <canvas class="background"></canvas>
  <div class="foreground fit-container">
    <div class="section-top"></div>
    <div class="section-center flex-middle">
      <% if (symbol) { %>
      <p class="greek"><%= symbol %></p>
      <% } %>

      <div class="loop-button-container">
      </div>
    </div>
    <div class="section-bottom"></div>
  </div>
`;

const lowColor = '#3F3F3F';
const highColor = '#7F7F7F';

class LoopView extends CanvasView {
  constructor(instrument, options) {
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

    this.instrument = instrument;

    this.cursorRenderer = null;
    this.measureRenderer = null;

    this.selectedButton = 0;
    this.activeButton = 0;

    this.length = options.length;
    this.options = options;

    this.onMeasureStart = this.onMeasureStart.bind(this);
  }

  // CanvasView.init
  init() {
    super.init();
    this.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

    const measureOptions = {
      zone: 0,
      color: lowColor,
      opacity: 1,
    };

    const measureRenderer = new MeasureRenderer(this.length, measureOptions);
    this.addRenderer(measureRenderer);
    this.measureRenderer = measureRenderer;

    const cursorOptions = {
      type: 'cursor',
      color: '#000000',
      opacity: 1,
      fadeOpacity: 0.02,
      numZones: 1,
      active: false, // define if can trigger actions or not, if true should define an id
    };

    const cursorRenderer = new CursorRenderer(this.length, cursorOptions, () => this.instrument.currentPosition);
    this.addRenderer(cursorRenderer);
    this.cursorRenderer = cursorRenderer;

    this.instrument.addMetronome(this.onMeasureStart, 1, 1);
    this.makeButtons(this.options.loops.length);
  }

  remove() {
    super.remove();
    this.instrument.removeMetronome(this.onMeasureStart);
  }

  activateSelectedButton() {
    const selectedButton = this.selectedButton;

    if (selectedButton !== this.activeButton) {
      this.activeButton = selectedButton;
      this.setActivatedButton(selectedButton);
    }

    this.measureRenderer.setColor(highColor);
  }

  selectButton(index) {
    if (index !== this.selectedButton) {
      this.selectedButton = index;
      this.setSelectedButton(index);
      this.measureRenderer.setColor(lowColor);
      this.instrument.setLoopIndex(index);
    }
  }

  setSelectedButton(index) {
    for (let i = 0; i < this.buttons.length; i++) {
      const button = this.buttons[i];

      if (index === i)
        button.style.borderColor = highColor;
      else
        button.style.borderColor = lowColor;
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
      const buttonContainer = this.$el.querySelector('.loop-button-container');
      const space = 100 / (numButtons + 1);
      let pos = space;

      this.buttons = [];

      for (let i = 0; i < numButtons; i++) {
        const button = document.createElement("div");

        const dot = document.createElement("div");
        dot.style.backgroundColor = highColor;
        button.appendChild(dot);

        button.classList.add('loop-button');
        button.style.left = `${pos}%`;
        button.addEventListener('touchstart', this.onTouchStart(i));

        buttonContainer.appendChild(button);
        this.buttons.push(button);

        pos += space;
      }

      this.setSelectedButton(0);
      this.setActivatedButton(0);
    }
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
  constructor(environment, options) {
    super(environment, options);

    this.options = options;
    this.loopTrack = null;
    this.output = null;

    this.onAccelerationIncludingGravity = this.onAccelerationIncludingGravity.bind(this);
  }

  setControl(name, value) {
    switch (name) {
      case 'cutoff':
        this.loopTrack.setCutoff(value);
        break;

      case 'select':
        this.loopTrack.setLoop(value);
        break;
    }
  }

  showScreen() {
    const view = new LoopView(this, this.options);

    this.lastCutoff = -Infinity;

    this.addView(view);
    this.addMotionListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  hideScreen() {
    this.removeView();
    this.removeMotionListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);
  }

  startSound() {
    const loopTrack = this.addLoopTrack(this.options.loops);
    const output = this.output;

    if (output)
      loopTrack.connect(output);

    this.loopTrack = loopTrack;
  }

  stopSound() {
    const loopTrack = this.loopTrack;

    if(loopTrack)
      this.removeLoopTrack(loopTrack);
  }

  connect(output) {
    this.output = output;

    const loopTrack = this.loopTrack;
    if (loopTrack)
      loopTrack.connect(output);
  }

  disconnect(output) {
    if (output === this.output) {
      this.output = null;

      const loopTrack = this.loopTrack;
      if (loopTrack)
        loopTrack.disconnect(output);
    }
  }

  setLoopIndex(index) {
    this.loopTrack.setLoop(index);
    this.environment.sendControl('select', index);
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

      this.loopTrack.setCutoff(cutoff);
      this.environment.sendControl('cutoff', cutoff);
    }
  }
}

instrumentFactory.addCtor('loop', LoopInstrument);

export default LoopInstrument;
