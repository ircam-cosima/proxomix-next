import { audio } from 'soundworks/client';
import BaseArcRenderer from './BaseArcRenderer';

const audioContext = audio.audioContext;

/**
 * Circular cursor.
 *
 * @param {Number} displayLength - Nbr of measures represented in the whole circle.
 * @param {MetricScehduler} metricScheduler
 * @param {}
 */
class CursorRenderer extends BaseArcRenderer {
  constructor(displayLength, config, metricScheduler) {
    super(0, displayLength);


    this.config = Object.assign({
      color: '#000000',
      opacity: 1,
      fadeOpacity: 0.02,
      numZones: 1,
    }, config);

    this.metricScheduler = metricScheduler;
  }

  render(ctx) {
    const _ctx = this.cachedCtx;
    const _$canvas = this.$cachedCanvas;
    const width = this.canvasWidth;
    const height = this.canvasHeight;
    const radius = this.radius;
    const halfWidth = this.arcWidth / 2;
    const numZones = this.config.numZones;
    const currentTime = audioContext.currentTime;
    const currentPosition = this.metricScheduler.getMetricPositionAtAudioTime(currentTime);
    const angle = this.getAngleFromPosition(currentPosition);
    const padding = 0;

    // background
    // _ctx.save();

    // _ctx.globalCompositeOperation = 'destination-out';
    // _ctx.fillStyle = '#000000';
    // _ctx.globalAlpha = this.config.fadeOpacity;
    // // _ctx.globalAlpha = 0.15;

    // _ctx.fillRect(0, 0, width, height);
    // _ctx.restore();

    _ctx.clearRect(0, 0, width, height);
    // cursor
    _ctx.save();
    // _ctx.strokeStyle = this.config.color;
    _ctx.strokeStyle = '#ffffff';
    _ctx.globalAlpha = this.config.opacity;
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
