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

  function CursorRenderer(displayLength, config, metricScheduler) {
    (0, _classCallCheck3.default)(this, CursorRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (CursorRenderer.__proto__ || (0, _getPrototypeOf2.default)(CursorRenderer)).call(this, 0, displayLength));

    _this.config = (0, _assign2.default)({
      color: '#000000',
      opacity: 1,
      fadeOpacity: 0.02,
      numZones: 1
    }, config);

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
      var numZones = this.config.numZones;
      var currentTime = audioContext.currentTime;
      var currentPosition = this.metricScheduler.getMetricPositionAtAudioTime(currentTime);
      var angle = this.getAngleFromPosition(currentPosition);
      var padding = 0;

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
  }]);
  return CursorRenderer;
}(_BaseArcRenderer3.default);

exports.default = CursorRenderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkN1cnNvclJlbmRlcmVyLmpzIl0sIm5hbWVzIjpbImF1ZGlvQ29udGV4dCIsIkN1cnNvclJlbmRlcmVyIiwiZGlzcGxheUxlbmd0aCIsImNvbmZpZyIsIm1ldHJpY1NjaGVkdWxlciIsImNvbG9yIiwib3BhY2l0eSIsImZhZGVPcGFjaXR5IiwibnVtWm9uZXMiLCJjdHgiLCJfY3R4IiwiY2FjaGVkQ3R4IiwiXyRjYW52YXMiLCIkY2FjaGVkQ2FudmFzIiwid2lkdGgiLCJjYW52YXNXaWR0aCIsImhlaWdodCIsImNhbnZhc0hlaWdodCIsInJhZGl1cyIsImhhbGZXaWR0aCIsImFyY1dpZHRoIiwiY3VycmVudFRpbWUiLCJjdXJyZW50UG9zaXRpb24iLCJnZXRNZXRyaWNQb3NpdGlvbkF0QXVkaW9UaW1lIiwiYW5nbGUiLCJnZXRBbmdsZUZyb21Qb3NpdGlvbiIsInBhZGRpbmciLCJjbGVhclJlY3QiLCJzYXZlIiwic3Ryb2tlU3R5bGUiLCJnbG9iYWxBbHBoYSIsImxpbmVXaWR0aCIsInRyYW5zbGF0ZSIsInJvdGF0ZSIsImJlZ2luUGF0aCIsIm1vdmVUbyIsImxpbmVUbyIsInN0cm9rZSIsImNsb3NlUGF0aCIsInJlc3RvcmUiLCJkcmF3SW1hZ2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxlQUFlLGNBQU1BLFlBQTNCOztBQUVBOzs7Ozs7OztJQU9NQyxjOzs7QUFDSiwwQkFBWUMsYUFBWixFQUEyQkMsTUFBM0IsRUFBbUNDLGVBQW5DLEVBQW9EO0FBQUE7O0FBQUEsc0pBQzVDLENBRDRDLEVBQ3pDRixhQUR5Qzs7QUFJbEQsVUFBS0MsTUFBTCxHQUFjLHNCQUFjO0FBQzFCRSxhQUFPLFNBRG1CO0FBRTFCQyxlQUFTLENBRmlCO0FBRzFCQyxtQkFBYSxJQUhhO0FBSTFCQyxnQkFBVTtBQUpnQixLQUFkLEVBS1hMLE1BTFcsQ0FBZDs7QUFPQSxVQUFLQyxlQUFMLEdBQXVCQSxlQUF2QjtBQVhrRDtBQVluRDs7OzsyQkFFTUssRyxFQUFLO0FBQ1YsVUFBTUMsT0FBTyxLQUFLQyxTQUFsQjtBQUNBLFVBQU1DLFdBQVcsS0FBS0MsYUFBdEI7QUFDQSxVQUFNQyxRQUFRLEtBQUtDLFdBQW5CO0FBQ0EsVUFBTUMsU0FBUyxLQUFLQyxZQUFwQjtBQUNBLFVBQU1DLFNBQVMsS0FBS0EsTUFBcEI7QUFDQSxVQUFNQyxZQUFZLEtBQUtDLFFBQUwsR0FBZ0IsQ0FBbEM7QUFDQSxVQUFNWixXQUFXLEtBQUtMLE1BQUwsQ0FBWUssUUFBN0I7QUFDQSxVQUFNYSxjQUFjckIsYUFBYXFCLFdBQWpDO0FBQ0EsVUFBTUMsa0JBQWtCLEtBQUtsQixlQUFMLENBQXFCbUIsNEJBQXJCLENBQWtERixXQUFsRCxDQUF4QjtBQUNBLFVBQU1HLFFBQVEsS0FBS0Msb0JBQUwsQ0FBMEJILGVBQTFCLENBQWQ7QUFDQSxVQUFNSSxVQUFVLENBQWhCOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQWhCLFdBQUtpQixTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQmIsS0FBckIsRUFBNEJFLE1BQTVCO0FBQ0E7QUFDQU4sV0FBS2tCLElBQUw7QUFDQTtBQUNBbEIsV0FBS21CLFdBQUwsR0FBbUIsU0FBbkI7QUFDQW5CLFdBQUtvQixXQUFMLEdBQW1CLEtBQUszQixNQUFMLENBQVlHLE9BQS9CO0FBQ0FJLFdBQUtxQixTQUFMLEdBQWlCLENBQWpCOztBQUVBckIsV0FBS3NCLFNBQUwsQ0FBZWxCLFFBQVEsQ0FBdkIsRUFBMEJFLFNBQVMsQ0FBbkM7QUFDQU4sV0FBS3VCLE1BQUwsQ0FBWVQsS0FBWjs7QUFFQWQsV0FBS3dCLFNBQUw7QUFDQXhCLFdBQUt5QixNQUFMLENBQVlqQixTQUFTVixXQUFXVyxTQUFwQixHQUFnQ08sT0FBNUMsRUFBcUQsQ0FBckQ7QUFDQWhCLFdBQUswQixNQUFMLENBQVlsQixTQUFTQyxTQUFULEdBQXFCTyxPQUFqQyxFQUEwQyxDQUExQztBQUNBaEIsV0FBSzJCLE1BQUw7QUFDQTNCLFdBQUs0QixTQUFMOztBQUVBNUIsV0FBSzZCLE9BQUw7O0FBRUE5QixVQUFJK0IsU0FBSixDQUFjNUIsUUFBZCxFQUF3QixDQUF4QixFQUEyQixDQUEzQixFQUE4QkUsS0FBOUIsRUFBcUNFLE1BQXJDO0FBQ0Q7Ozs7O2tCQUdZZixjIiwiZmlsZSI6IkN1cnNvclJlbmRlcmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXVkaW8gfSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgQmFzZUFyY1JlbmRlcmVyIGZyb20gJy4vQmFzZUFyY1JlbmRlcmVyJztcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gYXVkaW8uYXVkaW9Db250ZXh0O1xuXG4vKipcbiAqIENpcmN1bGFyIGN1cnNvci5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gZGlzcGxheUxlbmd0aCAtIE5iciBvZiBtZWFzdXJlcyByZXByZXNlbnRlZCBpbiB0aGUgd2hvbGUgY2lyY2xlLlxuICogQHBhcmFtIHtNZXRyaWNTY2VoZHVsZXJ9IG1ldHJpY1NjaGVkdWxlclxuICogQHBhcmFtIHt9XG4gKi9cbmNsYXNzIEN1cnNvclJlbmRlcmVyIGV4dGVuZHMgQmFzZUFyY1JlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoZGlzcGxheUxlbmd0aCwgY29uZmlnLCBtZXRyaWNTY2hlZHVsZXIpIHtcbiAgICBzdXBlcigwLCBkaXNwbGF5TGVuZ3RoKTtcblxuXG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGNvbG9yOiAnIzAwMDAwMCcsXG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgZmFkZU9wYWNpdHk6IDAuMDIsXG4gICAgICBudW1ab25lczogMSxcbiAgICB9LCBjb25maWcpO1xuXG4gICAgdGhpcy5tZXRyaWNTY2hlZHVsZXIgPSBtZXRyaWNTY2hlZHVsZXI7XG4gIH1cblxuICByZW5kZXIoY3R4KSB7XG4gICAgY29uc3QgX2N0eCA9IHRoaXMuY2FjaGVkQ3R4O1xuICAgIGNvbnN0IF8kY2FudmFzID0gdGhpcy4kY2FjaGVkQ2FudmFzO1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5jYW52YXNXaWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcbiAgICBjb25zdCByYWRpdXMgPSB0aGlzLnJhZGl1cztcbiAgICBjb25zdCBoYWxmV2lkdGggPSB0aGlzLmFyY1dpZHRoIC8gMjtcbiAgICBjb25zdCBudW1ab25lcyA9IHRoaXMuY29uZmlnLm51bVpvbmVzO1xuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IGN1cnJlbnRQb3NpdGlvbiA9IHRoaXMubWV0cmljU2NoZWR1bGVyLmdldE1ldHJpY1Bvc2l0aW9uQXRBdWRpb1RpbWUoY3VycmVudFRpbWUpO1xuICAgIGNvbnN0IGFuZ2xlID0gdGhpcy5nZXRBbmdsZUZyb21Qb3NpdGlvbihjdXJyZW50UG9zaXRpb24pO1xuICAgIGNvbnN0IHBhZGRpbmcgPSAwO1xuXG4gICAgLy8gYmFja2dyb3VuZFxuICAgIC8vIF9jdHguc2F2ZSgpO1xuXG4gICAgLy8gX2N0eC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tb3V0JztcbiAgICAvLyBfY3R4LmZpbGxTdHlsZSA9ICcjMDAwMDAwJztcbiAgICAvLyBfY3R4Lmdsb2JhbEFscGhhID0gdGhpcy5jb25maWcuZmFkZU9wYWNpdHk7XG4gICAgLy8gLy8gX2N0eC5nbG9iYWxBbHBoYSA9IDAuMTU7XG5cbiAgICAvLyBfY3R4LmZpbGxSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIC8vIF9jdHgucmVzdG9yZSgpO1xuXG4gICAgX2N0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgLy8gY3Vyc29yXG4gICAgX2N0eC5zYXZlKCk7XG4gICAgLy8gX2N0eC5zdHJva2VTdHlsZSA9IHRoaXMuY29uZmlnLmNvbG9yO1xuICAgIF9jdHguc3Ryb2tlU3R5bGUgPSAnI2ZmZmZmZic7XG4gICAgX2N0eC5nbG9iYWxBbHBoYSA9IHRoaXMuY29uZmlnLm9wYWNpdHk7XG4gICAgX2N0eC5saW5lV2lkdGggPSAzO1xuXG4gICAgX2N0eC50cmFuc2xhdGUod2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcbiAgICBfY3R4LnJvdGF0ZShhbmdsZSk7XG5cbiAgICBfY3R4LmJlZ2luUGF0aCgpO1xuICAgIF9jdHgubW92ZVRvKHJhZGl1cyAtIG51bVpvbmVzICogaGFsZldpZHRoICsgcGFkZGluZywgMCk7XG4gICAgX2N0eC5saW5lVG8ocmFkaXVzICsgaGFsZldpZHRoICsgcGFkZGluZywgMCk7XG4gICAgX2N0eC5zdHJva2UoKTtcbiAgICBfY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgX2N0eC5yZXN0b3JlKCk7XG5cbiAgICBjdHguZHJhd0ltYWdlKF8kY2FudmFzLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBDdXJzb3JSZW5kZXJlcjtcbiJdfQ==