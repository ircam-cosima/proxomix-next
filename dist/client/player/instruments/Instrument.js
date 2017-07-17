"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Instrument = function () {
  function Instrument() {
    var environment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, Instrument);

    this.environment = environment;
    this.options = options;
    this._isVisible = false;
    this._isActive = false;
  }

  (0, _createClass3.default)(Instrument, [{
    key: "setControl",
    value: function setControl(name, value) {}
  }, {
    key: "showScreen",
    value: function showScreen() {}
  }, {
    key: "hideScreen",
    value: function hideScreen() {}
  }, {
    key: "startSensors",
    value: function startSensors() {}
  }, {
    key: "stopSensors",
    value: function stopSensors() {}
  }, {
    key: "startSound",
    value: function startSound() {}
  }, {
    key: "stopSound",
    value: function stopSound() {}
  }, {
    key: "connect",
    value: function connect(output) {}
  }, {
    key: "disconnect",
    value: function disconnect(output) {}
  }, {
    key: "visible",
    get: function get() {
      return this._isVisible;
    },
    set: function set(value) {
      var makeVisible = !!value;

      if (this.environment.screenContainer && makeVisible !== this._isVisible) {
        if (makeVisible) this.showScreen();else this.hideScreen();

        this._isVisible = makeVisible;
      }
    }
  }, {
    key: "active",
    get: function get() {
      return this._isActive;
    },
    set: function set(value) {
      var makeActive = !!value;

      if (makeActive !== this._isActive) {
        if (makeActive) {
          this.startSound();

          if (this.environment.motionInput) this.startSensors();
        } else {
          if (this.environment.motionInput) this.stopSensors();

          this.stopSound();
        }

        this._isActive = makeActive;
      }
    }
  }]);
  return Instrument;
}();

