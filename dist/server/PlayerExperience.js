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
      this.receive(client, 'cutoff:control', this._onCutoffControl(client));
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
    key: '_onCutoffControl',
    value: function _onCutoffControl(client) {
      var _this4 = this;

      return function (playerId, value) {
        _this4.broadcast('player', client, 'cutoff:control', playerId, value);
      };
    }
  }]);
  return PlayerExperience;
}(_server.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsiaW5zdHJ1bWVudExpc3QiLCJpbnN0cnVtZW50cyIsIm51bUluc3RydW1lbnRzIiwibGVuZ3RoIiwidGVtcG8iLCJjb21tb24iLCJ0ZW1wb1VuaXQiLCJQbGF5ZXJFeHBlcmllbmNlIiwiY2xpZW50VHlwZSIsImF1ZGlvQnVmZmVyTWFuYWdlciIsInJlcXVpcmUiLCJzeW5jIiwibWV0cmljU2NoZWR1bGVyIiwiYXZhaWxhYmxlSWRzIiwicGxheWVySWRzIiwiaSIsImNsaWVudCIsInJlY2VpdmUiLCJfb25QbGF5ZXJFbnRlciIsIl9vbkN1dG9mZkNvbnRyb2wiLCJfb25QbGF5ZXJFeGl0IiwiaW5kZXgiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJpZCIsInNwbGljZSIsImFkZCIsImhhcyIsImRlbGV0ZSIsInNldFRpbWVvdXQiLCJwdXNoIiwiZm9yY2VkSWQiLCJwbGF5ZXJJZCIsIl9nZXRJZCIsImFjdGl2aXRpZXMiLCJicm9hZGNhc3QiLCJzZW5kIiwidW5kZWZpbmVkIiwiX3JlbGVhc2VJZCIsInZhbHVlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxpQkFBaUIsb0JBQVksZ0JBQU1DLFdBQWxCLENBQXZCO0FBQ0EsSUFBTUMsaUJBQWlCRixlQUFlRyxNQUF0QztBQUNBLElBQU1DLFFBQVEsZ0JBQU1DLE1BQU4sQ0FBYUQsS0FBM0I7QUFDQSxJQUFNRSxZQUFZLGdCQUFNRCxNQUFOLENBQWFDLFNBQS9COztBQUVBOztJQUNxQkMsZ0I7OztBQUNuQiw0QkFBWUMsVUFBWixFQUF3QjtBQUFBOztBQUV0QjtBQUZzQiwwSkFDaEJBLFVBRGdCOztBQUd0QixVQUFLQyxrQkFBTCxHQUEwQixNQUFLQyxPQUFMLENBQWEsc0JBQWIsQ0FBMUI7QUFDQSxVQUFLQyxJQUFMLEdBQVksTUFBS0QsT0FBTCxDQUFh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QnBCLE1BQXpCLEVBQWlDLGFBQWpDLEVBQWdEaUIsUUFBaEQ7QUFDRDtBQUNGOzs7cUNBRWdCakIsTSxFQUFRO0FBQUE7O0FBQ3ZCLGFBQU8sVUFBQ2lCLFFBQUQsRUFBV08sS0FBWCxFQUFxQjtBQUMxQixlQUFLSixTQUFMLENBQWUsUUFBZixFQUF5QnBCLE1BQXpCLEVBQWlDLGdCQUFqQyxFQUFtRGlCLFFBQW5ELEVBQTZETyxLQUE3RDtBQUNELE9BRkQ7QUFHRDs7Ozs7a0JBcEZrQmpDLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFeHBlcmllbmNlIH0gZnJvbSAnc291bmR3b3Jrcy9zZXJ2ZXInO1xuaW1wb3J0IHNldHVwIGZyb20gJy4uL3NoYXJlZC9zZXR1cCc7XG5cbmNvbnN0IGluc3RydW1lbnRMaXN0ID0gT2JqZWN0LmtleXMoc2V0dXAuaW5zdHJ1bWVudHMpO1xuY29uc3QgbnVtSW5zdHJ1bWVudHMgPSBpbnN0cnVtZW50TGlzdC5sZW5ndGg7XG5jb25zdCB0ZW1wbyA9IHNldHVwLmNvbW1vbi50ZW1wbztcbmNvbnN0IHRlbXBvVW5pdCA9IHNldHVwLmNvbW1vbi50ZW1wb1VuaXQ7XG5cbi8vIHNlcnZlci1zaWRlICdwbGF5ZXInIGV4cGVyaWVuY2UuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQbGF5ZXJFeHBlcmllbmNlIGV4dGVuZHMgRXhwZXJpZW5jZSB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudFR5cGUpIHtcbiAgICBzdXBlcihjbGllbnRUeXBlKTtcbiAgICAvLyBzZXJ2aWNlc1xuICAgIHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyID0gdGhpcy5yZXF1aXJlKCdhdWRpby1idWZmZXItbWFuYWdlcicpO1xuICAgIHRoaXMuc3luYyA9IHRoaXMucmVxdWlyZSgnc3luYycpO1xuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyID0gdGhpcy5yZXF1aXJlKCdtZXRyaWMtc2NoZWR1bGVyJywgeyB0ZW1wbzogdGVtcG8sIHRlbXBvVW5pdDogdGVtcG9Vbml0IH0pO1xuXG4gICAgdGhpcy5hdmFpbGFibGVJZHMgPSBbXTtcbiAgICB0aGlzLnBsYXllcklkcyA9IG5ldyBTZXQoKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtSW5zdHJ1bWVudHM7IGkrKylcbiAgICAgIHRoaXMuYXZhaWxhYmxlSWRzW2ldID0gaTtcbiAgfVxuXG4gIHN0YXJ0KCkge31cblxuICBlbnRlcihjbGllbnQpIHtcbiAgICBzdXBlci5lbnRlcihjbGllbnQpO1xuXG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ3BsYXllcjplbnRlcicsIHRoaXMuX29uUGxheWVyRW50ZXIoY2xpZW50KSk7XG4gICAgdGhpcy5yZWNlaXZlKGNsaWVudCwgJ2N1dG9mZjpjb250cm9sJywgdGhpcy5fb25DdXRvZmZDb250cm9sKGNsaWVudCkpO1xuICB9XG5cbiAgZXhpdChjbGllbnQpIHtcbiAgICBzdXBlci5leGl0KGNsaWVudCk7XG5cbiAgICB0aGlzLl9vblBsYXllckV4aXQoY2xpZW50KTtcbiAgfVxuXG4gIF9nZXRJZCgpIHtcbiAgICBpZiAodGhpcy5hdmFpbGFibGVJZHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICBjb25zdCBpbmRleCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuYXZhaWxhYmxlSWRzLmxlbmd0aCk7XG4gICAgY29uc3QgaWQgPSB0aGlzLmF2YWlsYWJsZUlkc1tpbmRleF07XG5cbiAgICB0aGlzLmF2YWlsYWJsZUlkcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHRoaXMucGxheWVySWRzLmFkZChpZCk7XG5cbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICBfcmVsZWFzZUlkKGlkKSB7XG4gICAgaWYgKHRoaXMucGxheWVySWRzLmhhcyhpZCkpIHtcbiAgICAgIHRoaXMucGxheWVySWRzLmRlbGV0ZShpZCk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuYXZhaWxhYmxlSWRzLnB1c2goaWQpLCAxMCAqIDEwMDApO1xuICAgIH1cbiAgfVxuXG4gIF9vblBsYXllckVudGVyKGNsaWVudCkge1xuICAgIC8vIGlmIHRoZSBjbGllbnQgZm9yY2UgaXRzIGlkIHRocm91Z2ggdXJsIHBhcmFtcywgb25seSBzZW5kIGl0IGJhY2sgKHdlYiBjbGllbnRzIG9ubHkpXG4gICAgcmV0dXJuIChmb3JjZWRJZCkgPT4ge1xuICAgICAgaWYgKGZvcmNlZElkID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHBsYXllcklkID0gdGhpcy5fZ2V0SWQoKTtcblxuICAgICAgICBpZiAocGxheWVySWQgIT09IG51bGwpIHtcbiAgICAgICAgICBjbGllbnQuYWN0aXZpdGllc1t0aGlzLmlkXS5wbGF5ZXJJZCA9IHBsYXllcklkO1xuICAgICAgICAgIC8vIHNlbmQgaWQgdG8gb3RoZXIgcGVlcnNcbiAgICAgICAgICB0aGlzLmJyb2FkY2FzdCgncGxheWVyJywgbnVsbCwgJ3BsYXllcjplbnRlcmVkJywgcGxheWVySWQpO1xuICAgICAgICAgIC8vIHNlbmQgaWQgYmFjayB0byB0aGUgcGxheWVyIGFsb25nIHdpdGggdGhlIGxpc3Qgb2YgcGxheWVyIGlkc1xuICAgICAgICAgIHRoaXMuc2VuZChjbGllbnQsICdwbGF5ZXI6YWNrJywgcGxheWVySWQsIHRoaXMucGxheWVySWRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLnNlbmQoY2xpZW50LCAncGxheWVyOnJlZnVzZWQnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zZW5kKGNsaWVudCwgJ3BsYXllcjphY2snLCBmb3JjZWRJZCwgdGhpcy5wbGF5ZXJJZHMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBfb25QbGF5ZXJFeGl0KGNsaWVudCkge1xuICAgIGNvbnN0IHBsYXllcklkID0gY2xpZW50LmFjdGl2aXRpZXNbdGhpcy5pZF0ucGxheWVySWQ7XG5cbiAgICBpZiAocGxheWVySWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5fcmVsZWFzZUlkKHBsYXllcklkKTtcbiAgICAgIHRoaXMuYnJvYWRjYXN0KCdwbGF5ZXInLCBjbGllbnQsICdwbGF5ZXI6ZXhpdCcsIHBsYXllcklkKTtcbiAgICB9XG4gIH1cblxuICBfb25DdXRvZmZDb250cm9sKGNsaWVudCkge1xuICAgIHJldHVybiAocGxheWVySWQsIHZhbHVlKSA9PiB7XG4gICAgICB0aGlzLmJyb2FkY2FzdCgncGxheWVyJywgY2xpZW50LCAnY3V0b2ZmOmNvbnRyb2wnLCBwbGF5ZXJJZCwgdmFsdWUpO1xuICAgIH1cbiAgfVxufVxuIl19