'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Ratio of the padding of the containing square relative to min(screenWidth, screenHeight)
var PADDING_RATIO = 1 / 12;
// Ratio of the width of the arc relative to min(screenWidth, screenHeight)
var ARC_WIDTH_RATIO = 1 / 8;

var asin = Math.asin;
var min = Math.min;
var _PI = Math.PI;
var _2PI = _PI * 2;
var _PIOver2 = _PI / 2;

/**
 * Base class for circular renderers.
 *
 * @param {Number} zone - Zone in which the arc should be displayed:
 *  - 0 is the larger possible radius,
 *  - each increment by one reduce the radius by half the width of the zone.
 * @param {Number} displayLength - Number of measures represented by a full circle.
 */

var BaseArcRenderer = function (_Canvas2dRenderer) {
  (0, _inherits3.default)(BaseArcRenderer, _Canvas2dRenderer);

  function BaseArcRenderer(zone, displayLength) {
    (0, _classCallCheck3.default)(this, BaseArcRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (BaseArcRenderer.__proto__ || (0, _getPrototypeOf2.default)(BaseArcRenderer)).call(this));

    if (zone === undefined) throw new Error('Not defined \'zone\' in ' + _this.constructor.name + ' configuration');

    _this.zone = zone;
    _this.displayLength = displayLength;

    _this._paddingRatio = PADDING_RATIO;
    _this._arcWidthRatio = ARC_WIDTH_RATIO;
    return _this;
  }

  (0, _createClass3.default)(BaseArcRenderer, [{
    key: 'init',
    value: function init() {
      this.$cachedCanvas = document.createElement('canvas');
      this.$cachedCanvas.width = this.canvasWidth;
      this.$cachedCanvas.height = this.canvasHeight;
      this.cachedCtx = this.$cachedCanvas.getContext('2d');
    }
  }, {
    key: 'onResize',
    value: function onResize(width, height) {
      (0, _get3.default)(BaseArcRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(BaseArcRenderer.prototype), 'onResize', this).call(this, width, height);

      if (this.$cachedCanvas) {
        this.$cachedCanvas.width = this.canvasWidth;
        this.$cachedCanvas.height = this.canvasHeight;
      }

      var size = min(width, height);
      this.arcWidth = size * this._arcWidthRatio;
      this.radius = size / 2 - this._paddingRatio * size - (this.zone + 1) * this.arcWidth / 2;

      // @todo - compute bounding box to crop the canvas copy on each render
    }
  }, {
    key: 'getAngleFromPosition',
    value: function getAngleFromPosition(position) {
      var cropPixels = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var displayLength = this.displayLength;
      var phase = position % displayLength / displayLength;
      // offset by pi/2 to move 0 on top
      var angle = phase * _2PI - _PIOver2;

      if (cropPixels) angle -= asin(10 * this.pixelRatio / this.canvasWidth);

      return angle;
    }
  }]);
  return BaseArcRenderer;
}(_client.Canvas2dRenderer);

