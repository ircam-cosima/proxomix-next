import { audio } from 'soundworks/client';
import BaseArcRenderer from './BaseArcRenderer';

/**
 * Circular cursor.
 *
 * @param {Number} displayLength - Nbr of measures represented in the whole circle.
 * @param {function} getCurrentMetricPosition
 * @param {}
 */
class CursorRenderer extends BaseArcRenderer {
  constructor(displayLength, options, getCurrentMetricPosition) {
    super(0, displayLength);


    this.options = Object.assign({
      color: '#000000',
      opacity: 1,
      fadeOpacity: 0.02,
      numZones: 1,
    }, options);

    this.getCurrentMetricPosition = getCurrentMetricPosition;
  }

  render(ctx) {
    const _ctx = this.cachedCtx;
    const _$canvas = this.$cachedCanvas;
    const width = this.canvasWidth;
    const height = this.canvasHeight;
    const radius = this.radius;
    const halfWidth = this.arcWidth / 2;
    const numZones = this.options.numZones;
    const currentPosition = this.getCurrentMetricPosition();
    const angle = this.getAngleFromPosition(currentPosition);
    const padding = 0;

    // background
    // _ctx.save();

    // _ctx.globalCompositeOperation = 'destination-out';
    // _ctx.fillStyle = '#000000';
    // _ctx.globalAlpha = this.options.fadeOpacity;
    // // _ctx.globalAlpha = 0.15;

    // _ctx.fillRect(0, 0, width, height);
    // _ctx.restore();

    _ctx.clearRect(0, 0, width, height);
    // cursor
    _ctx.save();
    // _ctx.strokeStyle = this.options.color;
    _ctx.strokeStyle = '#ffffff';
    _ctx.globalAlpha = this.options.opacity;
    _ctx.lineWidth = 3;

    _ctx.translate(width / 2, height / 2);
    _ctx.rotate(angle);

    _ctx.beginPath();
    _ctx.moveTo(radius - numZones * halfWidth + padding, 0);
    _ctx.lineTo(radius + halfWidth + padding, 0);
    _ctx.stroke();
    _ctx.closePath();

    _ctx.restore();

    ctx.drawImage(_$canvas, 0, 0, width, height);
  }
}

export default CursorRenderer;
