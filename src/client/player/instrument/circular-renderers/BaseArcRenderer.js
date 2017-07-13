import { Canvas2dRenderer } from 'soundworks/client';

// Ratio of the padding of the containing square relative to min(screenWidth, screenHeight)
const PADDING_RATIO = 1/12;
// Ratio of the width of the arc relative to min(screenWidth, screenHeight)
const ARC_WIDTH_RATIO = 1/8;

const asin = Math.asin;
const min = Math.min;
const _PI = Math.PI;
const _2PI = _PI * 2;
const _PIOver2 = _PI / 2;

/**
 * Base class for circular renderers.
 *
 * @param {Number} zone - Zone in which the arc should be displayed:
 *  - 0 is the larger possible radius,
 *  - each increment by one reduce the radius by half the width of the zone.
 * @param {Number} displayLength - Number of measures represented by a full circle.
 */
class BaseArcRenderer extends Canvas2dRenderer {
  constructor(zone, displayLength) {
    super();

    if (zone === undefined)
      throw new Error(`Not defined 'zone' in ${this.constructor.name} configuration`);

    this.zone = zone;
    this.displayLength = displayLength;

    this._paddingRatio = PADDING_RATIO;
    this._arcWidthRatio = ARC_WIDTH_RATIO;
  }

  init() {
    this.$cachedCanvas = document.createElement('canvas');
    this.$cachedCanvas.width = this.canvasWidth;
    this.$cachedCanvas.height = this.canvasHeight;
    this.cachedCtx = this.$cachedCanvas.getContext('2d');
  }

  onResize(width, height) {
    super.onResize(width, height);

    if (this.$cachedCanvas) {
      this.$cachedCanvas.width = this.canvasWidth;
      this.$cachedCanvas.height = this.canvasHeight;
    }

    const size = min(width, height);
    this.arcWidth = size * this._arcWidthRatio;
    this.radius = size / 2 - (this._paddingRatio * size) - ((this.zone + 1) * this.arcWidth / 2);

    // @todo - compute bounding box to crop the canvas copy on each render
  }

  getAngleFromPosition(position, cropPixels = false) {
    const displayLength = this.displayLength;
    const phase = (position % displayLength) / displayLength;
    // offset by pi/2 to move 0 on top
    let angle = phase * _2PI - _PIOver2;

    if (cropPixels)
      angle -= asin(10 * this.pixelRatio / this.canvasWidth);

    return angle;
  }
}

export default BaseArcRenderer;
