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
 * @param {Object} config
 */
var MeasuresRenderer = function (_BaseArcRenderer) {
  (0, _inherits3.default)(MeasuresRenderer, _BaseArcRenderer);

  function MeasuresRenderer(displayLength, config) {
    (0, _classCallCheck3.default)(this, MeasuresRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MeasuresRenderer.__proto__ || (0, _getPrototypeOf2.default)(MeasuresRenderer)).call(this, config.zone, displayLength));

    _this.config = (0, _assign2.default)({
      color: '#ffffff',
      opacity: 0.5
    }, config);
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

      _ctx.strokeStyle = this.config.color;
      _ctx.globalAlpha = this.config.opacity;
      _ctx.lineWidth = this.arcWidth;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lYXN1cmVzUmVuZGVyZXIuanMiXSwibmFtZXMiOlsiTWVhc3VyZXNSZW5kZXJlciIsImRpc3BsYXlMZW5ndGgiLCJjb25maWciLCJ6b25lIiwiY29sb3IiLCJvcGFjaXR5Iiwic2VnbWVudHMiLCJpIiwic3RhcnQiLCJnZXRBbmdsZUZyb21Qb3NpdGlvbiIsInN0b3AiLCJwdXNoIiwiX3JlbmRlciIsIndpZHRoIiwiaGVpZ2h0Iiwib3JpZW50YXRpb24iLCJjYWNoZWRDdHgiLCJfY3R4IiwiY2FudmFzV2lkdGgiLCJjYW52YXNIZWlnaHQiLCJjbGVhclJlY3QiLCJzYXZlIiwidHJhbnNsYXRlIiwic3Ryb2tlU3R5bGUiLCJnbG9iYWxBbHBoYSIsImxpbmVXaWR0aCIsImFyY1dpZHRoIiwiZm9yRWFjaCIsImFuZ2xlcyIsImJlZ2luUGF0aCIsImFyYyIsInJhZGl1cyIsInN0cm9rZSIsImNsb3NlUGF0aCIsInJlc3RvcmUiLCJjdHgiLCJkcmF3SW1hZ2UiLCIkY2FjaGVkQ2FudmFzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7OztBQUVBOzs7Ozs7SUFNTUEsZ0I7OztBQUNKLDRCQUFZQyxhQUFaLEVBQTJCQyxNQUEzQixFQUFtQztBQUFBOztBQUFBLDBKQUMzQkEsT0FBT0MsSUFEb0IsRUFDZEYsYUFEYzs7QUFHakMsVUFBS0MsTUFBTCxHQUFjLHNCQUFjO0FBQzFCRSxhQUFPLFNBRG1CO0FBRTFCQyxlQUFTO0FBRmlCLEtBQWQsRUFHWEgsTUFIVyxDQUFkO0FBSGlDO0FBT2xDOzs7OzJCQUVNO0FBQ0w7QUFDQSxXQUFLSSxRQUFMLEdBQWdCLEVBQWhCOztBQUVBLFdBQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJLEtBQUtOLGFBQXpCLEVBQXdDTSxHQUF4QyxFQUE2QztBQUMzQyxZQUFNQyxRQUFRLEtBQUtDLG9CQUFMLENBQTBCRixDQUExQixDQUFkO0FBQ0EsWUFBTUcsT0FBTyxLQUFLRCxvQkFBTCxDQUEwQkYsSUFBSSxDQUE5QixFQUFpQyxJQUFqQyxDQUFiO0FBQ0EsYUFBS0QsUUFBTCxDQUFjSyxJQUFkLENBQW1CLENBQUNILEtBQUQsRUFBUUUsSUFBUixDQUFuQjtBQUNEOztBQUVELFdBQUtFLE9BQUw7QUFDRDs7OzZCQUVRQyxLLEVBQU9DLE0sRUFBUUMsVyxFQUFhO0FBQ25DLHlKQUFlRixLQUFmLEVBQXNCQyxNQUF0QixFQUE4QkMsV0FBOUI7QUFDQTtBQUNBLFVBQUksS0FBS0MsU0FBVCxFQUNFLEtBQUtKLE9BQUw7QUFDSDs7OzhCQUVTO0FBQUE7O0FBQ1IsVUFBTUssT0FBTyxLQUFLRCxTQUFsQjtBQUNBLFVBQU1ILFFBQVEsS0FBS0ssV0FBbkI7QUFDQSxVQUFNSixTQUFTLEtBQUtLLFlBQXBCOztBQUVBRixXQUFLRyxTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQlAsS0FBckIsRUFBNEJDLE1BQTVCO0FBQ0FHLFdBQUtJLElBQUw7QUFDQUosV0FBS0ssU0FBTCxDQUFlVCxRQUFRLENBQXZCLEVBQTBCQyxTQUFTLENBQW5DOztBQUVBRyxXQUFLTSxXQUFMLEdBQW1CLEtBQUtyQixNQUFMLENBQVlFLEtBQS9CO0FBQ0FhLFdBQUtPLFdBQUwsR0FBbUIsS0FBS3RCLE1BQUwsQ0FBWUcsT0FBL0I7QUFDQVksV0FBS1EsU0FBTCxHQUFpQixLQUFLQyxRQUF0Qjs7QUFFQSxXQUFLcEIsUUFBTCxDQUFjcUIsT0FBZCxDQUFzQixVQUFDQyxNQUFELEVBQVk7QUFDaENYLGFBQUtZLFNBQUw7QUFDQVosYUFBS2EsR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsT0FBS0MsTUFBcEIsRUFBNEJILE9BQU8sQ0FBUCxDQUE1QixFQUF1Q0EsT0FBTyxDQUFQLENBQXZDLEVBQWtELEtBQWxEO0FBQ0FYLGFBQUtlLE1BQUw7QUFDQWYsYUFBS2dCLFNBQUw7QUFDRCxPQUxEOztBQU9BaEIsV0FBS2lCLE9BQUw7QUFDRDs7OzJCQUVNQyxHLEVBQUs7QUFDVkEsVUFBSUMsU0FBSixDQUFjLEtBQUtDLGFBQW5CLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLEtBQUtuQixXQUE3QyxFQUEwRCxLQUFLQyxZQUEvRDtBQUNEOzs7OztrQkFHWW5CLGdCIiwiZmlsZSI6Ik1lYXN1cmVzUmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUFyY1JlbmRlcmVyIGZyb20gJy4vQmFzZUFyY1JlbmRlcmVyJztcblxuLyoqXG4gKiBEaXNwbGF5IHRoZSBtZWFzdXJlcyBhcyBzZWdtZW50cy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gZGlzcGxheUxlbmd0aCAtIE5iciBvZiBtZWFzdXJlcyByZXByZXNlbnRlZCBpbiB0aGUgd2hvbGUgY2lyY2xlLlxuICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZ1xuICovXG5jbGFzcyBNZWFzdXJlc1JlbmRlcmVyIGV4dGVuZHMgQmFzZUFyY1JlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoZGlzcGxheUxlbmd0aCwgY29uZmlnKSB7XG4gICAgc3VwZXIoY29uZmlnLnpvbmUsIGRpc3BsYXlMZW5ndGgpO1xuXG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgICBvcGFjaXR5OiAwLjUsXG4gICAgfSwgY29uZmlnKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIHRoaXMuc2VnbWVudHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kaXNwbGF5TGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRBbmdsZUZyb21Qb3NpdGlvbihpKTtcbiAgICAgIGNvbnN0IHN0b3AgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKGkgKyAxLCB0cnVlKTtcbiAgICAgIHRoaXMuc2VnbWVudHMucHVzaChbc3RhcnQsIHN0b3BdKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIG9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgc3VwZXIub25SZXNpemUod2lkdGgsIGhlaWdodCwgb3JpZW50YXRpb24pO1xuICAgIC8vIGNhbiBiZSBjYWxsZWQgYmVmb3JlIGluaXRcbiAgICBpZiAodGhpcy5jYWNoZWRDdHgpXG4gICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgY29uc3QgX2N0eCA9IHRoaXMuY2FjaGVkQ3R4O1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5jYW52YXNXaWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcblxuICAgIF9jdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIF9jdHguc2F2ZSgpO1xuICAgIF9jdHgudHJhbnNsYXRlKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG5cbiAgICBfY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5jb25maWcuY29sb3I7XG4gICAgX2N0eC5nbG9iYWxBbHBoYSA9IHRoaXMuY29uZmlnLm9wYWNpdHk7XG4gICAgX2N0eC5saW5lV2lkdGggPSB0aGlzLmFyY1dpZHRoO1xuXG4gICAgdGhpcy5zZWdtZW50cy5mb3JFYWNoKChhbmdsZXMpID0+IHtcbiAgICAgIF9jdHguYmVnaW5QYXRoKCk7XG4gICAgICBfY3R4LmFyYygwLCAwLCB0aGlzLnJhZGl1cywgYW5nbGVzWzBdLCBhbmdsZXNbMV0sIGZhbHNlKTtcbiAgICAgIF9jdHguc3Ryb2tlKCk7XG4gICAgICBfY3R4LmNsb3NlUGF0aCgpO1xuICAgIH0pO1xuXG4gICAgX2N0eC5yZXN0b3JlKCk7XG4gIH1cblxuICByZW5kZXIoY3R4KSB7XG4gICAgY3R4LmRyYXdJbWFnZSh0aGlzLiRjYWNoZWRDYW52YXMsIDAsIDAsIHRoaXMuY2FudmFzV2lkdGgsIHRoaXMuY2FudmFzSGVpZ2h0KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZWFzdXJlc1JlbmRlcmVyO1xuIl19