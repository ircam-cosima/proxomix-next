'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _client = require('soundworks/client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audioContext = _client.audio.audioContext;
var maxIdleTime = 6;

var Mixer = function () {
  function Mixer(metricScheduler) {
    (0, _classCallCheck3.default)(this, Mixer);

    this.metricScheduler = metricScheduler;

    this.channels = new _map2.default();

    this.muteGain = audioContext.createGain();
    this.muteGain.connect(audioContext.destination);
    this.muteGain.gain.value = 1;

    this.master = audioContext.createGain();
    this.master.connect(this.muteGain);
    this.master.gain.value = 0;
    this.master.gain.setValueAtTime(0, audioContext.currentTime);

    this._monitorAutomations = this._monitorAutomations.bind(this);
    this._monitorAutomations();

    this.start = this.start.bind(this);
    // addEvent(fun, metricPosition, lookahead = false) {
    var nextMeasurePosition = Math.ceil(this.metricScheduler.currentPosition);
    this.metricScheduler.addEvent(this.start, nextMeasurePosition);
  }

  (0, _createClass3.default)(Mixer, [{
    key: 'connect',
    value: function connect(destination) {
      this.muteGain.connect(destination);
    }
  }, {
    key: 'mute',
    value: function mute(value) {
      var gain = value ? 0 : 1;
      this.muteGain.gain.value = gain;
    }
  }, {
    key: 'start',
    value: function start() {
      var now = audioContext.currentTime;

      var currentPosition = this.metricScheduler.currentPosition;
      var startFade = currentPosition + 2;
      var endFade = currentPosition + 6;
      var startFadeTime = this.metricScheduler.getAudioTimeAtMetricPosition(startFade);
      var endFadeTime = this.metricScheduler.getAudioTimeAtMetricPosition(endFade);

      this.master.gain.setValueAtTime(0, startFadeTime);
      this.master.gain.linearRampToValueAtTime(1, endFadeTime);
    }
  }, {
    key: 'createChannel',
    value: function createChannel(channelId, track) {
      var channel = {};

      channel.input = audioContext.createGain();
      channel.input.connect(this.master);
      channel.input.gain.value = 0;

      track.connect(channel.input);

      channel.track = track;

      channel.automation = {
        activeTime: -Infinity,
        startTime: -Infinity,
        duration: 0,
        startGain: 0,
        targetGain: 0
      };

      this.channels.set(channelId, channel);
    }
  }, {
    key: 'deleteChannel',
    value: function deleteChannel(channelId) {
      var channel = this.channels.get(channelId);
      channel.input.gain.value = 0;
      channel.input.disconnect();

      this.channels.delete(channelId);
    }
  }, {
    key: 'setGain',
    value: function setGain(channelId, value) {
      var _channels$get = this.channels.get(channelId),
          input = _channels$get.input;

      input.gain.value = value;
    }
  }, {
    key: 'setAutomation',
    value: function setAutomation(channelId, targetGain) {
      var duration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;

      var now = audioContext.currentTime;
      var channel = this.channels.get(channelId);
      var automation = channel.automation,
          input = channel.input,
          track = channel.track;

      var currentGain = input.gain.value;

      if (targetGain !== currentGain) {
        automation.startTime = now;
        automation.duration = duration;
        automation.startGain = input.gain.value;
        automation.targetGain = targetGain;
      }

      // activate track if inactive
      if (!track.active && targetGain !== 0) track.active = true;

      // if active but idle for a long time
      if (track.active && targetGain === 0 && now > automation.activeTime + maxIdleTime) track.active = false;
    }
  }, {
    key: '_monitorAutomations',
    value: function _monitorAutomations() {
      var now = audioContext.currentTime;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.channels), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              id = _step$value[0],
              channel = _step$value[1];

          var _channel$automation = channel.automation,
              startTime = _channel$automation.startTime,
              duration = _channel$automation.duration,
              startGain = _channel$automation.startGain,
              targetGain = _channel$automation.targetGain;

          var dt = Math.max(0, now - startTime);

          // as this should be called every 16ms at 60fps we probably miss the
          // target, so we add some lookhead...
          if (dt <= duration + 0.05) {
            // make sure we don't go beyond target value
            if (dt > duration) dt = duration;

            var gain = startGain + (targetGain - startGain) * (dt / duration);
            var clippedGain = Math.max(0, Math.min(1, gain));

            if (clippedGain < 0.001) // -60dB
              clippedGain = 0;

            channel.input.gain.value = clippedGain;

            if (clippedGain > 0) channel.automation.activeTime = now;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      requestAnimationFrame(this._monitorAutomations);
    }
  }]);
  return Mixer;
}();

