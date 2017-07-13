import BaseArcRenderer from './BaseArcRenderer';

const abs = Math.abs;

/**
 * Piano-roll like circular renderer.
 * @param {Number} displayLength - Number of measures represented by a full circle.
 * @param {Object} config
 * @param {Array<Array<Number>>} pattern - Pattern to be displayed.
 * @param {Array<Number>} boundaries - Min and max values of the pattern.
 */
class PatternRenderer extends BaseArcRenderer {
  constructor(displayLength, config) {
    super(config.zone, displayLength);

    this.config = Object.assign({
      opacity: 1,
      color: '#ffffff',
    }, config);

    this.segments = [];
  }

  onResize(width, height, orientation) {
    super.onResize(width, height, orientation);

    const score = this.config.score;
    const pattern = this.config.pattern;

    let min = +Infinity;
    let max = -Infinity;

    for (let i = 0; i < score.length; i++) {
      for (let j = 0; j < score[i].length; j++) {
        for (let k = 0; k < score[i][j].length; k++) {
          const val = score[i][j][k];
          if (val > max) max = val;
          if (val < min) min = val;
        }
      }
    }

    this.noteWidth = this.arcWidth / (abs(max - min) + 1);
    this.baseRadius = (this.radius - this.arcWidth / 2) + this.noteWidth / 2;

    // init or recompute segments
    const scoreLength = score.length; // nbr of measures
    this.segments.length = 0;

    for (let measure = 0; measure < this.displayLength; measure++) {
      const measurePattern = score[measure % scoreLength];
      const beatLength = measurePattern.length; // nbr of beats per seconds

      for (let beat = 0; beat < measurePattern.length; beat++) {
        const notes = measurePattern[beat];

        for (let noteIndex = 0; noteIndex < notes.length; noteIndex++) {
          const positionStart = measure + beat / beatLength;
          const positionStop = measure + (beat + 1) / beatLength;
          const angleStart = this.getAngleFromPosition(positionStart);
          const angleStop = this.getAngleFromPosition(positionStop);
          const radius = this.baseRadius + notes[noteIndex] * this.noteWidth;

          this.segments.push({ angleStart, angleStop, radius });
        }
      }
    }

    if (this.cachedCtx)
      this._render();
  }

  init() {
    super.init();
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
    _ctx.lineWidth = this.noteWidth;

    this.segments.forEach((segment) => {
      const { angleStart, angleStop, radius } = segment;

      _ctx.beginPath();
      _ctx.arc(0, 0, radius, angleStart, angleStop, false);
      _ctx.stroke();
      _ctx.closePath();
    });

    _ctx.restore();
  }

  render(ctx) {
    ctx.drawImage(this.$cachedCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
  }
}

export default PatternRenderer;
