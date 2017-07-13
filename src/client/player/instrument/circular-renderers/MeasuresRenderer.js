import BaseArcRenderer from './BaseArcRenderer';

/**
 * Display the measures as segments.
 *
 * @param {Number} displayLength - Nbr of measures represented in the whole circle.
 * @param {Object} config
 */
class MeasuresRenderer extends BaseArcRenderer {
  constructor(displayLength, config) {
    super(config.zone, displayLength);

    this.config = Object.assign({
      color: '#ffffff',
      opacity: 0.5,
    }, config);
  }

  init() {
    super.init();
    this.segments = [];

    for (let i = 0; i < this.displayLength; i++) {
      const start = this.getAngleFromPosition(i);
      const stop = this.getAngleFromPosition(i + 1, true);
      this.segments.push([start, stop]);
    }

    this._render();
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);
    // can be called before init
    if (this.cachedCtx)
      this._render();
  }

  _render() {
    const _ctx = this.cachedCtx;
    const width = this.canvasWidth;
    const height = this.canvasHeight;

    _ctx.clearRect(0, 0, width, height);
    _ctx.save();
    _ctx.translate(width / 2, height / 2);

    _ctx.strokeStyle = this.config.color;
    _ctx.globalAlpha = this.config.opacity;
    _ctx.lineWidth = this.arcWidth;

    this.segments.forEach((angles) => {
      _ctx.beginPath();
      _ctx.arc(0, 0, this.radius, angles[0], angles[1], false);
      _ctx.stroke();
      _ctx.closePath();
    });

    _ctx.restore();
  }

  render(ctx) {
    ctx.drawImage(this.$cachedCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
  }
}

export default MeasuresRenderer;
