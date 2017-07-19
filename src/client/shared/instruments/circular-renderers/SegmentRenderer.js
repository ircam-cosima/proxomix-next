import BaseArcRenderer from './BaseArcRenderer';

const _2PI = 2 * Math.PI;

/**
 * @param {Number} displayLength - Nbr of measures represented in the whole circle.
 * @param {Object} options
 */
class SegmentRenderer extends BaseArcRenderer {
  constructor(displayLength, options) {
    super(options.zone, displayLength);

    this.options = Object.assign({
      color: '#565656',
      opacity: 0.5,
      start: 0,
      length: displayLength,
    }, options);

    console.log(this.options);
  }

  init() {
    super.init();
    const options = this.options;

    this.color = options.color;
    this.startAngle = this.getAngleFromPosition(options.start);

    if (options.length === Infinity)
      this.stopAngle = this.startAngle + _2PI;
    else if (options.length === this.displayLength)
      this.stopAngle = this.getAngleFromPosition(options.start, true);
    else
      this.stopAngle = this.getAngleFromPosition(options.start + options.length);

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
    _ctx.globalAlpha = this.options.opacity;
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
