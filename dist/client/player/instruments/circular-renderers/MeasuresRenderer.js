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

    _this._color = _this.options.color;
    _this._opacity = _this.options.opacity;
    return _this;
  }

  (0, _createClass3.default)(MeasuresRenderer, [{
    key: 'setColor',
    value: function setColor(value) {
      this._color = value;
      this._render();
    }
  }, {
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

      _ctx.strokeStyle = this._color;
      _ctx.globalAlpha = this._opacity;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1lYXN1cmVzUmVuZGVyZXIuanMiXSwibmFtZXMiOlsiTWVhc3VyZXNSZW5kZXJlciIsImRpc3BsYXlMZW5ndGgiLCJvcHRpb25zIiwiem9uZSIsImNvbG9yIiwib3BhY2l0eSIsIl9jb2xvciIsIl9vcGFjaXR5IiwidmFsdWUiLCJfcmVuZGVyIiwic2VnbWVudHMiLCJpIiwic3RhcnQiLCJnZXRBbmdsZUZyb21Qb3NpdGlvbiIsInN0b3AiLCJwdXNoIiwid2lkdGgiLCJoZWlnaHQiLCJvcmllbnRhdGlvbiIsImNhY2hlZEN0eCIsIl9jdHgiLCJjYW52YXNXaWR0aCIsImNhbnZhc0hlaWdodCIsImNsZWFyUmVjdCIsInNhdmUiLCJ0cmFuc2xhdGUiLCJzdHJva2VTdHlsZSIsImdsb2JhbEFscGhhIiwibGluZVdpZHRoIiwiYXJjV2lkdGgiLCJmb3JFYWNoIiwiYW5nbGVzIiwiYmVnaW5QYXRoIiwiYXJjIiwicmFkaXVzIiwic3Ryb2tlIiwiY2xvc2VQYXRoIiwicmVzdG9yZSIsImN0eCIsImRyYXdJbWFnZSIsIiRjYWNoZWRDYW52YXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBRUE7Ozs7OztJQU1NQSxnQjs7O0FBQ0osNEJBQVlDLGFBQVosRUFBMkJDLE9BQTNCLEVBQW9DO0FBQUE7O0FBQUEsMEpBQzVCQSxRQUFRQyxJQURvQixFQUNkRixhQURjOztBQUdsQyxVQUFLQyxPQUFMLEdBQWUsc0JBQWM7QUFDM0JFLGFBQU8sU0FEb0I7QUFFM0JDLGVBQVM7QUFGa0IsS0FBZCxFQUdaSCxPQUhZLENBQWY7O0FBS0EsVUFBS0ksTUFBTCxHQUFjLE1BQUtKLE9BQUwsQ0FBYUUsS0FBM0I7QUFDQSxVQUFLRyxRQUFMLEdBQWdCLE1BQUtMLE9BQUwsQ0FBYUcsT0FBN0I7QUFUa0M7QUFVbkM7Ozs7NkJBRVFHLEssRUFBTztBQUNkLFdBQUtGLE1BQUwsR0FBY0UsS0FBZDtBQUNBLFdBQUtDLE9BQUw7QUFDRDs7OzJCQUVNO0FBQ0w7QUFDQSxXQUFLQyxRQUFMLEdBQWdCLEVBQWhCOztBQUVBLFdBQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJLEtBQUtWLGFBQXpCLEVBQXdDVSxHQUF4QyxFQUE2QztBQUMzQyxZQUFNQyxRQUFRLEtBQUtDLG9CQUFMLENBQTBCRixDQUExQixDQUFkO0FBQ0EsWUFBTUcsT0FBTyxLQUFLRCxvQkFBTCxDQUEwQkYsSUFBSSxDQUE5QixFQUFpQyxJQUFqQyxDQUFiO0FBQ0EsYUFBS0QsUUFBTCxDQUFjSyxJQUFkLENBQW1CLENBQUNILEtBQUQsRUFBUUUsSUFBUixDQUFuQjtBQUNEOztBQUVELFdBQUtMLE9BQUw7QUFDRDs7OzZCQUVRTyxLLEVBQU9DLE0sRUFBUUMsVyxFQUFhO0FBQ25DLHlKQUFlRixLQUFmLEVBQXNCQyxNQUF0QixFQUE4QkMsV0FBOUI7QUFDQTtBQUNBLFVBQUksS0FBS0MsU0FBVCxFQUNFLEtBQUtWLE9BQUw7QUFDSDs7OzhCQUVTO0FBQUE7O0FBQ1IsVUFBTVcsT0FBTyxLQUFLRCxTQUFsQjtBQUNBLFVBQU1ILFFBQVEsS0FBS0ssV0FBbkI7QUFDQSxVQUFNSixTQUFTLEtBQUtLLFlBQXBCOztBQUVBRixXQUFLRyxTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQlAsS0FBckIsRUFBNEJDLE1BQTVCO0FBQ0FHLFdBQUtJLElBQUw7QUFDQUosV0FBS0ssU0FBTCxDQUFlVCxRQUFRLENBQXZCLEVBQTBCQyxTQUFTLENBQW5DOztBQUVBRyxXQUFLTSxXQUFMLEdBQW1CLEtBQUtwQixNQUF4QjtBQUNBYyxXQUFLTyxXQUFMLEdBQW1CLEtBQUtwQixRQUF4QjtBQUNBYSxXQUFLUSxTQUFMLEdBQWlCLEtBQUtDLFFBQUwsR0FBZ0IsQ0FBakM7O0FBRUEsV0FBS25CLFFBQUwsQ0FBY29CLE9BQWQsQ0FBc0IsVUFBQ0MsTUFBRCxFQUFZO0FBQ2hDWCxhQUFLWSxTQUFMO0FBQ0FaLGFBQUthLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLE9BQUtDLE1BQXBCLEVBQTRCSCxPQUFPLENBQVAsQ0FBNUIsRUFBdUNBLE9BQU8sQ0FBUCxDQUF2QyxFQUFrRCxLQUFsRDtBQUNBWCxhQUFLZSxNQUFMO0FBQ0FmLGFBQUtnQixTQUFMO0FBQ0QsT0FMRDs7QUFPQWhCLFdBQUtpQixPQUFMO0FBQ0Q7OzsyQkFFTUMsRyxFQUFLO0FBQ1ZBLFVBQUlDLFNBQUosQ0FBYyxLQUFLQyxhQUFuQixFQUFrQyxDQUFsQyxFQUFxQyxDQUFyQyxFQUF3QyxLQUFLbkIsV0FBN0MsRUFBMEQsS0FBS0MsWUFBL0Q7QUFDRDs7Ozs7a0JBR1l0QixnQiIsImZpbGUiOiJNZWFzdXJlc1JlbmRlcmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VBcmNSZW5kZXJlciBmcm9tICcuL0Jhc2VBcmNSZW5kZXJlcic7XG5cbi8qKlxuICogRGlzcGxheSB0aGUgbWVhc3VyZXMgYXMgc2VnbWVudHMuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGRpc3BsYXlMZW5ndGggLSBOYnIgb2YgbWVhc3VyZXMgcmVwcmVzZW50ZWQgaW4gdGhlIHdob2xlIGNpcmNsZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cbmNsYXNzIE1lYXN1cmVzUmVuZGVyZXIgZXh0ZW5kcyBCYXNlQXJjUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcihkaXNwbGF5TGVuZ3RoLCBvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucy56b25lLCBkaXNwbGF5TGVuZ3RoKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgIG9wYWNpdHk6IDAuNSxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2NvbG9yID0gdGhpcy5vcHRpb25zLmNvbG9yO1xuICAgIHRoaXMuX29wYWNpdHkgPSB0aGlzLm9wdGlvbnMub3BhY2l0eTtcbiAgfVxuXG4gIHNldENvbG9yKHZhbHVlKSB7XG4gICAgdGhpcy5fY29sb3IgPSB2YWx1ZTtcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIHRoaXMuc2VnbWVudHMgPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5kaXNwbGF5TGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5nZXRBbmdsZUZyb21Qb3NpdGlvbihpKTtcbiAgICAgIGNvbnN0IHN0b3AgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKGkgKyAxLCB0cnVlKTtcbiAgICAgIHRoaXMuc2VnbWVudHMucHVzaChbc3RhcnQsIHN0b3BdKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIG9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKSB7XG4gICAgc3VwZXIub25SZXNpemUod2lkdGgsIGhlaWdodCwgb3JpZW50YXRpb24pO1xuICAgIC8vIGNhbiBiZSBjYWxsZWQgYmVmb3JlIGluaXRcbiAgICBpZiAodGhpcy5jYWNoZWRDdHgpXG4gICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgY29uc3QgX2N0eCA9IHRoaXMuY2FjaGVkQ3R4O1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5jYW52YXNXaWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcblxuICAgIF9jdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIF9jdHguc2F2ZSgpO1xuICAgIF9jdHgudHJhbnNsYXRlKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG5cbiAgICBfY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5fY29sb3I7XG4gICAgX2N0eC5nbG9iYWxBbHBoYSA9IHRoaXMuX29wYWNpdHk7XG4gICAgX2N0eC5saW5lV2lkdGggPSB0aGlzLmFyY1dpZHRoIC0gMjtcblxuICAgIHRoaXMuc2VnbWVudHMuZm9yRWFjaCgoYW5nbGVzKSA9PiB7XG4gICAgICBfY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgX2N0eC5hcmMoMCwgMCwgdGhpcy5yYWRpdXMsIGFuZ2xlc1swXSwgYW5nbGVzWzFdLCBmYWxzZSk7XG4gICAgICBfY3R4LnN0cm9rZSgpO1xuICAgICAgX2N0eC5jbG9zZVBhdGgoKTtcbiAgICB9KTtcblxuICAgIF9jdHgucmVzdG9yZSgpO1xuICB9XG5cbiAgcmVuZGVyKGN0eCkge1xuICAgIGN0eC5kcmF3SW1hZ2UodGhpcy4kY2FjaGVkQ2FudmFzLCAwLCAwLCB0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVhc3VyZXNSZW5kZXJlcjtcbiJdfQ==