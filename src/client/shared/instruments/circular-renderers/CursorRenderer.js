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
    super(0, displayLength, false);

    this.options = Object.assign({
      color: '#000000',
      opacity: 1,
      fadeOpacity: 0.02,
      numZones: 1,
    }, options);

    this._color = options.color;
    this._opacity = options.opacity;

    this.getCurrentMetricPosition = getCurrentMetricPosition;
  }

  remove() {
    super.remove();

    this.getCurrentMetricPosition = null;
  }

  setColor(value) {
    this._color = value;
  }

  setOpacity(value) {
    this._opacity = value;
  }

  render(ctx) {
    const width = this.canvasWidth;
    const height = this.canvasHeight;
    const radius = this.radius;
    const halfWidth = this.arcWidth / 2;
    const numZones = this.options.numZones;
    const currentPosition = this.getCurrentMetricPosition();
    const angle = this.getAngleFromPosition(currentPosition);
    const padding = 0;

    // cursor
    ctx.save();

    ctx.strokeStyle = this._color;
    ctx.globalAlpha = this._opacity;
    ctx.lineWidth = 3;

    ctx.translate(width / 2, height / 2);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(radius - numZones * halfWidth + padding, 0);
    ctx.lineTo(radius + halfWidth + padding, 0);
    ctx.stroke();
    ctx.closePath();

    ctx.restore();
  }
}

export default CursorRenderer;
