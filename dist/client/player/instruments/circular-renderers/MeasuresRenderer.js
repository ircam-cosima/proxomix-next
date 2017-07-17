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

/**
 * Display the measures as segments.
 *
 * @param {Number} displayLength - Nbr of measures represented in the whole circle.
 * @param {Object} options
 */
var MeasuresRenderer = function (_BaseArcRenderer) {
  (0, _inherits3.default)(MeasuresRenderer, _BaseArcRenderer);

  function MeasuresRenderer(displayLength, options) {
    (0, _classCallCheck3.default)(this, MeasuresRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MeasuresRenderer.__proto__ || (0, _getPrototypeOf2.default)(MeasuresRenderer)).call(this, options.zone, displayLength));

    _this.options = (0, _assign2.default)({
      color: '#ffffff',
      opacity: 0.5
    }, options);
    return _this;
  }

  (0, _createClass3.default)(MeasuresRenderer, [{
    key: 'init',
    value: function init() {
      (0, _get3.default)(MeasuresRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(MeasuresRenderer.prototype), 'init', this).call(this);
      this.segments = [];

      for (var i = 0; i < this.displayLength; i++) {
        var start = this.getAngleFromPosition(i);
        var stop = this.getAngleFromPosition(i + 1, true);
        this.segments.push([start, stop]);
      }

      this._render();
    }
  }, {
    key: 'onResize',
    value: function onResize(width, height, orientation) {
      (0, _get3.default)(MeasuresRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(MeasuresRenderer.prototype), 'onResize', this).call(this, width, height, orientation);
      // can be called before init
      if (this.cachedCtx) this._render();
    }
  }, {
    key: '_render',
    value: function _render() {
      var _this2 = this;

      var _ctx = this.cachedCtx;
      var width = this.canvasWidth;
      var height = this.canvasHeight;

      _ctx.clearRect(0, 0, width, height);
      _ctx.save();
      _ctx.translate(width / 2, height / 2);

      _ctx.strokeStyle = this.options.color;
      _ctx.globalAlpha = this.options.opacity;
      _ctx.lineWidth = this.arcWidth - 2;

      this.segments.forEach(function (angles) {
        _ctx.beginPath();
        _ctx.arc(0, 0, _this2.radius, angles[0], angles[1], false);
        _ctx.stroke();
        _ctx.closePath();
      });

      _ctx.restore();
    }
  }, {
    key: 'render',
    value: function render(ctx) {
      ctx.drawImage(this.$cachedCanvas, 0, 0, this.canvasWidth, this.canvasHeight);
    }
  }]);
  return MeasuresRenderer;
}(_BaseArcRenderer3.default);