exports.default = Instrument;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkluc3RydW1lbnQuanMiXSwibmFtZXMiOlsiSW5zdHJ1bWVudCIsImVudmlyb25tZW50Iiwib3B0aW9ucyIsIl9pc1Zpc2libGUiLCJfaXNBY3RpdmUiLCJuYW1lIiwidmFsdWUiLCJvdXRwdXQiLCJtYWtlVmlzaWJsZSIsInNjcmVlbkNvbnRhaW5lciIsInNob3dTY3JlZW4iLCJoaWRlU2NyZWVuIiwibWFrZUFjdGl2ZSIsInN0YXJ0U291bmQiLCJtb3Rpb25JbnB1dCIsInN0YXJ0U2Vuc29ycyIsInN0b3BTZW5zb3JzIiwic3RvcFNvdW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0lBQU1BLFU7QUFDSix3QkFBNEM7QUFBQSxRQUFoQ0MsV0FBZ0MsdUVBQWxCLEVBQWtCO0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUE7O0FBQzFDLFNBQUtELFdBQUwsR0FBbUJBLFdBQW5CO0FBQ0EsU0FBS0MsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBS0MsVUFBTCxHQUFrQixLQUFsQjtBQUNBLFNBQUtDLFNBQUwsR0FBaUIsS0FBakI7QUFDRDs7OzsrQkFFVUMsSSxFQUFNQyxLLEVBQU8sQ0FFdkI7OztpQ0FFWSxDQUVaOzs7aUNBRVksQ0FFWjs7O21DQUVjLENBRWQ7OztrQ0FFYSxDQUViOzs7aUNBRVksQ0FFWjs7O2dDQUVXLENBRVg7Ozs0QkFFT0MsTSxFQUFRLENBRWY7OzsrQkFFVUEsTSxFQUFRLENBRWxCOzs7d0JBRWE7QUFDWixhQUFPLEtBQUtKLFVBQVo7QUFDRCxLO3NCQUVXRyxLLEVBQU87QUFDakIsVUFBTUUsY0FBYyxDQUFDLENBQUNGLEtBQXRCOztBQUVBLFVBQUksS0FBS0wsV0FBTCxDQUFpQlEsZUFBakIsSUFBb0NELGdCQUFnQixLQUFLTCxVQUE3RCxFQUF5RTtBQUN2RSxZQUFJSyxXQUFKLEVBQ0UsS0FBS0UsVUFBTCxHQURGLEtBR0UsS0FBS0MsVUFBTDs7QUFFRixhQUFLUixVQUFMLEdBQWtCSyxXQUFsQjtBQUNEO0FBQ0Y7Ozt3QkFFWTtBQUNYLGFBQU8sS0FBS0osU0FBWjtBQUNELEs7c0JBRVVFLEssRUFBTztBQUNoQixVQUFNTSxhQUFhLENBQUMsQ0FBQ04sS0FBckI7O0FBRUEsVUFBSU0sZUFBZSxLQUFLUixTQUF4QixFQUFtQztBQUNqQyxZQUFJUSxVQUFKLEVBQWdCO0FBQ2QsZUFBS0MsVUFBTDs7QUFFQSxjQUFJLEtBQUtaLFdBQUwsQ0FBaUJhLFdBQXJCLEVBQ0UsS0FBS0MsWUFBTDtBQUVILFNBTkQsTUFNTztBQUNMLGNBQUksS0FBS2QsV0FBTCxDQUFpQmEsV0FBckIsRUFDRSxLQUFLRSxXQUFMOztBQUVGLGVBQUtDLFNBQUw7QUFDRDs7QUFFRCxhQUFLYixTQUFMLEdBQWlCUSxVQUFqQjtBQUNEO0FBQ0Y7Ozs7O2tCQUdZWixVIiwiZmlsZSI6Ikluc3RydW1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBJbnN0cnVtZW50IHtcbiAgY29uc3RydWN0b3IoZW52aXJvbm1lbnQgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbnZpcm9ubWVudCA9IGVudmlyb25tZW50O1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5faXNWaXNpYmxlID0gZmFsc2U7XG4gICAgdGhpcy5faXNBY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIHNldENvbnRyb2wobmFtZSwgdmFsdWUpIHtcblxuICB9XG5cbiAgc2hvd1NjcmVlbigpIHtcblxuICB9XG5cbiAgaGlkZVNjcmVlbigpIHtcblxuICB9XG5cbiAgc3RhcnRTZW5zb3JzKCkge1xuXG4gIH1cblxuICBzdG9wU2Vuc29ycygpIHtcblxuICB9XG5cbiAgc3RhcnRTb3VuZCgpIHtcblxuICB9XG5cbiAgc3RvcFNvdW5kKCkge1xuXG4gIH1cblxuICBjb25uZWN0KG91dHB1dCkge1xuXG4gIH1cblxuICBkaXNjb25uZWN0KG91dHB1dCkge1xuXG4gIH1cblxuICBnZXQgdmlzaWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5faXNWaXNpYmxlO1xuICB9XG5cbiAgc2V0IHZpc2libGUodmFsdWUpIHtcbiAgICBjb25zdCBtYWtlVmlzaWJsZSA9ICEhdmFsdWU7XG5cbiAgICBpZiAodGhpcy5lbnZpcm9ubWVudC5zY3JlZW5Db250YWluZXIgJiYgbWFrZVZpc2libGUgIT09IHRoaXMuX2lzVmlzaWJsZSkge1xuICAgICAgaWYgKG1ha2VWaXNpYmxlKVxuICAgICAgICB0aGlzLnNob3dTY3JlZW4oKTtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy5oaWRlU2NyZWVuKCk7ICAgICAgXG5cbiAgICAgIHRoaXMuX2lzVmlzaWJsZSA9IG1ha2VWaXNpYmxlO1xuICAgIH1cbiAgfVxuXG4gIGdldCBhY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lzQWN0aXZlO1xuICB9XG5cbiAgc2V0IGFjdGl2ZSh2YWx1ZSkge1xuICAgIGNvbnN0IG1ha2VBY3RpdmUgPSAhIXZhbHVlO1xuXG4gICAgaWYgKG1ha2VBY3RpdmUgIT09IHRoaXMuX2lzQWN0aXZlKSB7XG4gICAgICBpZiAobWFrZUFjdGl2ZSkge1xuICAgICAgICB0aGlzLnN0YXJ0U291bmQoKTtcblxuICAgICAgICBpZiAodGhpcy5lbnZpcm9ubWVudC5tb3Rpb25JbnB1dClcbiAgICAgICAgICB0aGlzLnN0YXJ0U2Vuc29ycygpO1xuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAodGhpcy5lbnZpcm9ubWVudC5tb3Rpb25JbnB1dClcbiAgICAgICAgICB0aGlzLnN0b3BTZW5zb3JzKCk7XG5cbiAgICAgICAgdGhpcy5zdG9wU291bmQoKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5faXNBY3RpdmUgPSBtYWtlQWN0aXZlO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnN0cnVtZW50O1xuIl19