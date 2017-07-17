'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

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

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _server = require('soundworks/server');

var _setup = require('../shared/setup');

var _setup2 = _interopRequireDefault(_setup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var instrumentList = (0, _keys2.default)(_setup2.default.instruments);
var numInstruments = instrumentList.length;
var tempo = _setup2.default.common.tempo;
var tempoUnit = _setup2.default.common.tempoUnit;

// server-side 'player' experience.

var PlayerExperience = function (_Experience) {
  (0, _inherits3.default)(PlayerExperience, _Experience);

  function PlayerExperience(clientType) {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    // services
    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerExperience.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience)).call(this, clientType));

    _this.audioBufferManager = _this.require('audio-buffer-manager');
    _this.sync = _this.require('sync');
    _this.metricScheduler = _this.require('metric-scheduler', { tempo: tempo, tempoUnit: tempoUnit });

    _this.availableIds = [];
    _this.playerIds = new _set2.default();

    for (var i = 0; i < numInstruments; i++) {
      _this.availableIds[i] = i;
    }return _this;
  }

  (0, _createClass3.default)(PlayerExperience, [{
    key: 'start',
    value: function start() {}
  }, {
    key: 'enter',
    value: function enter(client) {
      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'enter', this).call(this, client);

      this.receive(client, 'player:enter', this._onPlayerEnter(client));
      this.receive(client, 'instrument:control', this._onInstrumentControl(client));
    }
  }, {
    key: 'exit',
    value: function exit(client) {
      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'exit', this).call(this, client);

      this._onPlayerExit(client);
    }
  }, {
    key: '_getId',
    value: function _getId() {
      if (this.availableIds.length === 0) return null;

      var index = Math.floor(Math.random() * this.availableIds.length);
      var id = this.availableIds[index];

      this.availableIds.splice(index, 1);
      this.playerIds.add(id);

      return id;
    }
  }, {
    key: '_releaseId',
    value: function _releaseId(id) {
      var _this2 = this;

      if (this.playerIds.has(id)) {
        this.playerIds.delete(id);
        setTimeout(function () {
          return _this2.availableIds.push(id);
        }, 10 * 1000);
      }
    }
  }, {
    key: '_onPlayerEnter',
    value: function _onPlayerEnter(client) {
      var _this3 = this;

      // if the client force its id through url params, only send it back (web clients only)
      return function (forcedId) {
        if (forcedId === null) {
          var playerId = _this3._getId();

          if (playerId !== null) {
            client.activities[_this3.id].playerId = playerId;
            // send id to other peers
            _this3.broadcast('player', null, 'player:entered', playerId);
            // send id back to the player along with the list of player ids
            _this3.send(client, 'player:ack', playerId, _this3.playerIds);
          } else {
            _this3.send(client, 'player:refused');
          }
        } else {
          _this3.send(client, 'player:ack', forcedId, _this3.playerIds);
        }
      };
    }
  }, {
    key: '_onPlayerExit',
    value: function _onPlayerExit(client) {
      var playerId = client.activities[this.id].playerId;

      if (playerId !== undefined) {
        this._releaseId(playerId);
        this.broadcast('player', client, 'player:exit', playerId);
      }
    }
  }, {
    key: '_onInstrumentControl',
    value: function _onInstrumentControl(client) {
      var _this4 = this;

      return function (playerId, name, value) {
        return _this4.broadcast('player', client, 'instrument:control', playerId, name, value);
      };
    }
  }]);
  return PlayerExperience;
}(_server.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsiaW5zdHJ1bWVudExpc3QiLCJpbnN0cnVtZW50cyIsIm51bUluc3RydW1lbnRzIiwibGVuZ3RoIiwidGVtcG8iLCJjb21tb24iLCJ0ZW1wb1VuaXQiLCJQbGF5ZXJFeHBlcmllbmNlIiwiY2xpZW50VHlwZSIsImF1ZGlvQnVmZmVyTWFuYWdlciIsInJlcXVpcmUiLCJzeW5jIiwibWV0cmljU2NoZWR1bGVyIiwiYXZhaWxhYmxlSWRzIiwicGxheWVySWRzIiwiaSIsImNsaWVudCIsInJlY2VpdmUiLCJfb25QbGF5ZXJFbnRlciIsIl9vbkluc3RydW1lbnRDb250cm9sIiwiX29uUGxheWVyRXhpdCIsImluZGV4IiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwiaWQiLCJzcGxpY2UiLCJhZGQiLCJoYXMiLCJkZWxldGUiLCJzZXRUaW1lb3V0IiwicHVzaCIsImZvcmNlZElkIiwicGxheWVySWQiLCJfZ2V0SWQiLCJhY3Rpdml0aWVzIiwiYnJvYWRjYXN0Iiwic2VuZCIsInVuZGVmaW5lZCIsIl9yZWxlYXNlSWQiLCJuYW1lIiwidmFsdWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7OztBQUVBLElBQU1BLGlCQUFpQixvQkFBWSxnQkFBTUMsV0FBbEIsQ0FBdkI7QUFDQSxJQUFNQyxpQkFBaUJGLGVBQWVHLE1BQXRDO0FBQ0EsSUFBTUMsUUFBUSxnQkFBTUMsTUFBTixDQUFhRCxLQUEzQjtBQUNBLElBQU1FLFlBQVksZ0JBQU1ELE1BQU4sQ0FBYUMsU0FBL0I7O0FBRUE7O0lBQ3FCQyxnQjs7O0FBQ25CLDRCQUFZQyxVQUFaLEVBQXdCO0FBQUE7O0FBRXRCO0FBRnNCLDBKQUNoQkEsVUFEZ0I7O0FBR3RCLFVBQUtDLGtCQUFMLEdBQTBCLE1BQUtDLE9BQUwsQ0FBYSxzQkFBYixDQUExQjtBQUNBLFVBQUtDLElBQUwsR0FBWSxNQUFL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ZSxRQUFmLEVBQXlCcEIsTUFBekIsRUFBaUMsYUFBakMsRUFBZ0RpQixRQUFoRDtBQUNEO0FBQ0Y7Ozt5Q0FFb0JqQixNLEVBQVE7QUFBQTs7QUFDM0IsYUFBTyxVQUFDaUIsUUFBRCxFQUFXTyxJQUFYLEVBQWlCQyxLQUFqQjtBQUFBLGVBQTJCLE9BQUtMLFNBQUwsQ0FBZSxRQUFmLEVBQXlCcEIsTUFBekIsRUFBaUMsb0JBQWpDLEVBQXVEaUIsUUFBdkQsRUFBaUVPLElBQWpFLEVBQXVFQyxLQUF2RSxDQUEzQjtBQUFBLE9BQVA7QUFDRDs7Ozs7a0JBbEZrQmxDLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeHBlcmllbmNlIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuaW1wb3J0IHNldHVwIGZyb20gJy4uL3NoYXJlZC9zZXR1cCc7XG5cbmNvbnN0IGluc3RydW1lbnRMaXN0ID0gT2JqZWN0LmtleXMoc2V0dXAuaW5zdHJ1bWVudHMpO1xuY29uc3QgbnVtSW5zdHJ1bWVudHMgPSBpbnN0cnVtZW50TGlzdC5sZW5ndGg7XG5jb25zdCB0ZW1wbyA9IHNldHVwLmNvbW1vbi50ZW1wbztcbmNvbnN0IHRlbXBvVW5pdCA9IHNldHVwLmNvbW1vbi50ZW1wb1VuaXQ7XG5cbi8vIHNlcnZlci1zaWRlICdwbGF5ZXInIGV4cGVyaWVuY2UuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFR5cGUpIHtcbiAgICBzdXBlcihjbGllbnRUeXBlKTtcbiAgICAvLyBzZXJ2aWNlc1xuICAgIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicpO1xuICAgIHRoaXMuc3luYyA9IHRoaXMucmVxdWlyZSgnc3luYycpO1xuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyID0gdGhpcy5yZXF1aXJlKCdtZXRyaWMtc2NoZWR1bGVyJywgeyB0ZW1wbzogdGVtcG8sIHRlbXBvVW5pdDogdGVtcG9Vbml0IH0pO1xuXG4gICAgdGhpcy5hdmFpbGFibGVJZHMgPSBbXTtcbiAgICB0aGlzLnBsYXllcklkcyA9IG5ldyBTZXQoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtSW5zdHJ1bWVudHM7IGkrKylcbiAgICAgIHRoaXMuYXZhaWxhYmxlSWRzW2ldID0gaTtcbiAgfVxuXG4gIHN0YXJ0KCkge31cblxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ3BsYXllcjplbnRlcicsIHRoaXMuX29uUGxheWVyRW50ZXIoY2xpZW50KSk7XG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2luc3RydW1lbnQ6Y29udHJvbCcsIHRoaXMuX29uSW5zdHJ1bWVudENvbnRyb2woY2xpZW50KSk7XG4gIH1cblxuICBleGl0KGNsaWVudCkge1xuICAgIHN1cGVyLmV4aXQoY2xpZW50KTtcblxuICAgIHRoaXMuX29uUGxheWVyRXhpdChjbGllbnQpO1xuICB9XG5cbiAgX2dldElkKCkge1xuICAgIGlmICh0aGlzLmF2YWlsYWJsZUlkcy5sZW5ndGggPT09IDApXG4gICAgICByZXR1cm4gbnVsbDtcblxuICAgIGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5hdmFpbGFibGVJZHMubGVuZ3RoKTtcbiAgICBjb25zdCBpZCA9IHRoaXMuYXZhaWxhYmxlSWRzW2luZGV4XTtcblxuICAgIHRoaXMuYXZhaWxhYmxlSWRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgdGhpcy5wbGF5ZXJJZHMuYWRkKGlkKTtcblxuICAgIHJldHVybiBpZDtcbiAgfVxuXG4gIF9yZWxlYXNlSWQoaWQpIHtcbiAgICBpZiAodGhpcy5wbGF5ZXJJZHMuaGFzKGlkKSkge1xuICAgICAgdGhpcy5wbGF5ZXJJZHMuZGVsZXRlKGlkKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5hdmFpbGFibGVJZHMucHVzaChpZCksIDEwICogMTAwMCk7XG4gICAgfVxuICB9XG5cbiAgX29uUGxheWVyRW50ZXIoY2xpZW50KSB7XG4gICAgLy8gaWYgdGhlIGNsaWVudCBmb3JjZSBpdHMgaWQgdGhyb3VnaCB1cmwgcGFyYW1zLCBvbmx5IHNlbmQgaXQgYmFjayAod2ViIGNsaWVudHMgb25seSlcbiAgICByZXR1cm4gKGZvcmNlZElkKSA9PiB7XG4gICAgICBpZiAoZm9yY2VkSWQgPT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgcGxheWVySWQgPSB0aGlzLl9nZXRJZCgpO1xuXG4gICAgICAgIGlmIChwbGF5ZXJJZCAhPT0gbnVsbCkge1xuICAgICAgICAgIGNsaWVudC5hY3Rpdml0aWVzW3RoaXMuaWRdLnBsYXllcklkID0gcGxheWVySWQ7XG4gICAgICAgICAgLy8gc2VuZCBpZCB0byBvdGhlciBwZWVyc1xuICAgICAgICAgIHRoaXMuYnJvYWRjYXN0KCdwbGF5ZXInLCBudWxsLCAncGxheWVyOmVudGVyZWQnLCBwbGF5ZXJJZCk7XG4gICAgICAgICAgLy8gc2VuZCBpZCBiYWNrIHRvIHRoZSBwbGF5ZXIgYWxvbmcgd2l0aCB0aGUgbGlzdCBvZiBwbGF5ZXIgaWRzXG4gICAgICAgICAgdGhpcy5zZW5kKGNsaWVudCwgJ3BsYXllcjphY2snLCBwbGF5ZXJJZCwgdGhpcy5wbGF5ZXJJZHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuc2VuZChjbGllbnQsICdwbGF5ZXI6cmVmdXNlZCcpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnNlbmQoY2xpZW50LCAncGxheWVyOmFjaycsIGZvcmNlZElkLCB0aGlzLnBsYXllcklkcyk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIF9vblBsYXllckV4aXQoY2xpZW50KSB7XG4gICAgY29uc3QgcGxheWVySWQgPSBjbGllbnQuYWN0aXZpdGllc1t0aGlzLmlkXS5wbGF5ZXJJZDtcblxuICAgIGlmIChwbGF5ZXJJZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLl9yZWxlYXNlSWQocGxheWVySWQpO1xuICAgICAgdGhpcy5icm9hZGNhc3QoJ3BsYXllcicsIGNsaWVudCwgJ3BsYXllcjpleGl0JywgcGxheWVySWQpO1xuICAgIH1cbiAgfVxuXG4gIF9vbkluc3RydW1lbnRDb250cm9sKGNsaWVudCkge1xuICAgIHJldHVybiAocGxheWVySWQsIG5hbWUsIHZhbHVlKSA9PiB0aGlzLmJyb2FkY2FzdCgncGxheWVyJywgY2xpZW50LCAnaW5zdHJ1bWVudDpjb250cm9sJywgcGxheWVySWQsIG5hbWUsIHZhbHVlKTtcbiAgfVxufVxuIl19