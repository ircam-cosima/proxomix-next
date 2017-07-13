import BaseArcRenderer from './BaseArcRenderer';

const _2PI = 2 * Math.PI;

/**
 * @param {Number} displayLength - Nbr of measures represented in the whole circle.
 * @param {Object} config
 */
class SegmentRenderer extends BaseArcRenderer {
  constructor(displayLength, config) {
    super(config.zone, displayLength);

    this.config = Object.assign({
      color: '#565656',
      opacity: 0.5,
      start: 0,
      length: displayLength,
    }, config);

    console.log(this.config);
  }

  init() {
    super.init();
    const config = this.config;

    this.color = config.color;
    this.startAngle = this.getAngleFromPosition(config.start);

    if (config.length === Infinity)
      this.stopAngle = this.startAngle + _2PI;
    else if (config.length === this.displayLength)
      this.stopAngle = this.getAngleFromPosition(config.start, true);
    else
      this.stopAngle = this.getAngleFromPosition(config.start + config.length);

    this._render();
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);

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

    _ctx.strokeStyle = this.color;
    _ctx.globalAlpha = this.config.opacity;
    _ctx.lineWidth = this.arcWidth;

    _ctx.beginPath();
    _ctx.arc(0, 0, this.radius, this.startAngle, this.stopAngle, false);
    _ctx.stroke();
    _ctx.closePath();

    _ctx.restore();
  }

  render(ctx) {
    ctx.drawImage(this.$cachedCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
  }
}

export default SegmentRenderer;
