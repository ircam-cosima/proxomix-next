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
 * @param {Object} config
 */

var SegmentRenderer = function (_BaseArcRenderer) {
  (0, _inherits3.default)(SegmentRenderer, _BaseArcRenderer);

  function SegmentRenderer(displayLength, config) {
    (0, _classCallCheck3.default)(this, SegmentRenderer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (SegmentRenderer.__proto__ || (0, _getPrototypeOf2.default)(SegmentRenderer)).call(this, config.zone, displayLength));

    _this.config = (0, _assign2.default)({
      color: '#565656',
      opacity: 0.5,
      start: 0,
      length: displayLength
    }, config);

    console.log(_this.config);
    return _this;
  }

  (0, _createClass3.default)(SegmentRenderer, [{
    key: 'init',
    value: function init() {
      (0, _get3.default)(SegmentRenderer.prototype.__proto__ || (0, _getPrototypeOf2.default)(SegmentRenderer.prototype), 'init', this).call(this);
      var config = this.config;

      this.color = config.color;
      this.startAngle = this.getAngleFromPosition(config.start);

      if (config.length === Infinity) this.stopAngle = this.startAngle + _2PI;else if (config.length === this.displayLength) this.stopAngle = this.getAngleFromPosition(config.start, true);else this.stopAngle = this.getAngleFromPosition(config.start + config.length);

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
      _ctx.globalAlpha = this.config.opacity;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlNlZ21lbnRSZW5kZXJlci5qcyJdLCJuYW1lcyI6WyJfMlBJIiwiTWF0aCIsIlBJIiwiU2VnbWVudFJlbmRlcmVyIiwiZGlzcGxheUxlbmd0aCIsImNvbmZpZyIsInpvbmUiLCJjb2xvciIsIm9wYWNpdHkiLCJzdGFydCIsImxlbmd0aCIsImNvbnNvbGUiLCJsb2ciLCJzdGFydEFuZ2xlIiwiZ2V0QW5nbGVGcm9tUG9zaXRpb24iLCJJbmZpbml0eSIsInN0b3BBbmdsZSIsIl9yZW5kZXIiLCJ3aWR0aCIsImhlaWdodCIsIm9yaWVudGF0aW9uIiwiY2FjaGVkQ3R4IiwiX2N0eCIsImNhbnZhc1dpZHRoIiwiY2FudmFzSGVpZ2h0IiwiY2xlYXJSZWN0Iiwic2F2ZSIsInRyYW5zbGF0ZSIsInN0cm9rZVN0eWxlIiwiZ2xvYmFsQWxwaGEiLCJsaW5lV2lkdGgiLCJhcmNXaWR0aCIsImJlZ2luUGF0aCIsImFyYyIsInJhZGl1cyIsInN0cm9rZSIsImNsb3NlUGF0aCIsInJlc3RvcmUiLCJjdHgiLCJkcmF3SW1hZ2UiLCIkY2FjaGVkQ2FudmFzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7Ozs7OztBQUVBLElBQU1BLE9BQU8sSUFBSUMsS0FBS0MsRUFBdEI7O0FBRUE7Ozs7O0lBSU1DLGU7OztBQUNKLDJCQUFZQyxhQUFaLEVBQTJCQyxNQUEzQixFQUFtQztBQUFBOztBQUFBLHdKQUMzQkEsT0FBT0MsSUFEb0IsRUFDZEYsYUFEYzs7QUFHakMsVUFBS0MsTUFBTCxHQUFjLHNCQUFjO0FBQzFCRSxhQUFPLFNBRG1CO0FBRTFCQyxlQUFTLEdBRmlCO0FBRzFCQyxhQUFPLENBSG1CO0FBSTFCQyxjQUFRTjtBQUprQixLQUFkLEVBS1hDLE1BTFcsQ0FBZDs7QUFPQU0sWUFBUUMsR0FBUixDQUFZLE1BQUtQLE1BQWpCO0FBVmlDO0FBV2xDOzs7OzJCQUVNO0FBQ0w7QUFDQSxVQUFNQSxTQUFTLEtBQUtBLE1BQXBCOztBQUVBLFdBQUtFLEtBQUwsR0FBYUYsT0FBT0UsS0FBcEI7QUFDQSxXQUFLTSxVQUFMLEdBQWtCLEtBQUtDLG9CQUFMLENBQTBCVCxPQUFPSSxLQUFqQyxDQUFsQjs7QUFFQSxVQUFJSixPQUFPSyxNQUFQLEtBQWtCSyxRQUF0QixFQUNFLEtBQUtDLFNBQUwsR0FBaUIsS0FBS0gsVUFBTCxHQUFrQmIsSUFBbkMsQ0FERixLQUVLLElBQUlLLE9BQU9LLE1BQVAsS0FBa0IsS0FBS04sYUFBM0IsRUFDSCxLQUFLWSxTQUFMLEdBQWlCLEtBQUtGLG9CQUFMLENBQTBCVCxPQUFPSSxLQUFqQyxFQUF3QyxJQUF4QyxDQUFqQixDQURHLEtBR0gsS0FBS08sU0FBTCxHQUFpQixLQUFLRixvQkFBTCxDQUEwQlQsT0FBT0ksS0FBUCxHQUFlSixPQUFPSyxNQUFoRCxDQUFqQjs7QUFFRixXQUFLTyxPQUFMO0FBQ0Q7Ozs2QkFFUUMsSyxFQUFPQyxNLEVBQVFDLFcsRUFBYTtBQUNuQyx1SkFBZUYsS0FBZixFQUFzQkMsTUFBdEIsRUFBOEJDLFdBQTlCOztBQUVBLFVBQUksS0FBS0MsU0FBVCxFQUNFLEtBQUtKLE9BQUw7QUFDSDs7OzhCQUVTO0FBQ1IsVUFBTUssT0FBTyxLQUFLRCxTQUFsQjtBQUNBLFVBQU1ILFFBQVEsS0FBS0ssV0FBbkI7QUFDQSxVQUFNSixTQUFTLEtBQUtLLFlBQXBCOztBQUVBRixXQUFLRyxTQUFMLENBQWUsQ0FBZixFQUFrQixDQUFsQixFQUFxQlAsS0FBckIsRUFBNEJDLE1BQTVCO0FBQ0FHLFdBQUtJLElBQUw7QUFDQUosV0FBS0ssU0FBTCxDQUFlVCxRQUFRLENBQXZCLEVBQTBCQyxTQUFTLENBQW5DOztBQUVBRyxXQUFLTSxXQUFMLEdBQW1CLEtBQUtyQixLQUF4QjtBQUNBZSxXQUFLTyxXQUFMLEdBQW1CLEtBQUt4QixNQUFMLENBQVlHLE9BQS9CO0FBQ0FjLFdBQUtRLFNBQUwsR0FBaUIsS0FBS0MsUUFBdEI7O0FBRUFULFdBQUtVLFNBQUw7QUFDQVYsV0FBS1csR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsS0FBS0MsTUFBcEIsRUFBNEIsS0FBS3JCLFVBQWpDLEVBQTZDLEtBQUtHLFNBQWxELEVBQTZELEtBQTdEO0FBQ0FNLFdBQUthLE1BQUw7QUFDQWIsV0FBS2MsU0FBTDs7QUFFQWQsV0FBS2UsT0FBTDtBQUNEOzs7MkJBRU1DLEcsRUFBSztBQUNWQSxVQUFJQyxTQUFKLENBQWMsS0FBS0MsYUFBbkIsRUFBa0MsQ0FBbEMsRUFBcUMsQ0FBckMsRUFBd0MsS0FBS2pCLFdBQTdDLEVBQTBELEtBQUtDLFlBQS9EO0FBQ0Q7Ozs7O2tCQUdZckIsZSIsImZpbGUiOiJTZWdtZW50UmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUFyY1JlbmRlcmVyIGZyb20gJy4vQmFzZUFyY1JlbmRlcmVyJztcblxuY29uc3QgXzJQSSA9IDIgKiBNYXRoLlBJO1xuXG4vKipcbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXNwbGF5TGVuZ3RoIC0gTmJyIG9mIG1lYXN1cmVzIHJlcHJlc2VudGVkIGluIHRoZSB3aG9sZSBjaXJjbGUuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnXG4gKi9cbmNsYXNzIFNlZ21lbnRSZW5kZXJlciBleHRlbmRzIEJhc2VBcmNSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKGRpc3BsYXlMZW5ndGgsIGNvbmZpZykge1xuICAgIHN1cGVyKGNvbmZpZy56b25lLCBkaXNwbGF5TGVuZ3RoKTtcblxuICAgIHRoaXMuY29uZmlnID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBjb2xvcjogJyM1NjU2NTYnLFxuICAgICAgb3BhY2l0eTogMC41LFxuICAgICAgc3RhcnQ6IDAsXG4gICAgICBsZW5ndGg6IGRpc3BsYXlMZW5ndGgsXG4gICAgfSwgY29uZmlnKTtcblxuICAgIGNvbnNvbGUubG9nKHRoaXMuY29uZmlnKTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgc3VwZXIuaW5pdCgpO1xuICAgIGNvbnN0IGNvbmZpZyA9IHRoaXMuY29uZmlnO1xuXG4gICAgdGhpcy5jb2xvciA9IGNvbmZpZy5jb2xvcjtcbiAgICB0aGlzLnN0YXJ0QW5nbGUgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKGNvbmZpZy5zdGFydCk7XG5cbiAgICBpZiAoY29uZmlnLmxlbmd0aCA9PT0gSW5maW5pdHkpXG4gICAgICB0aGlzLnN0b3BBbmdsZSA9IHRoaXMuc3RhcnRBbmdsZSArIF8yUEk7XG4gICAgZWxzZSBpZiAoY29uZmlnLmxlbmd0aCA9PT0gdGhpcy5kaXNwbGF5TGVuZ3RoKVxuICAgICAgdGhpcy5zdG9wQW5nbGUgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKGNvbmZpZy5zdGFydCwgdHJ1ZSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zdG9wQW5nbGUgPSB0aGlzLmdldEFuZ2xlRnJvbVBvc2l0aW9uKGNvbmZpZy5zdGFydCArIGNvbmZpZy5sZW5ndGgpO1xuXG4gICAgdGhpcy5fcmVuZGVyKCk7XG4gIH1cblxuICBvblJlc2l6ZSh3aWR0aCwgaGVpZ2h0LCBvcmllbnRhdGlvbikge1xuICAgIHN1cGVyLm9uUmVzaXplKHdpZHRoLCBoZWlnaHQsIG9yaWVudGF0aW9uKTtcblxuICAgIGlmICh0aGlzLmNhY2hlZEN0eClcbiAgICAgIHRoaXMuX3JlbmRlcigpO1xuICB9XG5cbiAgX3JlbmRlcigpIHtcbiAgICBjb25zdCBfY3R4ID0gdGhpcy5jYWNoZWRDdHg7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLmNhbnZhc1dpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuY2FudmFzSGVpZ2h0O1xuXG4gICAgX2N0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgX2N0eC5zYXZlKCk7XG4gICAgX2N0eC50cmFuc2xhdGUod2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcblxuICAgIF9jdHguc3Ryb2tlU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgIF9jdHguZ2xvYmFsQWxwaGEgPSB0aGlzLmNvbmZpZy5vcGFjaXR5O1xuICAgIF9jdHgubGluZVdpZHRoID0gdGhpcy5hcmNXaWR0aDtcblxuICAgIF9jdHguYmVnaW5QYXRoKCk7XG4gICAgX2N0eC5hcmMoMCwgMCwgdGhpcy5yYWRpdXMsIHRoaXMuc3RhcnRBbmdsZSwgdGhpcy5zdG9wQW5nbGUsIGZhbHNlKTtcbiAgICBfY3R4LnN0cm9rZSgpO1xuICAgIF9jdHguY2xvc2VQYXRoKCk7XG5cbiAgICBfY3R4LnJlc3RvcmUoKTtcbiAgfVxuXG4gIHJlbmRlcihjdHgpIHtcbiAgICBjdHguZHJhd0ltYWdlKHRoaXMuJGNhY2hlZENhbnZhcywgMCwgMCwgdGhpcy5jYW52YXNXaWR0aCwgdGhpcy5jYW52YXNIZWlnaHQpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNlZ21lbnRSZW5kZXJlcjtcbiJdfQ==