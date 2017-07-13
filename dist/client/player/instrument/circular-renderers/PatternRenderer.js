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

var abs = Math.abs;

/**
 * Piano-roll like circular renderer.
 * @param {Number} displayLength - Number of measures represented by a full circle.
 * @param {Object} config
 * @param {Array<Array<Number>>} pattern - Pattern to be displayed.
 * @param {Array<Number>} boundaries - Min and max values of the pattern.
 */

var PatternRenderer = function (_BaseArcRenderer) {
  (0, _inherits3.default)(PatternRenderer, _BaseArcRenderer);

  function PatternRenderer(displayLength, config) {
    (0, _classCallCheck3.default)(this, PatternRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PatternRenderer.__proto__ || (0, _getPrototypeOf2.default)(PatternRenderer)).call(this, config.zone, displayLength));

    _this.config = (0, _assign2.default)({
      opacity: 1,
      color: '#ffffff'
    }, config);

    _this.segments = [];
    return _this;
  }

  (0, _createClass3.default)(PatternRenderer, [{
    key: 'onResize',
    value: function onResize(width, height, orientation) {
      (0, _get3.default)(PatternRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(PatternRenderer.prototype), 'onResize', this).call(this, width, height, orientation);

      var score = this.config.score;
      var pattern = this.config.pattern;

      var min = +Infinity;
      var max = -Infinity;

      for (var i = 0; i < score.length; i++) {
        for (var j = 0; j < score[i].length; j++) {
          for (var k = 0; k < score[i][j].length; k++) {
            var val = score[i][j][k];
            if (val > max) max = val;
            if (val < min) min = val;
          }
        }
      }

      this.noteWidth = this.arcWidth / (abs(max - min) + 1);
      this.baseRadius = this.radius - this.arcWidth / 2 + this.noteWidth / 2;

      // init or recompute segments
      var scoreLength = score.length; // nbr of measures
      this.segments.length = 0;

      for (var measure = 0; measure < this.displayLength; measure++) {
        var measurePattern = score[measure % scoreLength];
        var beatLength = measurePattern.length; // nbr of beats per seconds

        for (var beat = 0; beat < measurePattern.length; beat++) {
          var notes = measurePattern[beat];

          for (var noteIndex = 0; noteIndex < notes.length; noteIndex++) {
            var positionStart = measure + beat / beatLength;
            var positionStop = measure + (beat + 1) / beatLength;
            var angleStart = this.getAngleFromPosition(positionStart);
            var angleStop = this.getAngleFromPosition(positionStop);
            var radius = this.baseRadius + notes[noteIndex] * this.noteWidth;

            this.segments.push({ angleStart: angleStart, angleStop: angleStop, radius: radius });
          }
        }
      }

      if (this.cachedCtx) this._render();
    }
  }, {
    key: 'init',
    value: function init() {
      (0, _get3.default)(PatternRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(PatternRenderer.prototype), 'init', this).call(this);
      this._render();
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

      _ctx.strokeStyle = this.config.color;
      _ctx.globalAlpha = this.config.opacity;
      _ctx.lineWidth = this.noteWidth;

      this.segments.forEach(function (segment) {
        var angleStart = segment.angleStart,
            angleStop = segment.angleStop,
            radius = segment.radius;


        _ctx.beginPath();
        _ctx.arc(0, 0, radius, angleStart, angleStop, false);
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
  return PatternRenderer;
}(_BaseArcRenderer3.default);

exports.default = PatternRenderer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhdHRlcm5SZW5kZXJlci5qcyJdLCJuYW1lcyI6WyJhYnMiLCJNYXRoIiwiUGF0dGVyblJlbmRlcmVyIiwiZGlzcGxheUxlbmd0aCIsImNvbmZpZyIsInpvbmUiLCJvcGFjaXR5IiwiY29sb3IiLCJzZWdtZW50cyIsIndpZHRoIiwiaGVpZ2h0Iiwib3JpZW50YXRpb24iLCJzY29yZSIsInBhdHRlcm4iLCJtaW4iLCJJbmZpbml0eSIsIm1heCIsImkiLCJsZW5ndGgiLCJqIiwiayIsInZhbCIsIm5vdGVXaWR0aCIsImFyY1dpZHRoIiwiYmFzZVJhZGl1cyIsInJhZGl1cyIsInNjb3JlTGVuZ3RoIiwibWVhc3VyZSIsIm1lYXN1cmVQYXR0ZXJuIiwiYmVhdExlbmd0aCIsImJlYXQiLCJub3RlcyIsIm5vdGVJbmRleCIsInBvc2l0aW9uU3RhcnQiLCJwb3NpdGlvblN0b3AiLCJhbmdsZVN0YXJ0IiwiZ2V0QW5nbGVGcm9tUG9zaXRpb24iLCJhbmdsZVN0b3AiLCJwdXNoIiwiY2FjaGVkQ3R4IiwiX3JlbmRlciIsIl9jdHgiLCJjYW52YXNXaWR0aCIsImNhbnZhc0hlaWdodCIsImNsZWFyUmVjdCIsInNhdmUiLCJ0cmFuc2xhdGUiLCJzdHJva2VTdHlsZSIsImdsb2JhbEFscGhhIiwibGluZVdpZHRoIiwiZm9yRWFjaCIsInNlZ21lbnQiLCJiZWdpblBhdGgiLCJhcmMiLCJzdHJva2UiLCJjbG9zZVBhdGgiLCJyZXN0b3JlIiwiY3R4IiwiZHJhd0ltYWdlIiwiJGNhY2hlZENhbnZhcyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7Ozs7QUFFQSxJQUFNQSxNQUFNQyxLQUFLRCxHQUFqQjs7QUFFQTs7Ozs7Ozs7SUFPTUUsZTs7O0FBQ0osMkJBQVlDLGFBQVosRUFBMkJDLE1BQTNCLEVBQW1DO0FBQUE7O0FBQUEsd0pBQzNCQSxPQUFPQyxJQURvQixFQUNkRixhQURjOztBQUdqQyxVQUFLQyxNQUFMLEdBQWMs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VUFBTWhDLFNBQVMsS0FBS2lDLFlBQXBCOztBQUVBRixXQUFLRyxTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQm5DLEtBQXJCLEVBQTRCQyxNQUE1QjtBQUNBK0IsV0FBS0ksSUFBTDtBQUNBSixXQUFLSyxTQUFMLENBQWVyQyxRQUFRLENBQXZCLEVBQTBCQyxTQUFTLENBQW5DOztBQUVBK0IsV0FBS00sV0FBTCxHQUFtQixLQUFLM0MsTUFBTCxDQUFZRyxLQUEvQjtBQUNBa0MsV0FBS08sV0FBTCxHQUFtQixLQUFLNUMsTUFBTCxDQUFZRSxPQUEvQjtBQUNBbUMsV0FBS1EsU0FBTCxHQUFpQixLQUFLM0IsU0FBdEI7O0FBRUEsV0FBS2QsUUFBTCxDQUFjMEMsT0FBZCxDQUFzQixVQUFDQyxPQUFELEVBQWE7QUFBQSxZQUN6QmhCLFVBRHlCLEdBQ1NnQixPQURULENBQ3pCaEIsVUFEeUI7QUFBQSxZQUNiRSxTQURhLEdBQ1NjLE9BRFQsQ0FDYmQsU0FEYTtBQUFBLFlBQ0ZaLE1BREUsR0FDUzBCLE9BRFQsQ0FDRjFCLE1BREU7OztBQUdqQ2dCLGFBQUtXLFNBQUw7QUFDQVgsYUFBS1ksR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWU1QixNQUFmLEVBQXVCVSxVQUF2QixFQUFtQ0UsU0FBbkMsRUFBOEMsS0FBOUM7QUFDQUksYUFBS2EsTUFBTDtBQUNBYixhQUFLYyxTQUFMO0FBQ0QsT0FQRDs7QUFTQWQsV0FBS2UsT0FBTDtBQUNEOzs7MkJBRU1DLEcsRUFBSztBQUNWQSxVQUFJQyxTQUFKLENBQWMsS0FBS0MsYUFBbkIsRUFBa0MsQ0FBbEMsRUFBcUMsQ0FBckMsRUFBd0MsS0FBS2pCLFdBQTdDLEVBQTBELEtBQUtDLFlBQS9EO0FBQ0Q7Ozs7O2tCQUdZekMsZSIsImZpbGUiOiJQYXR0ZXJuUmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUFyY1JlbmRlcmVyIGZyb20gJy4vQmFzZUFyY1JlbmRlcmVyJztcblxuY29uc3QgYWJzID0gTWF0aC5hYnM7XG5cbi8qKlxuICogUGlhbm8tcm9sbCBsaWtlIGNpcmN1bGFyIHJlbmRlcmVyLlxuICogQHBhcmFtIHtOdW1iZXJ9IGRpc3BsYXlMZW5ndGggLSBOdW1iZXIgb2YgbWVhc3VyZXMgcmVwcmVzZW50ZWQgYnkgYSBmdWxsIGNpcmNsZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWdcbiAqIEBwYXJhbSB7QXJyYXk8QXJyYXk8TnVtYmVyPj59IHBhdHRlcm4gLSBQYXR0ZXJuIHRvIGJlIGRpc3BsYXllZC5cbiAqIEBwYXJhbSB7QXJyYXk8TnVtYmVyPn0gYm91bmRhcmllcyAtIE1pbiBhbmQgbWF4IHZhbHVlcyBvZiB0aGUgcGF0dGVybi5cbiAqL1xuY2xhc3MgUGF0dGVyblJlbmRlcmVyIGV4dGVuZHMgQmFzZUFyY1JlbmRlcmVyIHtcbiAgY29uc3RydWN0b3IoZGlzcGxheUxlbmd0aCwgY29uZmlnKSB7XG4gICAgc3VwZXIoY29uZmlnLnpvbmUsIGRpc3BsYXlMZW5ndGgpO1xuXG4gICAgdGhpcy5jb25maWcgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIG9wYWNpdHk6IDEsXG4gICAgICBjb2xvcjogJyNmZmZmZmYnLFxuICAgIH0sIGNvbmZpZyk7XG5cbiAgICB0aGlzLnNlZ21lbnRzID0gW107XG4gIH1cblxuICBvblJlc2l6ZSh3aWR0aCwgaGVpZ2h0LCBvcmllbnRhdGlvbikge1xuICAgIHN1cGVyLm9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKTtcblxuICAgIGNvbnN0IHNjb3JlID0gdGhpcy5jb25maWcuc2NvcmU7XG4gICAgY29uc3QgcGF0dGVybiA9IHRoaXMuY29uZmlnLnBhdHRlcm47XG5cbiAgICBsZXQgbWluID0gK0luZmluaXR5O1xuICAgIGxldCBtYXggPSAtSW5maW5pdHk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNjb3JlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHNjb3JlW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgc2NvcmVbaV1bal0ubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICBjb25zdCB2YWwgPSBzY29yZVtpXVtqXVtrXTtcbiAgICAgICAgICBpZiAodmFsID4gbWF4KSBtYXggPSB2YWw7XG4gICAgICAgICAgaWYgKHZhbCA8IG1pbikgbWluID0gdmFsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ub3RlV2lkdGggPSB0aGlzLmFyY1dpZHRoIC8gKGFicyhtYXggLSBtaW4pICsgMSk7XG4gICAgdGhpcy5iYXNlUmFkaXVzID0gKHRoaXMucmFkaXVzIC0gdGhpcy5hcmNXaWR0aCAvIDIpICsgdGhpcy5ub3RlV2lkdGggLyAyO1xuXG4gICAgLy8gaW5pdCBvciByZWNvbXB1dGUgc2VnbWVudHNcbiAgICBjb25zdCBzY29yZUxlbmd0aCA9IHNjb3JlLmxlbmd0aDsgLy8gbmJyIG9mIG1lYXN1cmVzXG4gICAgdGhpcy5zZWdtZW50cy5sZW5ndGggPSAwO1xuXG4gICAgZm9yIChsZXQgbWVhc3VyZSA9IDA7IG1lYXN1cmUgPCB0aGlzLmRpc3BsYXlMZW5ndGg7IG1lYXN1cmUrKykge1xuICAgICAgY29uc3QgbWVhc3VyZVBhdHRlcm4gPSBzY29yZVttZWFzdXJlICUgc2NvcmVMZW5ndGhdO1xuICAgICAgY29uc3QgYmVhdExlbmd0aCA9IG1lYXN1cmVQYXR0ZXJuLmxlbmd0aDsgLy8gbmJyIG9mIGJlYXRzIHBlciBzZWNvbmRzXG5cbiAgICAgIGZvciAobGV0IGJlYXQgPSAwOyBiZWF0IDwgbWVhc3VyZVBhdHRlcm4ubGVuZ3RoOyBiZWF0KyspIHtcbiAgICAgICAgY29uc3Qgbm90ZXMgPSBtZWFzdXJlUGF0dGVybltiZWF0XTtcblxuICAgICAgICBmb3IgKGxldCBub3RlSW5kZXggPSAwOyBub3RlSW5kZXggPCBub3Rlcy5sZW5ndGg7IG5vdGVJbmRleCsrKSB7XG4gICAgICAgICAgY29uc3QgcG9zaXRpb25TdGFydCA9IG1lYXN1cmUgKyBiZWF0IC8gYmVhdExlbmd0aDtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvblN0b3AgPSBtZWFzdXJlICsgKGJlYXQgKyAxKSAvIGJlYXRMZW5ndGg7XG4gICAgICAgICAgY29uc3QgYW5nbGVTdGFydCA9IHRoaXMuZ2V0QW5nbGVGcm9tUG9zaXRpb24ocG9zaXRpb25TdGFydCk7XG4gICAgICAgICAgY29uc3QgYW5nbGVTdG9wID0gdGhpcy5nZXRBbmdsZUZyb21Qb3NpdGlvbihwb3NpdGlvblN0b3ApO1xuICAgICAgICAgIGNvbnN0IHJhZGl1cyA9IHRoaXMuYmFzZVJhZGl1cyArIG5vdGVzW25vdGVJbmRleF0gKiB0aGlzLm5vdGVXaWR0aDtcblxuICAgICAgICAgIHRoaXMuc2VnbWVudHMucHVzaCh7IGFuZ2xlU3RhcnQsIGFuZ2xlU3RvcCwgcmFkaXVzIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuY2FjaGVkQ3R4KVxuICAgICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHN1cGVyLmluaXQoKTtcbiAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIF9yZW5kZXIoKSB7XG4gICAgY29uc3QgX2N0eCA9IHRoaXMuY2FjaGVkQ3R4O1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5jYW52YXNXaWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmNhbnZhc0hlaWdodDtcblxuICAgIF9jdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIF9jdHguc2F2ZSgpO1xuICAgIF9jdHgudHJhbnNsYXRlKHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XG5cbiAgICBfY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5jb25maWcuY29sb3I7XG4gICAgX2N0eC5nbG9iYWxBbHBoYSA9IHRoaXMuY29uZmlnLm9wYWNpdHk7XG4gICAgX2N0eC5saW5lV2lkdGggPSB0aGlzLm5vdGVXaWR0aDtcblxuICAgIHRoaXMuc2VnbWVudHMuZm9yRWFjaCgoc2VnbWVudCkgPT4ge1xuICAgICAgY29uc3QgeyBhbmdsZVN0YXJ0LCBhbmdsZVN0b3AsIHJhZGl1cyB9ID0gc2VnbWVudDtcblxuICAgICAgX2N0eC5iZWdpblBhdGgoKTtcbiAgICAgIF9jdHguYXJjKDAsIDAsIHJhZGl1cywgYW5nbGVTdGFydCwgYW5nbGVTdG9wLCBmYWxzZSk7XG4gICAgICBfY3R4LnN0cm9rZSgpO1xuICAgICAgX2N0eC5jbG9zZVBhdGgoKTtcbiAgICB9KTtcblxuICAgIF9jdHgucmVzdG9yZSgpO1xuICB9XG5cbiAgcmVuZGVyKGN0eCkge1xuICAgIGN0eC5kcmF3SW1hZ2UodGhpcy4kY2FjaGVkQ2FudmFzLCAwLCAwLCB0aGlzLmNhbnZhc1dpZHRoLCB0aGlzLmNhbnZhc0hlaWdodCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGF0dGVyblJlbmRlcmVyO1xuIl19