exports.default = BaseArcRenderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhc2VBcmNSZW5kZXJlci5qcyJdLCJuYW1lcyI6WyJQQURESU5HX1JBVElPIiwiQVJDX1dJRFRIX1JBVElPIiwiYXNpbiIsIk1hdGgiLCJtaW4iLCJfUEkiLCJQSSIsIl8yUEkiLCJfUElPdmVyMiIsIkJhc2VBcmNSZW5kZXJlciIsInpvbmUiLCJkaXNwbGF5TGVuZ3RoIiwidW5kZWZpbmVkIiwiRXJyb3IiLCJjb25zdHJ1Y3RvciIsIm5hbWUiLCJfcGFkZGluZ1JhdGlvIiwiX2FyY1dpZHRoUmF0aW8iLCIkY2FjaGVkQ2FudmFzIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwid2lkdGgiLCJjYW52YXNXaWR0aCIsImhlaWdodCIsImNhbnZhc0hlaWdodCIsImNhY2hlZEN0eCIsImdldENvbnRleHQiLCJzaXplIiwiYXJjV2lkdGgiLCJyYWRpdXMiLCJwb3NpdGlvbiIsImNyb3BQaXhlbHMiLCJwaGFzZSIsImFuZ2xlIiwicGl4ZWxSYXRpbyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7QUFFQTtBQUNBLElBQU1BLGdCQUFnQixJQUFFLEVBQXhCO0FBQ0E7QUFDQSxJQUFNQyxrQkFBa0IsSUFBRSxDQUExQjs7QUFFQSxJQUFNQyxPQUFPQyxLQUFLRCxJQUFsQjtBQUNBLElBQU1FLE1BQU1ELEtBQUtDLEdBQWpCO0FBQ0EsSUFBTUMsTUFBTUYsS0FBS0csRUFBakI7QUFDQSxJQUFNQyxPQUFPRixNQUFNLENBQW5CO0FBQ0EsSUFBTUcsV0FBV0gsTUFBTSxDQUF2Qjs7QUFFQTs7Ozs7Ozs7O0lBUU1JLGU7OztBQUNKLDJCQUFZQyxJQUFaLEVBQWtCQyxhQUFsQixFQUFpQztBQUFBOztBQUFBOztBQUcvQixRQUFJRCxTQUFTRSxTQUFiLEVBQ0UsTUFBTSxJQUFJQyxLQUFKLDhCQUFtQyxNQUFLQyxXQUFMLENBQWlCQyxJQUFwRCxvQkFBTjs7QUFFRixVQUFLTCxJQUFMLEdBQVlBLElBQVo7QUFDQSxVQUFLQyxhQUFMLEdBQXFCQSxhQUFyQjs7QUFFQSxVQUFLSyxhQUFMLEdBQXFCaEIsYUFBckI7QUFDQSxVQUFLaUIsY0FBTCxHQUFzQmhCLGVBQXRCO0FBVitCO0FBV2hDOzs7OzJCQUVNO0FBQ0wsV0FBS2lCLGFBQUwsR0FBcUJDLFNBQVNDLGFBQVQsQ0FBdUIsUUFBdkIsQ0FBckI7QUFDQSxXQUFLRixhQUFMLENBQW1CRyxLQUFuQixHQUEyQixLQUFLQyxXQUFoQztBQUNBLFdBQUtKLGFBQUwsQ0FBbUJLLE1BQW5CLEdBQTRCLEtBQUtDLFlBQWpDO0FBQ0EsV0FBS0MsU0FBTCxHQUFpQixLQUFLUCxhQUFMLENBQW1CUSxVQUFuQixDQUE4QixJQUE5QixDQUFqQjtBQUNEOzs7NkJBRVFMLEssRUFBT0UsTSxFQUFRO0FBQ3RCLHVKQUFlRixLQUFmLEVBQXNCRSxNQUF0Qjs7QUFFQSxVQUFJLEtBQUtMLGFBQVQsRUFBd0I7QUFDdEIsYUFBS0EsYUFBTCxDQUFtQkcsS0FBbkIsR0FBMkIsS0FBS0MsV0FBaEM7QUFDQSxhQUFLSixhQUFMLENBQW1CSyxNQUFuQixHQUE0QixLQUFLQyxZQUFqQztBQUNEOztBQUVELFVBQU1HLE9BQU92QixJQUFJaUIsS0FBSixFQUFXRSxNQUFYLENBQWI7QUFDQSxXQUFLSyxRQUFMLEdBQWdCRCxPQUFPLEtBQUtWLGNBQTVCO0FBQ0EsV0FBS1ksTUFBTCxHQUFjRixPQUFPLENBQVAsR0FBWSxLQUFLWCxhQUFMLEdBQXFCVyxJQUFqQyxHQUEwQyxDQUFDLEtBQUtqQixJQUFMLEdBQVksQ0FBYixJQUFrQixLQUFLa0IsUUFBdkIsR0FBa0MsQ0FBMUY7O0FBRUE7QUFDRDs7O3lDQUVvQkUsUSxFQUE4QjtBQUFBLFVBQXBCQyxVQUFvQix1RUFBUCxLQUFPOztBQUNqRCxVQUFNcEIsZ0JBQWdCLEtBQUtBLGFBQTNCO0FBQ0EsVUFBTXFCLFFBQVNGLFdBQVduQixhQUFaLEdBQTZCQSxhQUEzQztBQUNBO0FBQ0EsVUFBSXNCLFFBQVFELFFBQVF6QixJQUFSLEdBQWVDLFFBQTNCOztBQUVBLFVBQUl1QixVQUFKLEVBQ0VFLFNBQVMvQixLQUFLLEtBQUssS0FBS2dDLFVBQVYsR0FBdUIsS0FBS1osV0FBakMsQ0FBVDs7QUFFRixhQUFPVyxLQUFQO0FBQ0Q7Ozs7O2tCQUdZeEIsZSIsImZpbGUiOiJCYXNlQXJjUmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDYW52YXMyZFJlbmRlcmVyIH0gZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuXG4vLyBSYXRpbyBvZiB0aGUgcGFkZGluZyBvZiB0aGUgY29udGFpbmluZyBzcXVhcmUgcmVsYXRpdmUgdG8gbWluKHNjcmVlbldpZHRoLCBzY3JlZW5IZWlnaHQpXG5jb25zdCBQQURESU5HX1JBVElPID0gMS8xMjtcbi8vIFJhdGlvIG9mIHRoZSB3aWR0aCBvZiB0aGUgYXJjIHJlbGF0aXZlIHRvIG1pbihzY3JlZW5XaWR0aCwgc2NyZWVuSGVpZ2h0KVxuY29uc3QgQVJDX1dJRFRIX1JBVElPID0gMS84O1xuXG5jb25zdCBhc2luID0gTWF0aC5hc2luO1xuY29uc3QgbWluID0gTWF0aC5taW47XG5jb25zdCBfUEkgPSBNYXRoLlBJO1xuY29uc3QgXzJQSSA9IF9QSSAqIDI7XG5jb25zdCBfUElPdmVyMiA9IF9QSSAvIDI7XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgY2lyY3VsYXIgcmVuZGVyZXJzLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB6b25lIC0gWm9uZSBpbiB3aGljaCB0aGUgYXJjIHNob3VsZCBiZSBkaXNwbGF5ZWQ6XG4gKiAgLSAwIGlzIHRoZSBsYXJnZXIgcG9zc2libGUgcmFkaXVzLFxuICogIC0gZWFjaCBpbmNyZW1lbnQgYnkgb25lIHJlZHVjZSB0aGUgcmFkaXVzIGJ5IGhhbGYgdGhlIHdpZHRoIG9mIHRoZSB6b25lLlxuICogQHBhcmFtIHtOdW1iZXJ9IGRpc3BsYXlMZW5ndGggLSBOdW1iZXIgb2YgbWVhc3VyZXMgcmVwcmVzZW50ZWQgYnkgYSBmdWxsIGNpcmNsZS5cbiAqL1xuY2xhc3MgQmFzZUFyY1JlbmRlcmVyIGV4dGVuZHMgQ2FudmFzMmRSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKHpvbmUsIGRpc3BsYXlMZW5ndGgpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgaWYgKHpvbmUgPT09IHVuZGVmaW5lZClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IGRlZmluZWQgJ3pvbmUnIGluICR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfSBjb25maWd1cmF0aW9uYCk7XG5cbiAgICB0aGlzLnpvbmUgPSB6b25lO1xuICAgIHRoaXMuZGlzcGxheUxlbmd0aCA9IGRpc3BsYXlMZW5ndGg7XG5cbiAgICB0aGlzLl9wYWRkaW5nUmF0aW8gPSBQQURESU5HX1JBVElPO1xuICAgIHRoaXMuX2FyY1dpZHRoUmF0aW8gPSBBUkNfV0lEVEhfUkFUSU87XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMuJGNhY2hlZENhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHRoaXMuJGNhY2hlZENhbnZhcy53aWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XG4gICAgdGhpcy4kY2FjaGVkQ2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xuICAgIHRoaXMuY2FjaGVkQ3R4ID0gdGhpcy4kY2FjaGVkQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gIH1cblxuICBvblJlc2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgc3VwZXIub25SZXNpemUod2lkdGgsIGhlaWdodCk7XG5cbiAgICBpZiAodGhpcy4kY2FjaGVkQ2FudmFzKSB7XG4gICAgICB0aGlzLiRjYWNoZWRDYW52YXMud2lkdGggPSB0aGlzLmNhbnZhc1dpZHRoO1xuICAgICAgdGhpcy4kY2FjaGVkQ2FudmFzLmhlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xuICAgIH1cblxuICAgIGNvbnN0IHNpemUgPSBtaW4od2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5hcmNXaWR0aCA9IHNpemUgKiB0aGlzLl9hcmNXaWR0aFJhdGlvO1xuICAgIHRoaXMucmFkaXVzID0gc2l6ZSAvIDIgLSAodGhpcy5fcGFkZGluZ1JhdGlvICogc2l6ZSkgLSAoKHRoaXMuem9uZSArIDEpICogdGhpcy5hcmNXaWR0aCAvIDIpO1xuXG4gICAgLy8gQHRvZG8gLSBjb21wdXRlIGJvdW5kaW5nIGJveCB0byBjcm9wIHRoZSBjYW52YXMgY29weSBvbiBlYWNoIHJlbmRlclxuICB9XG5cbiAgZ2V0QW5nbGVGcm9tUG9zaXRpb24ocG9zaXRpb24sIGNyb3BQaXhlbHMgPSBmYWxzZSkge1xuICAgIGNvbnN0IGRpc3BsYXlMZW5ndGggPSB0aGlzLmRpc3BsYXlMZW5ndGg7XG4gICAgY29uc3QgcGhhc2UgPSAocG9zaXRpb24gJSBkaXNwbGF5TGVuZ3RoKSAvIGRpc3BsYXlMZW5ndGg7XG4gICAgLy8gb2Zmc2V0IGJ5IHBpLzIgdG8gbW92ZSAwIG9uIHRvcFxuICAgIGxldCBhbmdsZSA9IHBoYXNlICogXzJQSSAtIF9QSU92ZXIyO1xuXG4gICAgaWYgKGNyb3BQaXhlbHMpXG4gICAgICBhbmdsZSAtPSBhc2luKDEwICogdGhpcy5waXhlbFJhdGlvIC8gdGhpcy5jYW52YXNXaWR0aCk7XG5cbiAgICByZXR1cm4gYW5nbGU7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzZUFyY1JlbmRlcmVyO1xuIl19