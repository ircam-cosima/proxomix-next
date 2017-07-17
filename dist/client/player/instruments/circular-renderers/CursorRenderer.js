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

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

var _BaseArcRenderer2 = require('./BaseArcRenderer');

var _BaseArcRenderer3 = _interopRequireDefault(_BaseArcRenderer2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = _client.audio.audioContext;

/**
 * Circular cursor.
 *
 * @param {Number} displayLength - Nbr of measures represented in the whole circle.
 * @param {MetricScehduler} metricScheduler
 * @param {}
 */

var CursorRenderer = function (_BaseArcRenderer) {
  (0, _inherits3.default)(CursorRenderer, _BaseArcRenderer);

  function CursorRenderer(displayLength, options, metricScheduler) {
    (0, _classCallCheck3.default)(this, CursorRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (CursorRenderer.__proto__ || (0, _getPrototypeOf2.default)(CursorRenderer)).call(this, 0, displayLength));

    _this.options = (0, _assign2.default)({
      color: '#000000',
      opacity: 1,
      fadeOpacity: 0.02,
      numZones: 1
    }, options);

    _this.metricScheduler = metricScheduler;
    return _this;
  }

  (0, _createClass3.default)(CursorRenderer, [{
    key: 'render',
    value: function render(ctx) {
      var _ctx = this.cachedCtx;
      var _$canvas = this.$cachedCanvas;
      var width = this.canvasWidth;
      var height = this.canvasHeight;
      var radius = this.radius;
      var halfWidth = this.arcWidth / 2;
      var numZones = this.options.numZones;
      var currentTime = audioContext.currentTime;
      var currentPosition = this.metricScheduler.getMetricPositionAtAudioTime(currentTime);
      var angle = this.getAngleFromPosition(currentPosition);
      var padding = 0;

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
  }]);
  return CursorRenderer;
}(_BaseArcRenderer3.default);

exports.default = CursorRenderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkN1cnNvclJlbmRlcmVyLmpzIl0sIm5hbWVzIjpbImF1ZGlvQ29udGV4dCIsIkN1cnNvclJlbmRlcmVyIiwiZGlzcGxheUxlbmd0aCIsIm9wdGlvbnMiLCJtZXRyaWNTY2hlZHVsZXIiLCJjb2xvciIsIm9wYWNpdHkiLCJmYWRlT3BhY2l0eSIsIm51bVpvbmVzIiwiY3R4IiwiX2N0eCIsImNhY2hlZEN0eCIsIl8kY2FudmFzIiwiJGNhY2hlZENhbnZhcyIsIndpZHRoIiwiY2FudmFzV2lkdGgiLCJoZWlnaHQiLCJjYW52YXNIZWlnaHQiLCJyYWRpdXMiLCJoYWxmV2lkdGgiLCJhcmNXaWR0aCIsImN1cnJlbnRUaW1lIiwiY3VycmVudFBvc2l0aW9uIiwiZ2V0TWV0cmljUG9zaXRpb25BdEF1ZGlvVGltZSIsImFuZ2xlIiwiZ2V0QW5nbGVGcm9tUG9zaXRpb24iLCJwYWRkaW5nIiwiY2xlYXJSZWN0Iiwic2F2ZSIsInN0cm9rZVN0eWxlIiwiZ2xvYmFsQWxwaGEiLCJsaW5lV2lkdGgiLCJ0cmFuc2xhdGUiLCJyb3RhdGUiLCJiZWdpblBhdGgiLCJtb3ZlVG8iLCJsaW5lVG8iLCJzdHJva2UiLCJjbG9zZVBhdGgiLCJyZXN0b3JlIiwiZHJhd0ltYWdlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTUEsZUFBZSxjQUFNQSxZQUEzQjs7QUFFQTs7Ozs7Ozs7SUFPTUMsYzs7O0FBQ0osMEJBQVlDLGFBQVosRUFBMkJDLE9BQTNCLEVBQW9DQyxlQUFwQyxFQUFxRDtBQUFBOztBQUFBLHNKQUM3QyxDQUQ2QyxFQUMxQ0YsYUFEMEM7O0FBSW5ELFVBQUtDLE9BQUwsR0FBZSxzQkFBYztBQUMzQkUsYUFBTyxTQURvQjtBQUUzQkMsZUFBUyxDQUZrQjtBQUczQkMsbUJBQWEsSUFIYztBQUkzQkMsZ0JBQVU7QUFKaUIsS0FBZCxFQUtaTCxPQUxZLENBQWY7O0FBT0EsVUFBS0MsZUFBTCxHQUF1QkEsZUFBdkI7QUFYbUQ7QUFZcEQ7Ozs7MkJBRU1LLEcsRUFBSztBQUNWLFVBQU1DLE9BQU8sS0FBS0MsU0FBbEI7QUFDQSxVQUFNQyxXQUFXLEtBQUtDLGFBQXRCO0FBQ0EsVUFBTUMsUUFBUSxLQUFLQyxXQUFuQjtBQUNBLFVBQU1DLFNBQVMsS0FBS0MsWUFBcEI7QUFDQSxVQUFNQyxTQUFTLEtBQUtBLE1BQXBCO0FBQ0EsVUFBTUMsWUFBWSxLQUFLQyxRQUFMLEdBQWdCLENBQWxDO0FBQ0EsVUFBTVosV0FBVyxLQUFLTCxPQUFMLENBQWFLLFFBQTlCO0FBQ0EsVUFBTWEsY0FBY3JCLGFBQWFxQixXQUFqQztBQUNBLFVBQU1DLGtCQUFrQixLQUFLbEIsZUFBTCxDQUFxQm1CLDRCQUFyQixDQUFrREYsV0FBbEQsQ0FBeEI7QUFDQSxVQUFNRyxRQUFRLEtBQUtDLG9CQUFMLENBQTBCSCxlQUExQixDQUFkO0FBQ0EsVUFBTUksVUFBVSxDQUFoQjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUFoQixXQUFLaUIsU0FBTCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsRUFBcUJiLEtBQXJCLEVBQTRCRSxNQUE1QjtBQUNBO0FBQ0FOLFdBQUtrQixJQUFMO0FBQ0E7QUFDQWxCLFdBQUttQixXQUFMLEdBQW1CLFNBQW5CO0FBQ0FuQixXQUFLb0IsV0FBTCxHQUFtQixLQUFLM0IsT0FBTCxDQUFhRyxPQUFoQztBQUNBSSxXQUFLcUIsU0FBTCxHQUFpQixDQUFqQjs7QUFFQXJCLFdBQUtzQixTQUFMLENBQWVsQixRQUFRLENBQXZCLEVBQTBCRSxTQUFTLENBQW5DO0FBQ0FOLFdBQUt1QixNQUFMLENBQVlULEtBQVo7O0FBRUFkLFdBQUt3QixTQUFMO0FBQ0F4QixXQUFLeUIsTUFBTCxDQUFZakIsU0FBU1YsV0FBV1csU0FBcEIsR0FBZ0NPLE9BQTVDLEVBQXFELENBQXJEO0FBQ0FoQixXQUFLMEIsTUFBTCxDQUFZbEIsU0FBU0MsU0FBVCxHQUFxQk8sT0FBakMsRUFBMEMsQ0FBMUM7QUFDQWhCLFdBQUsyQixNQUFMO0FBQ0EzQixXQUFLNEIsU0FBTDs7QUFFQTVCLFdBQUs2QixPQUFMOztBQUVBOUIsVUFBSStCLFNBQUosQ0FBYzVCLFFBQWQsRUFBd0IsQ0FBeEIsRUFBMkIsQ0FBM0IsRUFBOEJFLEtBQTlCLEVBQXFDRSxNQUFyQztBQUNEOzs7OztrQkFHWWYsYyIsImZpbGUiOiJDdXJzb3JSZW5kZXJlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGF1ZGlvIH0gZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IEJhc2VBcmNSZW5kZXJlciBmcm9tICcuL0Jhc2VBcmNSZW5kZXJlcic7XG5cbmNvbnN0IGF1ZGlvQ29udGV4dCA9IGF1ZGlvLmF1ZGlvQ29udGV4dDtcblxuLyoqXG4gKiBDaXJjdWxhciBjdXJzb3IuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGRpc3BsYXlMZW5ndGggLSBOYnIgb2YgbWVhc3VyZXMgcmVwcmVzZW50ZWQgaW4gdGhlIHdob2xlIGNpcmNsZS5cbiAqIEBwYXJhbSB7TWV0cmljU2NlaGR1bGVyfSBtZXRyaWNTY2hlZHVsZXJcbiAqIEBwYXJhbSB7fVxuICovXG5jbGFzcyBDdXJzb3JSZW5kZXJlciBleHRlbmRzIEJhc2VBcmNSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKGRpc3BsYXlMZW5ndGgsIG9wdGlvbnMsIG1ldHJpY1NjaGVkdWxlcikge1xuICAgIHN1cGVyKDAsIGRpc3BsYXlMZW5ndGgpO1xuXG5cbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGNvbG9yOiAnIzAwMDAwMCcsXG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgZmFkZU9wYWNpdHk6IDAuMDIsXG4gICAgICBudW1ab25lczogMSxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyID0gbWV0cmljU2NoZWR1bGVyO1xuICB9XG5cbiAgcmVuZGVyKGN0eCkge1xuICAgIGNvbnN0IF9jdHggPSB0aGlzLmNhY2hlZEN0eDtcbiAgICBjb25zdCBfJGNhbnZhcyA9IHRoaXMuJGNhY2hlZENhbnZhcztcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMuY2FudmFzV2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5jYW52YXNIZWlnaHQ7XG4gICAgY29uc3QgcmFkaXVzID0gdGhpcy5yYWRpdXM7XG4gICAgY29uc3QgaGFsZldpZHRoID0gdGhpcy5hcmNXaWR0aCAvIDI7XG4gICAgY29uc3QgbnVtWm9uZXMgPSB0aGlzLm9wdGlvbnMubnVtWm9uZXM7XG4gICAgY29uc3QgY3VycmVudFRpbWUgPSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgY29uc3QgY3VycmVudFBvc2l0aW9uID0gdGhpcy5tZXRyaWNTY2hlZHVsZXIuZ2V0TWV0cmljUG9zaXRpb25BdEF1ZGlvVGltZShjdXJyZW50VGltZSk7XG4gICAgY29uc3QgYW5nbGUgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKGN1cnJlbnRQb3NpdGlvbik7XG4gICAgY29uc3QgcGFkZGluZyA9IDA7XG5cbiAgICAvLyBiYWNrZ3JvdW5kXG4gICAgLy8gX2N0eC5zYXZlKCk7XG5cbiAgICAvLyBfY3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1vdXQnO1xuICAgIC8vIF9jdHguZmlsbFN0eWxlID0gJyMwMDAwMDAnO1xuICAgIC8vIF9jdHguZ2xvYmFsQWxwaGEgPSB0aGlzLm9wdGlvbnMuZmFkZU9wYWNpdHk7XG4gICAgLy8gLy8gX2N0eC5nbG9iYWxBbHBoYSA9IDAuMTU7XG5cbiAgICAvLyBfY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIC8vIF9jdHgucmVzdG9yZSgpO1xuXG4gICAgX2N0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgLy8gY3Vyc29yXG4gICAgX2N0eC5zYXZlKCk7XG4gICAgLy8gX2N0eC5zdHJva2VTdHlsZSA9IHRoaXMub3B0aW9ucy5jb2xvcjtcbiAgICBfY3R4LnN0cm9rZVN0eWxlID0gJyNmZmZmZmYnO1xuICAgIF9jdHguZ2xvYmFsQWxwaGEgPSB0aGlzLm9wdGlvbnMub3BhY2l0eTtcbiAgICBfY3R4LmxpbmVXaWR0aCA9IDM7XG5cbiAgICBfY3R4LnRyYW5zbGF0ZSh3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xuICAgIF9jdHgucm90YXRlKGFuZ2xlKTtcblxuICAgIF9jdHguYmVnaW5QYXRoKCk7XG4gICAgX2N0eC5tb3ZlVG8ocmFkaXVzIC0gbnVtWm9uZXMgKiBoYWxmV2lkdGggKyBwYWRkaW5nLCAwKTtcbiAgICBfY3R4LmxpbmVUbyhyYWRpdXMgKyBoYWxmV2lkdGggKyBwYWRkaW5nLCAwKTtcbiAgICBfY3R4LnN0cm9rZSgpO1xuICAgIF9jdHguY2xvc2VQYXRoKCk7XG5cbiAgICBfY3R4LnJlc3RvcmUoKTtcblxuICAgIGN0eC5kcmF3SW1hZ2UoXyRjYW52YXMsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEN1cnNvclJlbmRlcmVyO1xuIl19