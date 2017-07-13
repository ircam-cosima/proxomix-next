import { client, CanvasView } from 'soundworks/client';
import CursorRenderer from './circular-renderers/CursorRenderer';
import MeasuresRenderer from './circular-renderers/MeasuresRenderer';
import PatternRenderer from './circular-renderers/PatternRenderer';
import SegmentRenderer from './circular-renderers/SegmentRenderer';

const template = `
  <canvas class="background"></canvas>
  <div class="foreground fit-container">
    <div class="section-top"></div>
    <div class="section-center flex-middle">
      <% if (!hideSymbol) { %>
      <p class="greek"><%= symbol %></p>
      <% } %>
    </div>
    <div class="section-bottom"></div>
  </div>
`;

class CircularView extends CanvasView {
  constructor(commonConfig, instrumentConfig, metricScheduler) {
    const content = {
      symbol: `&#${instrumentConfig.playerId + 945};`,
      hideSymbol: instrumentConfig.hideSymbol,
    };
    const options = {
      preservePixelRatio: true,
      ratios: {
        '.section-top': 0.2,
        '.section-center': 0.6,
        '.section-bottom': 0.2,
      }
    };

    super(template, content, {}, options);

    this.commonConfig = commonConfig;
    this.instrumentConfig = instrumentConfig;
    this.metricScheduler = metricScheduler;

    // clickable renderers
    // this.activeRendererList = [];
    // this.activeRendererMap = {};

    // events
    // const events = client.platform.interaction === 'touch' ?
    //   { touchstart: this.onTouchStart.bind(this) } :
    //   { mousedown: this.onMouseDown.bind(this) };

    // this.installEvents(events);

    // this.actionListeners = new Set();
    // this.onStateChange = this.onStateChange.bind(this);
  }

  init() {
    this.setPreRender((ctx, dt, w, h) => ctx.clearRect(0, 0, w, h));

    const displayLength = this.instrumentConfig.length;

    this.instrumentConfig.renderers.forEach((config) => {
      let renderer = null;

      switch (config.type) {
        case 'cursor':
          renderer = new CursorRenderer(displayLength, config, this.metricScheduler);
          break;
        case 'pattern':
          renderer = new PatternRenderer(displayLength, config);
          break;
        case 'measures':
          renderer = new MeasuresRenderer(displayLength, config);
          break;
        case 'segment':
          renderer = new SegmentRenderer(displayLength, config);
          break;
      }

      if (renderer !== null) {
        if (config.type === 'cursor') {
          const nextMeasurePosition = Math.ceil(this.metricScheduler.currentPosition);
          this.metricScheduler.addEvent(() => this.addRenderer(renderer), nextMeasurePosition);
        } else {
          this.addRenderer(renderer);
        }

        // if (config.active === true) {
        //   if (!config.id)
        //     throw new Error('No id defined for active renderer');

        //   const id = config.id;
        //   this.activeRendererList.push({ id, renderer }); // to kepp the right order
        //   this.activeRendererMap[id] = renderer;
        // }
      }
    });
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);
    this._boundingClientRect = this.$el.getBoundingClientRect();
  }

  /*
  // no interactions for now
  onTouchStart(e) {
    const touch = e.touches[0];
    this._handleEvent(touch);
  }

  onMouseDown(e) {
    this._handleEvent(e);
  }

  _handleEvent(e) {
    const { clientX, clientY } = e;
    const x = (clientX - this._boundingClientRect.left) * this.pixelRatio;
    const y = (clientY - this._boundingClientRect.top) * this.pixelRatio;

    // hit test - backward, test first elements that are on top
    for (let i = this.segmentRendererList.length - 1; i >= 0; i--) {
      const { renderer, id } = this.segmentRendererList[i];
      const imageData = renderer.cachedCtx.getImageData(x, y, 1, 1);
      const alpha = imageData.data[3];

      if (alpha !== 0) {
        this.triggerAction({
          name: 'screen-interaction',
          segmentId: id,
        });

        break; // don't search further...
      }
    }
  }

  addActionListener(callback) {
    this.actionListeners.add(callback);
  }

  removeActionListener() {
    this.actionListeners.delete(callback);
  }

  removeAllActionListener() {
    this.actionListeners.clear();
  }

  triggerAction(payload) {
    this.actionListeners.forEach(callback => callback(payload));
  }

  onStateChange(state) {
    const renderer = this.segmentRendererMap[state.id];
    renderer.updateState(state);
  }
  */
}

export default CircularView;
