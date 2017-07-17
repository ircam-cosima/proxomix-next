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
 * @param {Object} options
 * @param {Array<Array<Number>>} pattern - Pattern to be displayed.
 * @param {Array<Number>} boundaries - Min and max values of the pattern.
 */

var PatternRenderer = function (_BaseArcRenderer) {
  (0, _inherits3.default)(PatternRenderer, _BaseArcRenderer);

  function PatternRenderer(displayLength, options) {
    (0, _classCallCheck3.default)(this, PatternRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PatternRenderer.__proto__ || (0, _getPrototypeOf2.default)(PatternRenderer)).call(this, options.zone, displayLength));

    _this.options = (0, _assign2.default)({
      opacity: 1,
      color: '#ffffff'
    }, options);

    _this.segments = [];
    return _this;
  }

  (0, _createClass3.default)(PatternRenderer, [{
    key: 'onResize',
    value: function onResize(width, height, orientation) {
      (0, _get3.default)(PatternRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(PatternRenderer.prototype), 'onResize', this).call(this, width, height, orientation);

      var score = this.options.score;
      var pattern = this.options.pattern;

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

      _ctx.strokeStyle = this.options.color;
      _ctx.globalAlpha = this.options.opacity;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhdHRlcm5SZW5kZXJlci5qcyJdLCJuYW1lcyI6WyJhYnMiLCJNYXRoIiwiUGF0dGVyblJlbmRlcmVyIiwiZGlzcGxheUxlbmd0aCIsIm9wdGlvbnMiLCJ6b25lIiwib3BhY2l0eSIsImNvbG9yIiwic2VnbWVudHMiLCJ3aWR0aCIsImhlaWdodCIsIm9yaWVudGF0aW9uIiwic2NvcmUiLCJwYXR0ZXJuIiwibWluIiwiSW5maW5pdHkiLCJtYXgiLCJpIiwibGVuZ3RoIiwiaiIsImsiLCJ2YWwiLCJub3RlV2lkdGgiLCJhcmNXaWR0aCIsImJhc2VSYWRpdXMiLCJyYWRpdXMiLCJzY29yZUxlbmd0aCIsIm1lYXN1cmUiLCJtZWFzdXJlUGF0dGVybiIsImJlYXRMZW5ndGgiLCJiZWF0Iiwibm90ZXMiLCJub3RlSW5kZXgiLCJwb3NpdGlvblN0YXJ0IiwicG9zaXRpb25TdG9wIiwiYW5nbGVTdGFydCIsImdldEFuZ2xlRnJvbVBvc2l0aW9uIiwiYW5nbGVTdG9wIiwicHVzaCIsImNhY2hlZEN0eCIsIl9yZW5kZXIiLCJfY3R4IiwiY2FudmFzV2lkdGgiLCJjYW52YXNIZWlnaHQiLCJjbGVhclJlY3QiLCJzYXZlIiwidHJhbnNsYXRlIiwic3Ryb2tlU3R5bGUiLCJnbG9iYWxBbHBoYSIsImxpbmVXaWR0aCIsImZvckVhY2giLCJzZWdtZW50IiwiYmVnaW5QYXRoIiwiYXJjIiwic3Ryb2tlIiwiY2xvc2VQYXRoIiwicmVzdG9yZSIsImN0eCIsImRyYXdJbWFnZSIsIiRjYWNoZWRDYW52YXMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7Ozs7O0FBRUEsSUFBTUEsTUFBTUMsS0FBS0QsR0FBakI7O0FBRUE7Ozs7Ozs7O0lBT01FLGU7OztBQUNKLDJCQUFZQyxhQUFaLEVBQTJCQyxPQUEzQixFQUFvQztBQUFBOztBQUFBLHdKQUM1QkEsUUFBUUMsSUFEb0IsRUFDZEYsYUFEYzs7QUFHbEMsVUFBS0MsT0FBTCxHQUFl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LFVBQU1oQyxTQUFTLEtBQUtpQyxZQUFwQjs7QUFFQUYsV0FBS0csU0FBTCxDQUFlLENBQWYsRUFBa0IsQ0FBbEIsRUFBcUJuQyxLQUFyQixFQUE0QkMsTUFBNUI7QUFDQStCLFdBQUtJLElBQUw7QUFDQUosV0FBS0ssU0FBTCxDQUFlckMsUUFBUSxDQUF2QixFQUEwQkMsU0FBUyxDQUFuQzs7QUFFQStCLFdBQUtNLFdBQUwsR0FBbUIsS0FBSzNDLE9BQUwsQ0FBYUcsS0FBaEM7QUFDQWtDLFdBQUtPLFdBQUwsR0FBbUIsS0FBSzVDLE9BQUwsQ0FBYUUsT0FBaEM7QUFDQW1DLFdBQUtRLFNBQUwsR0FBaUIsS0FBSzNCLFNBQXRCOztBQUVBLFdBQUtkLFFBQUwsQ0FBYzBDLE9BQWQsQ0FBc0IsVUFBQ0MsT0FBRCxFQUFhO0FBQUEsWUFDekJoQixVQUR5QixHQUNTZ0IsT0FEVCxDQUN6QmhCLFVBRHlCO0FBQUEsWUFDYkUsU0FEYSxHQUNTYyxPQURULENBQ2JkLFNBRGE7QUFBQSxZQUNGWixNQURFLEdBQ1MwQixPQURULENBQ0YxQixNQURFOzs7QUFHakNnQixhQUFLVyxTQUFMO0FBQ0FYLGFBQUtZLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlNUIsTUFBZixFQUF1QlUsVUFBdkIsRUFBbUNFLFNBQW5DLEVBQThDLEtBQTlDO0FBQ0FJLGFBQUthLE1BQUw7QUFDQWIsYUFBS2MsU0FBTDtBQUNELE9BUEQ7O0FBU0FkLFdBQUtlLE9BQUw7QUFDRDs7OzJCQUVNQyxHLEVBQUs7QUFDVkEsVUFBSUMsU0FBSixDQUFjLEtBQUtDLGFBQW5CLEVBQWtDLENBQWxDLEVBQXFDLENBQXJDLEVBQXdDLEtBQUtqQixXQUE3QyxFQUEwRCxLQUFLQyxZQUEvRDtBQUNEOzs7OztrQkFHWXpDLGUiLCJmaWxlIjoiUGF0dGVyblJlbmRlcmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VBcmNSZW5kZXJlciBmcm9tICcuL0Jhc2VBcmNSZW5kZXJlcic7XG5cbmNvbnN0IGFicyA9IE1hdGguYWJzO1xuXG4vKipcbiAqIFBpYW5vLXJvbGwgbGlrZSBjaXJjdWxhciByZW5kZXJlci5cbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXNwbGF5TGVuZ3RoIC0gTnVtYmVyIG9mIG1lYXN1cmVzIHJlcHJlc2VudGVkIGJ5IGEgZnVsbCBjaXJjbGUuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtBcnJheTxBcnJheTxOdW1iZXI+Pn0gcGF0dGVybiAtIFBhdHRlcm4gdG8gYmUgZGlzcGxheWVkLlxuICogQHBhcmFtIHtBcnJheTxOdW1iZXI+fSBib3VuZGFyaWVzIC0gTWluIGFuZCBtYXggdmFsdWVzIG9mIHRoZSBwYXR0ZXJuLlxuICovXG5jbGFzcyBQYXR0ZXJuUmVuZGVyZXIgZXh0ZW5kcyBCYXNlQXJjUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcihkaXNwbGF5TGVuZ3RoLCBvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucy56b25lLCBkaXNwbGF5TGVuZ3RoKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIGNvbG9yOiAnI2ZmZmZmZicsXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnNlZ21lbnRzID0gW107XG4gIH1cblxuICBvblJlc2l6ZSh3aWR0aCwgaGVpZ2h0LCBvcmllbnRhdGlvbikge1xuICAgIHN1cGVyLm9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKTtcblxuICAgIGNvbnN0IHNjb3JlID0gdGhpcy5vcHRpb25zLnNjb3JlO1xuICAgIGNvbnN0IHBhdHRlcm4gPSB0aGlzLm9wdGlvbnMucGF0dGVybjtcblxuICAgIGxldCBtaW4gPSArSW5maW5pdHk7XG4gICAgbGV0IG1heCA9IC1JbmZpbml0eTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2NvcmUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc2NvcmVbaV0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBzY29yZVtpXVtqXS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgIGNvbnN0IHZhbCA9IHNjb3JlW2ldW2pdW2tdO1xuICAgICAgICAgIGlmICh2YWwgPiBtYXgpIG1heCA9IHZhbDtcbiAgICAgICAgICBpZiAodmFsIDwgbWluKSBtaW4gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm5vdGVXaWR0aCA9IHRoaXMuYXJjV2lkdGggLyAoYWJzKG1heCAtIG1pbikgKyAxKTtcbiAgICB0aGlzLmJhc2VSYWRpdXMgPSAodGhpcy5yYWRpdXMgLSB0aGlzLmFyY1dpZHRoIC8gMikgKyB0aGlzLm5vdGVXaWR0aCAvIDI7XG5cbiAgICAvLyBpbml0IG9yIHJlY29tcHV0ZSBzZWdtZW50c1xuICAgIGNvbnN0IHNjb3JlTGVuZ3RoID0gc2NvcmUubGVuZ3RoOyAvLyBuYnIgb2YgbWVhc3VyZXNcbiAgICB0aGlzLnNlZ21lbnRzLmxlbmd0aCA9IDA7XG5cbiAgICBmb3IgKGxldCBtZWFzdXJlID0gMDsgbWVhc3VyZSA8IHRoaXMuZGlzcGxheUxlbmd0aDsgbWVhc3VyZSsrKSB7XG4gICAgICBjb25zdCBtZWFzdXJlUGF0dGVybiA9IHNjb3JlW21lYXN1cmUgJSBzY29yZUxlbmd0aF07XG4gICAgICBjb25zdCBiZWF0TGVuZ3RoID0gbWVhc3VyZVBhdHRlcm4ubGVuZ3RoOyAvLyBuYnIgb2YgYmVhdHMgcGVyIHNlY29uZHNcblxuICAgICAgZm9yIChsZXQgYmVhdCA9IDA7IGJlYXQgPCBtZWFzdXJlUGF0dGVybi5sZW5ndGg7IGJlYXQrKykge1xuICAgICAgICBjb25zdCBub3RlcyA9IG1lYXN1cmVQYXR0ZXJuW2JlYXRdO1xuXG4gICAgICAgIGZvciAobGV0IG5vdGVJbmRleCA9IDA7IG5vdGVJbmRleCA8IG5vdGVzLmxlbmd0aDsgbm90ZUluZGV4KyspIHtcbiAgICAgICAgICBjb25zdCBwb3NpdGlvblN0YXJ0ID0gbWVhc3VyZSArIGJlYXQgLyBiZWF0TGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IHBvc2l0aW9uU3RvcCA9IG1lYXN1cmUgKyAoYmVhdCArIDEpIC8gYmVhdExlbmd0aDtcbiAgICAgICAgICBjb25zdCBhbmdsZVN0YXJ0ID0gdGhpcy5nZXRBbmdsZUZyb21Qb3NpdGlvbihwb3NpdGlvblN0YXJ0KTtcbiAgICAgICAgICBjb25zdCBhbmdsZVN0b3AgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKHBvc2l0aW9uU3RvcCk7XG4gICAgICAgICAgY29uc3QgcmFkaXVzID0gdGhpcy5iYXNlUmFkaXVzICsgbm90ZXNbbm90ZUluZGV4XSAqIHRoaXMubm90ZVdpZHRoO1xuXG4gICAgICAgICAgdGhpcy5zZWdtZW50cy5wdXNoKHsgYW5nbGVTdGFydCwgYW5nbGVTdG9wLCByYWRpdXMgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5jYWNoZWRDdHgpXG4gICAgICB0aGlzLl9yZW5kZXIoKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICBjb25zdCBfY3R4ID0gdGhpcy5jYWNoZWRDdHg7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLmNhbnZhc1dpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xuXG4gICAgX2N0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgX2N0eC5zYXZlKCk7XG4gICAgX2N0eC50cmFuc2xhdGUod2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcblxuICAgIF9jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLm9wdGlvbnMuY29sb3I7XG4gICAgX2N0eC5nbG9iYWxBbHBoYSA9IHRoaXMub3B0aW9ucy5vcGFjaXR5O1xuICAgIF9jdHgubGluZVdpZHRoID0gdGhpcy5ub3RlV2lkdGg7XG5cbiAgICB0aGlzLnNlZ21lbnRzLmZvckVhY2goKHNlZ21lbnQpID0+IHtcbiAgICAgIGNvbnN0IHsgYW5nbGVTdGFydCwgYW5nbGVTdG9wLCByYWRpdXMgfSA9IHNlZ21lbnQ7XG5cbiAgICAgIF9jdHguYmVnaW5QYXRoKCk7XG4gICAgICBfY3R4LmFyYygwLCAwLCByYWRpdXMsIGFuZ2xlU3RhcnQsIGFuZ2xlU3RvcCwgZmFsc2UpO1xuICAgICAgX2N0eC5zdHJva2UoKTtcbiAgICAgIF9jdHguY2xvc2VQYXRoKCk7XG4gICAgfSk7XG5cbiAgICBfY3R4LnJlc3RvcmUoKTtcbiAgfVxuXG4gIHJlbmRlcihjdHgpIHtcbiAgICBjdHguZHJhd0ltYWdlKHRoaXMuJGNhY2hlZENhbnZhcywgMCwgMCwgdGhpcy5jYW52YXNXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBhdHRlcm5SZW5kZXJlcjtcbiJdfQ==