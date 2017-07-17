import instrumentFactory from '../instrumentFactory';
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
    </div>
    <div class="section-bottom"></div>
  </div>
`;

class LoopView extends CanvasView {
  constructor(metricScheduler, options) {
    super(template, {
      symbol: options.symbol,
    }, {}, {
      preservePixelRatio: true,
      ratios: {
        '.section-top': 0.2,
        '.section-center': 0.6,
        '.section-bottom': 0.2,
      }
    });

    this.length = options.length;

    this.options = options;
    this.metricScheduler = metricScheduler;
  }

  init() {
    this.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

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

    const measureOptions = {
      zone: 0,
      color: '#ffffff',
      opacity: 0.2,
      // active: false, // define if can trigger actions or not, if true should define an id
    };

    const measureRenderer = new MeasuresRenderer(this.length, measureOptions);
    this.addRenderer(measureRenderer);

    this.cursorRenderer = cursorRenderer;
    this.measureRenderer = measureRenderer;
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
  }

  setControl(name, value) {
    this.loopTrack.setCutoff(value);
  }

  showScreen() {
    const environment = this.environment;
    const view = new LoopView(environment.metricScheduler, this.options);
    view.render();
    view.show();
    view.appendTo(environment.screenContainer);
    this.view = view;

    // const touchSurface = new soundworks.TouchSurface(view.$el, { normalizeCoordinates: false });
    // touchSurface.addListener(...);
    // this.touchSurface = touchSurface;
  }

  hideScreen() {
    this.view.remove();

    // this.touchSurface.removeListener(...);
    // this.touchSurface.destroy();
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
}

instrumentFactory.addCtor('loop', LoopInstrument);

export default LoopInstrument;