exports.default = Mixer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1peGVyLmpzIl0sIm5hbWVzIjpbImF1ZGlvQ29udGV4dCIsIm1heElkbGVUaW1lIiwiTWl4ZXIiLCJtZXRyaWNTY2hlZHVsZXIiLCJjaGFubmVscyIsIm11dGVHYWluIiwiY3JlYXRlR2FpbiIsImNvbm5lY3QiLCJkZXN0aW5hdGlvbiIsImdhaW4iLCJ2YWx1ZSIsIm1hc3RlciIsInNldFZhbHVlQXRUaW1lIiwiY3VycmVudFRpbWUiLCJfbW9uaXRvckF1dG9tYXRpb25zIiwiYmluZCIsInN0YXJ0IiwibmV4dE1lYXN1cmVQb3NpdGlvbiIsIk1hdGgiLCJjZWlsIiwiY3VycmVudFBvc2l0aW9uIiwiYWRkRXZlbnQiLCJub3ciLCJzdGFydEZhZGUiLCJlbmRGYWRlIiwic3RhcnRGYWRlVGltZSIsImdldEF1ZGlvVGltZUF0TWV0cmljUG9zaXRpb24iLCJlbmRGYWRlVGltZSIsImxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lIiwiY2hhbm5lbElkIiwidHJhY2siLCJjaGFubmVsIiwiaW5wdXQiLCJhdXRvbWF0aW9uIiwiYWN0aXZlVGltZSIsIkluZmluaXR5Iiwic3RhcnRUaW1lIiwiZHVyYXRpb24iLCJzdGFydEdhaW4iLCJ0YXJnZXRHYWluIiwic2V0IiwiZ2V0IiwiZGlzY29ubmVjdCIsImRlbGV0ZSIsImN1cnJlbnRHYWluIiwiYWN0aXZlIiwiaWQiLCJkdCIsIm1heCIsImNsaXBwZWRHYWluIiwibWluIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUEsSUFBTUEsZUFBZSxjQUFNQSxZQUEzQjtBQUNBLElBQU1DLGNBQWMsQ0FBcEI7O0lBRU1DLEs7QUFDSixpQkFBWUMsZUFBWixFQUE2QjtBQUFBOztBQUMzQixTQUFLQSxlQUFMLEdBQXVCQSxlQUF2Qjs7QUFFQSxTQUFLQyxRQUFMLEdBQWdCLG1CQUFoQjs7QUFFQSxTQUFLQyxRQUFMLEdBQWdCTCxhQUFhTSxVQUFiLEVBQWhCO0FBQ0EsU0FBS0QsUUFBTCxDQUFjRSxPQUFkLENBQXNCUCxhQUFhUSxXQUFuQztBQUNBLFNBQUtILFFBQUwsQ0FBY0ksSUFBZCxDQUFtQkMsS0FBbkIsR0FBMkIsQ0FBM0I7O0FBRUEsU0FBS0MsTUFBTCxHQUFjWCxhQUFhTSxVQUFiLEVBQWQ7QUFDQSxTQUFLSyxNQUFMLENBQVlKLE9BQVosQ0FBb0IsS0FBS0YsUUFBekI7QUFDQSxTQUFLTSxNQUFMLENBQVlGLElBQVosQ0FBaUJDLEtBQWpCLEdBQXlCLENBQXpCO0FBQ0EsU0FBS0MsTUFBTCxDQUFZRixJQUFaLENBQWlCRyxjQUFqQixDQUFnQyxDQUFoQyxFQUFtQ1osYUFBYWEsV0FBaEQ7O0FBRUEsU0FBS0MsbUJBQUwsR0FBMkIsS0FBS0EsbUJBQUwsQ0FBeUJDLElBQXpCLENBQThCLElBQTlCLENBQTNCO0FBQ0EsU0FBS0QsbUJBQUw7O0FBRUEsU0FBS0UsS0FBTCxHQUFhLEtBQUtBLEtBQUwsQ0FBV0QsSUFBWCxDQUFnQixJQUFoQixDQUFiO0FBQ0E7QUFDQSxRQUFNRSxzQkFBc0JDLEtBQUtDLElBQUwsQ0FBVSxLQUFLaEIsZUFBTCxDQUFxQmlCLGVBQS9CLENBQTVCO0FBQ0EsU0FBS2pCLGVBQUwsQ0FBcUJrQixRQUFyQixDQUE4QixLQUFLTCxLQUFuQyxFQUEwQ0MsbUJBQTFDO0FBQ0Q7Ozs7NEJBRU9ULFcsRUFBYTtBQUNuQixXQUFLSCxRQUFMLENBQWNFLE9BQWQsQ0FBc0JDLFdBQXRCO0FBQ0Q7Ozt5QkFFSUUsSyxFQUFPO0FBQ1YsVUFBTUQsT0FBT0MsUUFBUSxDQUFSLEdBQVksQ0FBekI7QUFDQSxXQUFLTCxRQUFMLENBQWNJLElBQWQsQ0FBbUJDLEtBQW5CLEdBQTJCRCxJQUEzQjtBQUNEOzs7NEJBRU87QUFDTixVQUFNYSxNQUFNdEIsYUFBYWEsV0FBekI7O0FBRUEsVUFBTU8sa0JBQWtCLEtBQUtqQixlQUFMLENBQXFCaUIsZUFBN0M7QUFDQSxVQUFNRyxZQUFZSCxrQkFBa0IsQ0FBcEM7QUFDQSxVQUFNSSxVQUFVSixrQkFBa0IsQ0FBbEM7QUFDQSxVQUFNSyxnQkFBZ0IsS0FBS3RCLGVBQUwsQ0FBcUJ1Qiw0QkFBckIsQ0FBa0RILFNBQWxELENBQXRCO0FBQ0EsVUFBTUksY0FBYyxLQUFLeEIsZUFBTCxDQUFxQnVCLDRCQUFyQixDQUFrREYsT0FBbEQsQ0FBcEI7O0FBRUEsV0FBS2IsTUFBTCxDQUFZRixJQUFaLENBQWlCRyxjQUFqQixDQUFnQyxDQUFoQyxFQUFtQ2EsYUFBbkM7QUFDQSxXQUFLZCxNQUFMLENBQVlGLElBQVosQ0FBaUJtQix1QkFBakIsQ0FBeUMsQ0FBekMsRUFBNENELFdBQTVDO0FBQ0Q7OztrQ0FFYUUsUyxFQUFXQyxLLEVBQU87QUFDOUIsVUFBTUMsVUFBVSxFQUFoQjs7QUFFQUEsY0FBUUMsS0FBUixHQUFnQmhDLGFBQWFNLFVBQWIsRUFBaEI7QUFDQXlCLGNBQVFDLEtBQVIsQ0FBY3pCLE9BQWQsQ0FBc0IsS0FBS0ksTUFBM0I7QUFDQW9CLGNBQVFDLEtBQVIsQ0FBY3ZCLElBQWQsQ0FBbUJDLEtBQW5CLEdBQTJCLENBQTNCOztBQUVBb0IsWUFBTXZCLE9BQU4sQ0FBY3dCLFFBQVFDLEtBQXRCOztBQUVBRCxjQUFRRCxLQUFSLEdBQWdCQSxLQUFoQjs7QUFFQUMsY0FBUUUsVUFBUixHQUFxQjtBQUNuQkMsb0JBQVksQ0FBQ0MsUUFETTtBQUVuQkMsbUJBQVcsQ0FBQ0QsUUFGTztBQUduQkUsa0JBQVUsQ0FIUztBQUluQkMsbUJBQVcsQ0FKUTtBQUtuQkMsb0JBQVk7QUFMTyxPQUFyQjs7QUFRQSxXQUFLbkMsUUFBTCxDQUFjb0MsR0FBZCxDQUFrQlgsU0FBbEIsRUFBNkJFLE9BQTdCO0FBQ0Q7OztrQ0FFYUYsUyxFQUFXO0FBQ3ZCLFVBQU1FLFVBQVUsS0FBSzNCLFFBQUwsQ0FBY3FDLEdBQWQsQ0FBa0JaLFNBQWxCLENBQWhCO0FBQ0FFLGNBQVFDLEtBQVIsQ0FBY3ZCLElBQWQsQ0FBbUJDLEtBQW5CLEdBQTJCLENBQTNCO0FBQ0FxQixjQUFRQyxLQUFSLENBQWNVLFVBQWQ7O0FBRUEsV0FBS3RDLFFBQUwsQ0FBY3VDLE1BQWQsQ0FBcUJkLFNBQXJCO0FBQ0Q7Ozs0QkFFT0EsUyxFQUFXbkIsSyxFQUFPO0FBQUEsMEJBQ04sS0FBS04sUUFBTCxDQUFjcUMsR0FBZCxDQUFrQlosU0FBbEIsQ0FETTtBQUFBLFVBQ2hCRyxLQURnQixpQkFDaEJBLEtBRGdCOztBQUV4QkEsWUFBTXZCLElBQU4sQ0FBV0MsS0FBWCxHQUFtQkEsS0FBbkI7QUFDRDs7O2tDQUVhbUIsUyxFQUFXVSxVLEVBQTRCO0FBQUEsVUFBaEJGLFFBQWdCLHVFQUFMLEdBQUs7O0FBQ25ELFVBQU1mLE1BQU10QixhQUFhYSxXQUF6QjtBQUNBLFVBQU1rQixVQUFVLEtBQUszQixRQUFMLENBQWNxQyxHQUFkLENBQWtCWixTQUFsQixDQUFoQjtBQUZtRCxVQUczQ0ksVUFIMkMsR0FHZEYsT0FIYyxDQUczQ0UsVUFIMkM7QUFBQSxVQUcvQkQsS0FIK0IsR0FHZEQsT0FIYyxDQUcvQkMsS0FIK0I7QUFBQSxVQUd4QkYsS0FId0IsR0FHZEMsT0FIYyxDQUd4QkQsS0FId0I7O0FBSW5ELFVBQU1jLGNBQWNaLE1BQU12QixJQUFOLENBQVdDLEtBQS9COztBQUVBLFVBQUk2QixlQUFlSyxXQUFuQixFQUFnQztBQUM5QlgsbUJBQVdHLFNBQVgsR0FBdUJkLEdBQXZCO0FBQ0FXLG1CQUFXSSxRQUFYLEdBQXNCQSxRQUF0QjtBQUNBSixtQkFBV0ssU0FBWCxHQUF1Qk4sTUFBTXZCLElBQU4sQ0FBV0MsS0FBbEM7QUFDQXVCLG1CQUFXTSxVQUFYLEdBQXdCQSxVQUF4QjtBQUNEOztBQUVEO0FBQ0EsVUFBSSxDQUFDVCxNQUFNZSxNQUFQLElBQWlCTixlQUFlLENBQXBDLEVBQ0VULE1BQU1lLE1BQU4sR0FBZSxJQUFmOztBQUVGO0FBQ0EsVUFBSWYsTUFBTWUsTUFBTixJQUFnQk4sZUFBZSxDQUEvQixJQUFvQ2pCLE1BQU1XLFdBQVdDLFVBQVgsR0FBd0JqQyxXQUF0RSxFQUNFNkIsTUFBTWUsTUFBTixHQUFlLEtBQWY7QUFDSDs7OzBDQUVxQjtBQUNwQixVQUFNdkIsTUFBTXRCLGFBQWFhLFdBQXpCOztBQURvQjtBQUFBO0FBQUE7O0FBQUE7QUFHcEIsd0RBQTBCLEtBQUtULFFBQS9CLDRHQUF5QztBQUFBO0FBQUEsY0FBL0IwQyxFQUErQjtBQUFBLGNBQTNCZixPQUEyQjs7QUFBQSxvQ0FDZ0JBLFFBQVFFLFVBRHhCO0FBQUEsY0FDL0JHLFNBRCtCLHVCQUMvQkEsU0FEK0I7QUFBQSxjQUNwQkMsUUFEb0IsdUJBQ3BCQSxRQURvQjtBQUFBLGNBQ1ZDLFNBRFUsdUJBQ1ZBLFNBRFU7QUFBQSxjQUNDQyxVQURELHVCQUNDQSxVQUREOztBQUV2QyxjQUFJUSxLQUFLN0IsS0FBSzhCLEdBQUwsQ0FBUyxDQUFULEVBQVkxQixNQUFNYyxTQUFsQixDQUFUOztBQUVBO0FBQ0E7QUFDQSxjQUFJVyxNQUFNVixXQUFXLElBQXJCLEVBQTJCO0FBQ3pCO0FBQ0EsZ0JBQUlVLEtBQUtWLFFBQVQsRUFDRVUsS0FBS1YsUUFBTDs7QUFFRixnQkFBTTVCLE9BQU82QixZQUFZLENBQUNDLGFBQWFELFNBQWQsS0FBNEJTLEtBQUtWLFFBQWpDLENBQXpCO0FBQ0EsZ0JBQUlZLGNBQWMvQixLQUFLOEIsR0FBTCxDQUFTLENBQVQsRUFBWTlCLEtBQUtnQyxHQUFMLENBQVMsQ0FBVCxFQUFZekMsSUFBWixDQUFaLENBQWxCOztBQUVBLGdCQUFJd0MsY0FBYyxLQUFsQixFQUF5QjtBQUN2QkEsNEJBQWMsQ0FBZDs7QUFFRmxCLG9CQUFRQyxLQUFSLENBQWN2QixJQUFkLENBQW1CQyxLQUFuQixHQUEyQnVDLFdBQTNCOztBQUVBLGdCQUFJQSxjQUFjLENBQWxCLEVBQ0VsQixRQUFRRSxVQUFSLENBQW1CQyxVQUFuQixHQUFnQ1osR0FBaEM7QUFDSDtBQUNGO0FBekJtQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQTJCcEI2Qiw0QkFBc0IsS0FBS3JDLG1CQUEzQjtBQUNEOzs7OztrQkFHWVosSyIsImZpbGUiOiJNaXhlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGF1ZGlvIH0gZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuXG5jb25zdCBhdWRpb0NvbnRleHQgPSBhdWRpby5hdWRpb0NvbnRleHQ7XG5jb25zdCBtYXhJZGxlVGltZSA9IDY7XG5cbmNsYXNzIE1peGVyIHtcbiAgY29uc3RydWN0b3IobWV0cmljU2NoZWR1bGVyKSB7XG4gICAgdGhpcy5tZXRyaWNTY2hlZHVsZXIgPSBtZXRyaWNTY2hlZHVsZXI7XG5cbiAgICB0aGlzLmNoYW5uZWxzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5tdXRlR2FpbiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5tdXRlR2Fpbi5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgdGhpcy5tdXRlR2Fpbi5nYWluLnZhbHVlID0gMTtcblxuICAgIHRoaXMubWFzdGVyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLm1hc3Rlci5jb25uZWN0KHRoaXMubXV0ZUdhaW4pO1xuICAgIHRoaXMubWFzdGVyLmdhaW4udmFsdWUgPSAwO1xuICAgIHRoaXMubWFzdGVyLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcblxuICAgIHRoaXMuX21vbml0b3JBdXRvbWF0aW9ucyA9IHRoaXMuX21vbml0b3JBdXRvbWF0aW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX21vbml0b3JBdXRvbWF0aW9ucygpO1xuXG4gICAgdGhpcy5zdGFydCA9IHRoaXMuc3RhcnQuYmluZCh0aGlzKTtcbiAgICAvLyBhZGRFdmVudChmdW4sIG1ldHJpY1Bvc2l0aW9uLCBsb29rYWhlYWQgPSBmYWxzZSkge1xuICAgIGNvbnN0IG5leHRNZWFzdXJlUG9zaXRpb24gPSBNYXRoLmNlaWwodGhpcy5tZXRyaWNTY2hlZHVsZXIuY3VycmVudFBvc2l0aW9uKTtcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5hZGRFdmVudCh0aGlzLnN0YXJ0LCBuZXh0TWVhc3VyZVBvc2l0aW9uKTtcbiAgfVxuXG4gIGNvbm5lY3QoZGVzdGluYXRpb24pIHtcbiAgICB0aGlzLm11dGVHYWluLmNvbm5lY3QoZGVzdGluYXRpb24pO1xuICB9XG5cbiAgbXV0ZSh2YWx1ZSkge1xuICAgIGNvbnN0IGdhaW4gPSB2YWx1ZSA/IDAgOiAxO1xuICAgIHRoaXMubXV0ZUdhaW4uZ2Fpbi52YWx1ZSA9IGdhaW47XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBjb25zdCBub3cgPSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG5cbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSB0aGlzLm1ldHJpY1NjaGVkdWxlci5jdXJyZW50UG9zaXRpb247XG4gICAgY29uc3Qgc3RhcnRGYWRlID0gY3VycmVudFBvc2l0aW9uICsgMjtcbiAgICBjb25zdCBlbmRGYWRlID0gY3VycmVudFBvc2l0aW9uICsgNjtcbiAgICBjb25zdCBzdGFydEZhZGVUaW1lID0gdGhpcy5tZXRyaWNTY2hlZHVsZXIuZ2V0QXVkaW9UaW1lQXRNZXRyaWNQb3NpdGlvbihzdGFydEZhZGUpO1xuICAgIGNvbnN0IGVuZEZhZGVUaW1lID0gdGhpcy5tZXRyaWNTY2hlZHVsZXIuZ2V0QXVkaW9UaW1lQXRNZXRyaWNQb3NpdGlvbihlbmRGYWRlKTtcblxuICAgIHRoaXMubWFzdGVyLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgc3RhcnRGYWRlVGltZSk7XG4gICAgdGhpcy5tYXN0ZXIuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCBlbmRGYWRlVGltZSk7XG4gIH1cblxuICBjcmVhdGVDaGFubmVsKGNoYW5uZWxJZCwgdHJhY2spIHtcbiAgICBjb25zdCBjaGFubmVsID0ge307XG5cbiAgICBjaGFubmVsLmlucHV0ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICBjaGFubmVsLmlucHV0LmNvbm5lY3QodGhpcy5tYXN0ZXIpO1xuICAgIGNoYW5uZWwuaW5wdXQuZ2Fpbi52YWx1ZSA9IDA7XG5cbiAgICB0cmFjay5jb25uZWN0KGNoYW5uZWwuaW5wdXQpO1xuXG4gICAgY2hhbm5lbC50cmFjayA9IHRyYWNrO1xuXG4gICAgY2hhbm5lbC5hdXRvbWF0aW9uID0ge1xuICAgICAgYWN0aXZlVGltZTogLUluZmluaXR5LFxuICAgICAgc3RhcnRUaW1lOiAtSW5maW5pdHksXG4gICAgICBkdXJhdGlvbjogMCxcbiAgICAgIHN0YXJ0R2FpbjogMCxcbiAgICAgIHRhcmdldEdhaW46IDAsXG4gICAgfTtcblxuICAgIHRoaXMuY2hhbm5lbHMuc2V0KGNoYW5uZWxJZCwgY2hhbm5lbCk7XG4gIH1cblxuICBkZWxldGVDaGFubmVsKGNoYW5uZWxJZCkge1xuICAgIGNvbnN0IGNoYW5uZWwgPSB0aGlzLmNoYW5uZWxzLmdldChjaGFubmVsSWQpO1xuICAgIGNoYW5uZWwuaW5wdXQuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgY2hhbm5lbC5pbnB1dC5kaXNjb25uZWN0KCk7XG5cbiAgICB0aGlzLmNoYW5uZWxzLmRlbGV0ZShjaGFubmVsSWQpO1xuICB9XG5cbiAgc2V0R2FpbihjaGFubmVsSWQsIHZhbHVlKSB7XG4gICAgY29uc3QgeyBpbnB1dCB9ID0gdGhpcy5jaGFubmVscy5nZXQoY2hhbm5lbElkKTtcbiAgICBpbnB1dC5nYWluLnZhbHVlID0gdmFsdWU7XG4gIH1cblxuICBzZXRBdXRvbWF0aW9uKGNoYW5uZWxJZCwgdGFyZ2V0R2FpbiwgZHVyYXRpb24gPSAwLjUpIHtcbiAgICBjb25zdCBub3cgPSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG4gICAgY29uc3QgY2hhbm5lbCA9IHRoaXMuY2hhbm5lbHMuZ2V0KGNoYW5uZWxJZCk7XG4gICAgY29uc3QgeyBhdXRvbWF0aW9uLCBpbnB1dCwgdHJhY2sgfSA9IGNoYW5uZWw7XG4gICAgY29uc3QgY3VycmVudEdhaW4gPSBpbnB1dC5nYWluLnZhbHVlO1xuXG4gICAgaWYgKHRhcmdldEdhaW4gIT09IGN1cnJlbnRHYWluKSB7XG4gICAgICBhdXRvbWF0aW9uLnN0YXJ0VGltZSA9IG5vdztcbiAgICAgIGF1dG9tYXRpb24uZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgICAgIGF1dG9tYXRpb24uc3RhcnRHYWluID0gaW5wdXQuZ2Fpbi52YWx1ZTtcbiAgICAgIGF1dG9tYXRpb24udGFyZ2V0R2FpbiA9IHRhcmdldEdhaW47XG4gICAgfVxuXG4gICAgLy8gYWN0aXZhdGUgdHJhY2sgaWYgaW5hY3RpdmVcbiAgICBpZiAoIXRyYWNrLmFjdGl2ZSAmJiB0YXJnZXRHYWluICE9PSAwKVxuICAgICAgdHJhY2suYWN0aXZlID0gdHJ1ZTtcblxuICAgIC8vIGlmIGFjdGl2ZSBidXQgaWRsZSBmb3IgYSBsb25nIHRpbWVcbiAgICBpZiAodHJhY2suYWN0aXZlICYmIHRhcmdldEdhaW4gPT09IDAgJiYgbm93ID4gYXV0b21hdGlvbi5hY3RpdmVUaW1lICsgbWF4SWRsZVRpbWUpXG4gICAgICB0cmFjay5hY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIF9tb25pdG9yQXV0b21hdGlvbnMoKSB7XG4gICAgY29uc3Qgbm93ID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuXG4gICAgZm9yIChsZXQgW2lkLCBjaGFubmVsXSBvZiB0aGlzLmNoYW5uZWxzKSB7XG4gICAgICBjb25zdCB7IHN0YXJ0VGltZSwgZHVyYXRpb24sIHN0YXJ0R2FpbiwgdGFyZ2V0R2FpbiB9ID0gY2hhbm5lbC5hdXRvbWF0aW9uO1xuICAgICAgbGV0IGR0ID0gTWF0aC5tYXgoMCwgbm93IC0gc3RhcnRUaW1lKTtcblxuICAgICAgLy8gYXMgdGhpcyBzaG91bGQgYmUgY2FsbGVkIGV2ZXJ5IDE2bXMgYXQgNjBmcHMgd2UgcHJvYmFibHkgbWlzcyB0aGVcbiAgICAgIC8vIHRhcmdldCwgc28gd2UgYWRkIHNvbWUgbG9va2hlYWQuLi5cbiAgICAgIGlmIChkdCA8PSBkdXJhdGlvbiArIDAuMDUpIHtcbiAgICAgICAgLy8gbWFrZSBzdXJlIHdlIGRvbid0IGdvIGJleW9uZCB0YXJnZXQgdmFsdWVcbiAgICAgICAgaWYgKGR0ID4gZHVyYXRpb24pXG4gICAgICAgICAgZHQgPSBkdXJhdGlvbjtcblxuICAgICAgICBjb25zdCBnYWluID0gc3RhcnRHYWluICsgKHRhcmdldEdhaW4gLSBzdGFydEdhaW4pICogKGR0IC8gZHVyYXRpb24pO1xuICAgICAgICBsZXQgY2xpcHBlZEdhaW4gPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBnYWluKSk7XG5cbiAgICAgICAgaWYgKGNsaXBwZWRHYWluIDwgMC4wMDEpIC8vIC02MGRCXG4gICAgICAgICAgY2xpcHBlZEdhaW4gPSAwO1xuXG4gICAgICAgIGNoYW5uZWwuaW5wdXQuZ2Fpbi52YWx1ZSA9IGNsaXBwZWRHYWluO1xuXG4gICAgICAgIGlmIChjbGlwcGVkR2FpbiA+IDApXG4gICAgICAgICAgY2hhbm5lbC5hdXRvbWF0aW9uLmFjdGl2ZVRpbWUgPSBub3c7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX21vbml0b3JBdXRvbWF0aW9ucyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTWl4ZXI7XG4iXX0=