import instrumentFactory from './instrumentFactory';
import Instrument from './Instrument';
import { client, CanvasView } from 'soundworks/client';
import CursorRenderer from './circular-renderers/CursorRenderer';
import MeasuresRenderer from './circular-renderers/MeasuresRenderer';

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
  constructor(metricScheduler, buttonCallback, options) {
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
    this.buttonCallback = buttonCallback;

    this.cursorRenderer = null;
    this.measureRenderer = null;

    this.selectedButton = 0;
    this.activeButton = 0;

    this.length = options.length;
    this.options = options;

    this.onMeasureStart = this.onMeasureStart.bind(this);
  }

  init() {
    this.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

    const measureOptions = {
      zone: 0,
      color: highColor,
      opacity: 1,
    };

    const measureRenderer = new MeasuresRenderer(this.length, measureOptions);
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

    const cursorRenderer = new CursorRenderer(this.length, cursorOptions, this.metricScheduler);
    this.addRenderer(cursorRenderer);
    this.cursorRenderer = cursorRenderer;

    this.metricScheduler.addMetronome(this.onMeasureStart, 1, 1, 1, 0, true);
    this.makeButtons(this.options.loops.length);
  }

  remove() {
    super.remove();
    this.metricScheduler.removeMetronome(this.onMeasureStart);
  }

  activateSelectedButton() {
    const selectedButton = this.selectedButton;

    if (selectedButton !== this.activeButton) {
      this.activeButton = selectedButton;
      this.measureRenderer.setColor(highColor);
      this.setActivatedButton(selectedButton);
    }
  }

  selectButton(index) {
    if (index !== this.selectedButton) {
      this.selectedButton = index;
      this.setSelectedButton(index);
      this.measureRenderer.setColor(lowColor);
      this.buttonCallback(index);
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

    this.view = null;
    this.loopTrack = environment.loopPlayer.addLoopTrack(options.loops);

    this.onAccelerationIncludingGravity = this.onAccelerationIncludingGravity.bind(this);
    this.onViewButton = this.onViewButton.bind(this);
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
    const environment = this.environment;
    const view = new LoopView(environment.metricScheduler, this.onViewButton, this.options);
    view.render();
    view.show();
    view.appendTo(environment.screenContainer);
    this.view = view;

    // const touchSurface = new soundworks.TouchSurface(view.$el, { normalizeCoordinates: false });
    // touchSurface.addListener(...);
    // this.touchSurface = touchSurface;
  }

  hideScreen() {
    const environment = this.environment;

    this.view.remove();

    // this.touchSurface.removeListener(...);
    // this.touchSurface.destroy();
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
    this.loopTrack.active = true;
  }

  stopSound() {
    this.loopTrack.active = false;
  }

  connect(output) {
    this.loopTrack.connect(output);
  }

  disconnect(output) {
    this.loopTrack.disconnect(output);
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

  onViewButton(index) {
    this.loopTrack.setLoop(index);
    this.environment.sendControl('select', index);
  }
}

instrumentFactory.addCtor('loop', LoopInstrument);

export default LoopInstrument;
