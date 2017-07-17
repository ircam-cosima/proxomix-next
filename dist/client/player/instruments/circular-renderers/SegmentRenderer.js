'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _BaseArcRenderer2 = require('./BaseArcRenderer');

var _BaseArcRenderer3 = _interopRequireDefault(_BaseArcRenderer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _2PI = 2 * Math.PI;

/**
 * @param {Number} displayLength - Nbr of measures represented in the whole circle.
 * @param {Object} options
 */

var SegmentRenderer = function (_BaseArcRenderer) {
  (0, _inherits3.default)(SegmentRenderer, _BaseArcRenderer);

  function SegmentRenderer(displayLength, options) {
    (0, _classCallCheck3.default)(this, SegmentRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SegmentRenderer.__proto__ || (0, _getPrototypeOf2.default)(SegmentRenderer)).call(this, options.zone, displayLength));

    _this.options = (0, _assign2.default)({
      color: '#565656',
      opacity: 0.5,
      start: 0,
      length: displayLength
    }, options);

    console.log(_this.options);
    return _this;
  }

  (0, _createClass3.default)(SegmentRenderer, [{
    key: 'init',
    value: function init() {
      (0, _get3.default)(SegmentRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(SegmentRenderer.prototype), 'init', this).call(this);
      var options = this.options;

      this.color = options.color;
      this.startAngle = this.getAngleFromPosition(options.start);

      if (options.length === Infinity) this.stopAngle = this.startAngle + _2PI;else if (options.length === this.displayLength) this.stopAngle = this.getAngleFromPosition(options.start, true);else this.stopAngle = this.getAngleFromPosition(options.start + options.length);

      this._render();
    }
  }, {
    key: 'onResize',
    value: function onResize(width, height, orientation) {
      (0, _get3.default)(SegmentRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(SegmentRenderer.prototype), 'onResize', this).call(this, width, height, orientation);

      if (this.cachedCtx) this._render();
    }
  }, {
    key: '_render',
    value: function _render() {
      var _ctx = this.cachedCtx;
      var width = this.canvasWidth;
      var height = this.canvasHeight;

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
  }, {
    key: 'render',
    value: function render(ctx) {
      ctx.drawImage(this.$cachedCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
    }
  }]);
  return SegmentRenderer;
}(_BaseArcRenderer3.default);

exports.default = SegmentRenderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlZ21lbnRSZW5kZXJlci5qcyJdLCJuYW1lcyI6WyJfMlBJIiwiTWF0aCIsIlBJIiwiU2VnbWVudFJlbmRlcmVyIiwiZGlzcGxheUxlbmd0aCIsIm9wdGlvbnMiLCJ6b25lIiwiY29sb3IiLCJvcGFjaXR5Iiwic3RhcnQiLCJsZW5ndGgiLCJjb25zb2xlIiwibG9nIiwic3RhcnRBbmdsZSIsImdldEFuZ2xlRnJvbVBvc2l0aW9uIiwiSW5maW5pdHkiLCJzdG9wQW5nbGUiLCJfcmVuZGVyIiwid2lkdGgiLCJoZWlnaHQiLCJvcmllbnRhdGlvbiIsImNhY2hlZEN0eCIsIl9jdHgiLCJjYW52YXNXaWR0aCIsImNhbnZhc0hlaWdodCIsImNsZWFyUmVjdCIsInNhdmUiLCJ0cmFuc2xhdGUiLCJzdHJva2VTdHlsZSIsImdsb2JhbEFscGhhIiwibGluZVdpZHRoIiwiYXJjV2lkdGgiLCJiZWdpblBhdGgiLCJhcmMiLCJyYWRpdXMiLCJzdHJva2UiLCJjbG9zZVBhdGgiLCJyZXN0b3JlIiwiY3R4IiwiZHJhd0ltYWdlIiwiJGNhY2hlZENhbnZhcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFFQSxJQUFNQSxPQUFPLElBQUlDLEtBQUtDLEVBQXRCOztBQUVBOzs7OztJQUlNQyxlOzs7QUFDSiwyQkFBWUMsYUFBWixFQUEyQkMsT0FBM0IsRUFBb0M7QUFBQTs7QUFBQSx3SkFDNUJBLFFBQVFDLElBRG9CLEVBQ2RGLGFBRGM7O0FBR2xDLFVBQUtDLE9BQUwsR0FBZSxzQkFBYztBQUMzQkUsYUFBTyxTQURvQjtBQUUzQkMsZUFBUyxHQUZrQjtBQUczQkMsYUFBTyxDQUhvQjtBQUkzQkMsY0FBUU47QUFKbUIsS0FBZCxFQUtaQyxPQUxZLENBQWY7O0FBT0FNLFlBQVFDLEdBQVIsQ0FBWSxNQUFLUCxPQUFqQjtBQVZrQztBQVduQzs7OzsyQkFFTTtBQUNMO0FBQ0EsVUFBTUEsVUFBVSxLQUFLQSxPQUFyQjs7QUFFQSxXQUFLRSxLQUFMLEdBQWFGLFFBQVFFLEtBQXJCO0FBQ0EsV0FBS00sVUFBTCxHQUFrQixLQUFLQyxvQkFBTCxDQUEwQlQsUUFBUUksS0FBbEMsQ0FBbEI7O0FBRUEsVUFBSUosUUFBUUssTUFBUixLQUFtQkssUUFBdkIsRUFDRSxLQUFLQyxTQUFMLEdBQWlCLEtBQUtILFVBQUwsR0FBa0JiLElBQW5DLENBREYsS0FFSyxJQUFJSyxRQUFRSyxNQUFSLEtBQW1CLEtBQUtOLGFBQTVCLEVBQ0gsS0FBS1ksU0FBTCxHQUFpQixLQUFLRixvQkFBTCxDQUEwQlQsUUFBUUksS0FBbEMsRUFBeUMsSUFBekMsQ0FBakIsQ0FERyxLQUdILEtBQUtPLFNBQUwsR0FBaUIsS0FBS0Ysb0JBQUwsQ0FBMEJULFFBQVFJLEtBQVIsR0FBZ0JKLFFBQVFLLE1BQWxELENBQWpCOztBQUVGLFdBQUtPLE9BQUw7QUFDRDs7OzZCQUVRQyxLLEVBQU9DLE0sRUFBUUMsVyxFQUFhO0FBQ25DLHVKQUFlRixLQUFmLEVBQXNCQyxNQUF0QixFQUE4QkMsV0FBOUI7O0FBRUEsVUFBSSxLQUFLQyxTQUFULEVBQ0UsS0FBS0osT0FBTDtBQUNIOzs7OEJBRVM7QUFDUixVQUFNSyxPQUFPLEtBQUtELFNBQWxCO0FBQ0EsVUFBTUgsUUFBUSxLQUFLSyxXQUFuQjtBQUNBLFVBQU1KLFNBQVMsS0FBS0ssWUFBcEI7O0FBRUFGLFdBQUtHLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLENBQWxCLEVBQXFCUCxLQUFyQixFQUE0QkMsTUFBNUI7QUFDQUcsV0FBS0ksSUFBTDtBQUNBSixXQUFLSyxTQUFMLENBQWVULFFBQVEsQ0FBdkIsRUFBMEJDLFNBQVMsQ0FBbkM7O0FBRUFHLFdBQUtNLFdBQUwsR0FBbUIsS0FBS3JCLEtBQXhCO0FBQ0FlLFdBQUtPLFdBQUwsR0FBbUIsS0FBS3hCLE9BQUwsQ0FBYUcsT0FBaEM7QUFDQWMsV0FBS1EsU0FBTCxHQUFpQixLQUFLQyxRQUF0Qjs7QUFFQVQsV0FBS1UsU0FBTDtBQUNBVixXQUFLVyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxLQUFLQyxNQUFwQixFQUE0QixLQUFLckIsVUFBakMsRUFBNkMsS0FBS0csU0FBbEQsRUFBNkQsS0FBN0Q7QUFDQU0sV0FBS2EsTUFBTDtBQUNBYixXQUFLYyxTQUFMOztBQUVBZCxXQUFLZSxPQUFMO0FBQ0Q7OzsyQkFFTUMsRyxFQUFLO0FBQ1ZBLFVBQUlDLFNBQUosQ0FBYyxLQUFLQyxhQUFuQixFQUFrQyxDQUFsQyxFQUFxQyxDQUFyQyxFQUF3QyxLQUFLakIsV0FBN0MsRUFBMEQsS0FBS0MsWUFBL0Q7QUFDRDs7Ozs7a0JBR1lyQixlIiwiZmlsZSI6IlNlZ21lbnRSZW5kZXJlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCYXNlQXJjUmVuZGVyZXIgZnJvbSAnLi9CYXNlQXJjUmVuZGVyZXInO1xuXG5jb25zdCBfMlBJID0gMiAqIE1hdGguUEk7XG5cbi8qKlxuICogQHBhcmFtIHtOdW1iZXJ9IGRpc3BsYXlMZW5ndGggLSBOYnIgb2YgbWVhc3VyZXMgcmVwcmVzZW50ZWQgaW4gdGhlIHdob2xlIGNpcmNsZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cbmNsYXNzIFNlZ21lbnRSZW5kZXJlciBleHRlbmRzIEJhc2VBcmNSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKGRpc3BsYXlMZW5ndGgsIG9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zLnpvbmUsIGRpc3BsYXlMZW5ndGgpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBjb2xvcjogJyM1NjU2NTYnLFxuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgc3RhcnQ6IDAsXG4gICAgICBsZW5ndGg6IGRpc3BsYXlMZW5ndGgsXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICBjb25zb2xlLmxvZyh0aGlzLm9wdGlvbnMpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBzdXBlci5pbml0KCk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgIHRoaXMuY29sb3IgPSBvcHRpb25zLmNvbG9yO1xuICAgIHRoaXMuc3RhcnRBbmdsZSA9IHRoaXMuZ2V0QW5nbGVGcm9tUG9zaXRpb24ob3B0aW9ucy5zdGFydCk7XG5cbiAgICBpZiAob3B0aW9ucy5sZW5ndGggPT09IEluZmluaXR5KVxuICAgICAgdGhpcy5zdG9wQW5nbGUgPSB0aGlzLnN0YXJ0QW5nbGUgKyBfMlBJO1xuICAgIGVsc2UgaWYgKG9wdGlvbnMubGVuZ3RoID09PSB0aGlzLmRpc3BsYXlMZW5ndGgpXG4gICAgICB0aGlzLnN0b3BBbmdsZSA9IHRoaXMuZ2V0QW5nbGVGcm9tUG9zaXRpb24ob3B0aW9ucy5zdGFydCwgdHJ1ZSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zdG9wQW5nbGUgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKG9wdGlvbnMuc3RhcnQgKyBvcHRpb25zLmxlbmd0aCk7XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIG9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgc3VwZXIub25SZXNpemUod2lkdGgsIGhlaWdodCwgb3JpZW50YXRpb24pO1xuXG4gICAgaWYgKHRoaXMuY2FjaGVkQ3R4KVxuICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBfcmVuZGVyKCkge1xuICAgIGNvbnN0IF9jdHggPSB0aGlzLmNhY2hlZEN0eDtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5jYW52YXNIZWlnaHQ7XG5cbiAgICBfY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICBfY3R4LnNhdmUoKTtcbiAgICBfY3R4LnRyYW5zbGF0ZSh3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuXG4gICAgX2N0eC5zdHJva2VTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgX2N0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3B0aW9ucy5vcGFjaXR5O1xuICAgIF9jdHgubGluZVdpZHRoID0gdGhpcy5hcmNXaWR0aDtcblxuICAgIF9jdHguYmVnaW5QYXRoKCk7XG4gICAgX2N0eC5hcmMoMCwgMCwgdGhpcy5yYWRpdXMsIHRoaXMuc3RhcnRBbmdsZSwgdGhpcy5zdG9wQW5nbGUsIGZhbHNlKTtcbiAgICBfY3R4LnN0cm9rZSgpO1xuICAgIF9jdHguY2xvc2VQYXRoKCk7XG5cbiAgICBfY3R4LnJlc3RvcmUoKTtcbiAgfVxuXG4gIHJlbmRlcihjdHgpIHtcbiAgICBjdHguZHJhd0ltYWdlKHRoaXMuJGNhY2hlZENhbnZhcywgMCwgMCwgdGhpcy5jYW52YXNXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlZ21lbnRSZW5kZXJlcjtcbiJdfQ==