exports.default = MeasuresRenderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lYXN1cmVzUmVuZGVyZXIuanMiXSwibmFtZXMiOlsiTWVhc3VyZXNSZW5kZXJlciIsImRpc3BsYXlMZW5ndGgiLCJvcHRpb25zIiwiem9uZSIsImNvbG9yIiwib3BhY2l0eSIsInNlZ21lbnRzIiwiaSIsInN0YXJ0IiwiZ2V0QW5nbGVGcm9tUG9zaXRpb24iLCJzdG9wIiwicHVzaCIsIl9yZW5kZXIiLCJ3aWR0aCIsImhlaWdodCIsIm9yaWVudGF0aW9uIiwiY2FjaGVkQ3R4IiwiX2N0eCIsImNhbnZhc1dpZHRoIiwiY2FudmFzSGVpZ2h0IiwiY2xlYXJSZWN0Iiwic2F2ZSIsInRyYW5zbGF0ZSIsInN0cm9rZVN0eWxlIiwiZ2xvYmFsQWxwaGEiLCJsaW5lV2lkdGgiLCJhcmNXaWR0aCIsImZvckVhY2giLCJhbmdsZXMiLCJiZWdpblBhdGgiLCJhcmMiLCJyYWRpdXMiLCJzdHJva2UiLCJjbG9zZVBhdGgiLCJyZXN0b3JlIiwiY3R4IiwiZHJhd0ltYWdlIiwiJGNhY2hlZENhbnZhcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFFQTs7Ozs7O0lBTU1BLGdCOzs7QUFDSiw0QkFBWUMsYUFBWixFQUEyQkMsT0FBM0IsRUFBb0M7QUFBQTs7QUFBQSwwSkFDNUJBLFFBQVFDLElBRG9CLEVBQ2RGLGFBRGM7O0FBR2xDLFVBQUtDLE9BQUwsR0FBZSxzQkFBYztBQUMzQkUsYUFBTyxTQURvQjtBQUUzQkMsZUFBUztBQUZrQixLQUFkLEVBR1pILE9BSFksQ0FBZjtBQUhrQztBQU9uQzs7OzsyQkFFTTtBQUNMO0FBQ0EsV0FBS0ksUUFBTCxHQUFnQixFQUFoQjs7QUFFQSxXQUFLLElBQUlDLElBQUksQ0FBYixFQUFnQkEsSUFBSSxLQUFLTixhQUF6QixFQUF3Q00sR0FBeEMsRUFBNkM7QUFDM0MsWUFBTUMsUUFBUSxLQUFLQyxvQkFBTCxDQUEwQkYsQ0FBMUIsQ0FBZDtBQUNBLFlBQU1HLE9BQU8sS0FBS0Qsb0JBQUwsQ0FBMEJGLElBQUksQ0FBOUIsRUFBaUMsSUFBakMsQ0FBYjtBQUNBLGFBQUtELFFBQUwsQ0FBY0ssSUFBZCxDQUFtQixDQUFDSCxLQUFELEVBQVFFLElBQVIsQ0FBbkI7QUFDRDs7QUFFRCxXQUFLRSxPQUFMO0FBQ0Q7Ozs2QkFFUUMsSyxFQUFPQyxNLEVBQVFDLFcsRUFBYTtBQUNuQyx5SkFBZUYsS0FBZixFQUFzQkMsTUFBdEIsRUFBOEJDLFdBQTlCO0FBQ0E7QUFDQSxVQUFJLEtBQUtDLFNBQVQsRUFDRSxLQUFLSixPQUFMO0FBQ0g7Ozs4QkFFUztBQUFBOztBQUNSLFVBQU1LLE9BQU8sS0FBS0QsU0FBbEI7QUFDQSxVQUFNSCxRQUFRLEtBQUtLLFdBQW5CO0FBQ0EsVUFBTUosU0FBUyxLQUFLSyxZQUFwQjs7QUFFQUYsV0FBS0csU0FBTCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsRUFBcUJQLEtBQXJCLEVBQTRCQyxNQUE1QjtBQUNBRyxXQUFLSSxJQUFMO0FBQ0FKLFdBQUtLLFNBQUwsQ0FBZVQsUUFBUSxDQUF2QixFQUEwQkMsU0FBUyxDQUFuQzs7QUFFQUcsV0FBS00sV0FBTCxHQUFtQixLQUFLckIsT0FBTCxDQUFhRSxLQUFoQztBQUNBYSxXQUFLTyxXQUFMLEdBQW1CLEtBQUt0QixPQUFMLENBQWFHLE9BQWhDO0FBQ0FZLFdBQUtRLFNBQUwsR0FBaUIsS0FBS0MsUUFBTCxHQUFnQixDQUFqQzs7QUFFQSxXQUFLcEIsUUFBTCxDQUFjcUIsT0FBZCxDQUFzQixVQUFDQyxNQUFELEVBQVk7QUFDaENYLGFBQUtZLFNBQUw7QUFDQVosYUFBS2EsR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsT0FBS0MsTUFBcEIsRUFBNEJILE9BQU8sQ0FBUCxDQUE1QixFQUF1Q0EsT0FBTyxDQUFQLENBQXZDLEVBQWtELEtBQWxEO0FBQ0FYLGFBQUtlLE1BQUw7QUFDQWYsYUFBS2dCLFNBQUw7QUFDRCxPQUxEOztBQU9BaEIsV0FBS2lCLE9BQUw7QUFDRDs7OzJCQUVNQyxHLEVBQUs7QUFDVkEsVUFBSUMsU0FBSixDQUFjLEtBQUtDLGFBQW5CLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLEtBQUtuQixXQUE3QyxFQUEwRCxLQUFLQyxZQUEvRDtBQUNEOzs7OztrQkFHWW5CLGdCIiwiZmlsZSI6Ik1lYXN1cmVzUmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUFyY1JlbmRlcmVyIGZyb20gJy4vQmFzZUFyY1JlbmRlcmVyJztcblxuLyoqXG4gKiBEaXNwbGF5IHRoZSBtZWFzdXJlcyBhcyBzZWdtZW50cy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gZGlzcGxheUxlbmd0aCAtIE5iciBvZiBtZWFzdXJlcyByZXByZXNlbnRlZCBpbiB0aGUgd2hvbGUgY2lyY2xlLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqL1xuY2xhc3MgTWVhc3VyZXNSZW5kZXJlciBleHRlbmRzIEJhc2VBcmNSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKGRpc3BsYXlMZW5ndGgsIG9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zLnpvbmUsIGRpc3BsYXlMZW5ndGgpO1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgICAgb3BhY2l0eTogMC41LFxuICAgIH0sIG9wdGlvbnMpO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICBzdXBlci5pbml0KCk7XG4gICAgdGhpcy5zZWdtZW50cyA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmRpc3BsYXlMZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgc3RhcnQgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKGkpO1xuICAgICAgY29uc3Qgc3RvcCA9IHRoaXMuZ2V0QW5nbGVGcm9tUG9zaXRpb24oaSArIDEsIHRydWUpO1xuICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKFtzdGFydCwgc3RvcF0pO1xuICAgIH1cblxuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgb25SZXNpemUod2lkdGgsIGhlaWdodCwgb3JpZW50YXRpb24pIHtcbiAgICBzdXBlci5vblJlc2l6ZSh3aWR0aCwgaGVpZ2h0LCBvcmllbnRhdGlvbik7XG4gICAgLy8gY2FuIGJlIGNhbGxlZCBiZWZvcmUgaW5pdFxuICAgIGlmICh0aGlzLmNhY2hlZEN0eClcbiAgICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICBjb25zdCBfY3R4ID0gdGhpcy5jYWNoZWRDdHg7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLmNhbnZhc1dpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xuXG4gICAgX2N0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgX2N0eC5zYXZlKCk7XG4gICAgX2N0eC50cmFuc2xhdGUod2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcblxuICAgIF9jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLm9wdGlvbnMuY29sb3I7XG4gICAgX2N0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3B0aW9ucy5vcGFjaXR5O1xuICAgIF9jdHgubGluZVdpZHRoID0gdGhpcy5hcmNXaWR0aCAtIDI7XG5cbiAgICB0aGlzLnNlZ21lbnRzLmZvckVhY2goKGFuZ2xlcykgPT4ge1xuICAgICAgX2N0eC5iZWdpblBhdGgoKTtcbiAgICAgIF9jdHguYXJjKDAsIDAsIHRoaXMucmFkaXVzLCBhbmdsZXNbMF0sIGFuZ2xlc1sxXSwgZmFsc2UpO1xuICAgICAgX2N0eC5zdHJva2UoKTtcbiAgICAgIF9jdHguY2xvc2VQYXRoKCk7XG4gICAgfSk7XG5cbiAgICBfY3R4LnJlc3RvcmUoKTtcbiAgfVxuXG4gIHJlbmRlcihjdHgpIHtcbiAgICBjdHguZHJhd0ltYWdlKHRoaXMuJGNhY2hlZENhbnZhcywgMCwgMCwgdGhpcy5jYW52YXNXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1lYXN1cmVzUmVuZGVyZXI7XG4iXX0=