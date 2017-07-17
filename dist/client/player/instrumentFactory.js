"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var InstrumentFactory = function () {
  function InstrumentFactory(options) {
    (0, _classCallCheck3.default)(this, InstrumentFactory);

    this.ctors = new _map2.default();
  }

  (0, _createClass3.default)(InstrumentFactory, [{
    key: "addCtor",
    value: function addCtor(name, ctor) {
      this.ctors.set(name, ctor);
    }
  }, {
    key: "createInstrument",
    value: function createInstrument(environment, name, options) {
      var ctor = this.ctors.get(name);

      if (!ctor) throw new Error("Cannot find instrument class '" + name + "'");

      var instrument = new ctor(environment, options);
      return instrument;
    }
  }]);
  return InstrumentFactory;
}();

exports.default = new InstrumentFactory();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluc3RydW1lbnRGYWN0b3J5LmpzIl0sIm5hbWVzIjpbIkluc3RydW1lbnRGYWN0b3J5Iiwib3B0aW9ucyIsImN0b3JzIiwibmFtZSIsImN0b3IiLCJzZXQiLCJlbnZpcm9ubWVudCIsImdldCIsIkVycm9yIiwiaW5zdHJ1bWVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBTUEsaUI7QUFDSiw2QkFBWUMsT0FBWixFQUFxQjtBQUFBOztBQUNuQixTQUFLQyxLQUFMLEdBQWEsbUJBQWI7QUFDRDs7Ozs0QkFFT0MsSSxFQUFNQyxJLEVBQU07QUFDbEIsV0FBS0YsS0FBTCxDQUFXRyxHQUFYLENBQWVGLElBQWYsRUFBcUJDLElBQXJCO0FBQ0Q7OztxQ0FFZ0JFLFcsRUFBYUgsSSxFQUFNRixPLEVBQVM7QUFDM0MsVUFBTUcsT0FBTyxLQUFLRixLQUFMLENBQVdLLEdBQVgsQ0FBZUosSUFBZixDQUFiOztBQUVBLFVBQUksQ0FBQ0MsSUFBTCxFQUNFLE1BQU0sSUFBSUksS0FBSixvQ0FBMkNMLElBQTNDLE9BQU47O0FBRUYsVUFBTU0sYUFBYSxJQUFJTCxJQUFKLENBQVNFLFdBQVQsRUFBc0JMLE9BQXRCLENBQW5CO0FBQ0EsYUFBT1EsVUFBUDtBQUNEOzs7OztrQkFHWSxJQUFJVCxpQkFBSixFIiwiZmlsZSI6Imluc3RydW1lbnRGYWN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgSW5zdHJ1bWVudEZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5jdG9ycyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIGFkZEN0b3IobmFtZSwgY3Rvcikge1xuICAgIHRoaXMuY3RvcnMuc2V0KG5hbWUsIGN0b3IpO1xuICB9XG5cbiAgY3JlYXRlSW5zdHJ1bWVudChlbnZpcm9ubWVudCwgbmFtZSwgb3B0aW9ucykge1xuICAgIGNvbnN0IGN0b3IgPSB0aGlzLmN0b3JzLmdldChuYW1lKTtcblxuICAgIGlmICghY3RvcilcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IGZpbmQgaW5zdHJ1bWVudCBjbGFzcyAnJHtuYW1lfSdgKTtcblxuICAgIGNvbnN0IGluc3RydW1lbnQgPSBuZXcgY3RvcihlbnZpcm9ubWVudCwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGluc3RydW1lbnQ7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgbmV3IEluc3RydW1lbnRGYWN0b3J5KCk7XG4iXX0=