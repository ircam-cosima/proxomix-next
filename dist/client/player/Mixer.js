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
var fadeInTime = 1;

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
      var startFade = currentPosition;
      var endFade = currentPosition + fadeInTime;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIk1peGVyLmpzIl0sIm5hbWVzIjpbImF1ZGlvQ29udGV4dCIsIm1heElkbGVUaW1lIiwiZmFkZUluVGltZSIsIk1peGVyIiwibWV0cmljU2NoZWR1bGVyIiwiY2hhbm5lbHMiLCJtdXRlR2FpbiIsImNyZWF0ZUdhaW4iLCJjb25uZWN0IiwiZGVzdGluYXRpb24iLCJnYWluIiwidmFsdWUiLCJtYXN0ZXIiLCJzZXRWYWx1ZUF0VGltZSIsImN1cnJlbnRUaW1lIiwiX21vbml0b3JBdXRvbWF0aW9ucyIsImJpbmQiLCJzdGFydCIsIm5leHRNZWFzdXJlUG9zaXRpb24iLCJNYXRoIiwiY2VpbCIsImN1cnJlbnRQb3NpdGlvbiIsImFkZEV2ZW50Iiwibm93Iiwic3RhcnRGYWRlIiwiZW5kRmFkZSIsInN0YXJ0RmFkZVRpbWUiLCJnZXRBdWRpb1RpbWVBdE1ldHJpY1Bvc2l0aW9uIiwiZW5kRmFkZVRpbWUiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsImNoYW5uZWxJZCIsInRyYWNrIiwiY2hhbm5lbCIsImlucHV0IiwiYXV0b21hdGlvbiIsImFjdGl2ZVRpbWUiLCJJbmZpbml0eSIsInN0YXJ0VGltZSIsImR1cmF0aW9uIiwic3RhcnRHYWluIiwidGFyZ2V0R2FpbiIsInNldCIsImdldCIsImRpc2Nvbm5lY3QiLCJkZWxldGUiLCJjdXJyZW50R2FpbiIsImFjdGl2ZSIsImlkIiwiZHQiLCJtYXgiLCJjbGlwcGVkR2FpbiIsIm1pbiIsInJlcXVlc3RBbmltYXRpb25GcmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7OztBQUVBLElBQU1BLGVBQWUsY0FBTUEsWUFBM0I7QUFDQSxJQUFNQyxjQUFjLENBQXBCO0FBQ0EsSUFBTUMsYUFBYSxDQUFuQjs7SUFFTUMsSztBQUNKLGlCQUFZQyxlQUFaLEVBQTZCO0FBQUE7O0FBQzNCLFNBQUtBLGVBQUwsR0FBdUJBLGVBQXZCOztBQUVBLFNBQUtDLFFBQUwsR0FBZ0IsbUJBQWhC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LEtBQUtyQyxtQkFBM0I7QUFDRDs7Ozs7a0JBR1laLEsiLCJmaWxlIjoiTWl4ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhdWRpbyB9IGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcblxuY29uc3QgYXVkaW9Db250ZXh0ID0gYXVkaW8uYXVkaW9Db250ZXh0O1xuY29uc3QgbWF4SWRsZVRpbWUgPSA2O1xuY29uc3QgZmFkZUluVGltZSA9IDE7XG5cbmNsYXNzIE1peGVyIHtcbiAgY29uc3RydWN0b3IobWV0cmljU2NoZWR1bGVyKSB7XG4gICAgdGhpcy5tZXRyaWNTY2hlZHVsZXIgPSBtZXRyaWNTY2hlZHVsZXI7XG5cbiAgICB0aGlzLmNoYW5uZWxzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5tdXRlR2FpbiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVHYWluKCk7XG4gICAgdGhpcy5tdXRlR2Fpbi5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgdGhpcy5tdXRlR2Fpbi5nYWluLnZhbHVlID0gMTtcblxuICAgIHRoaXMubWFzdGVyID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICB0aGlzLm1hc3Rlci5jb25uZWN0KHRoaXMubXV0ZUdhaW4pO1xuICAgIHRoaXMubWFzdGVyLmdhaW4udmFsdWUgPSAwO1xuICAgIHRoaXMubWFzdGVyLmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKTtcblxuICAgIHRoaXMuX21vbml0b3JBdXRvbWF0aW9ucyA9IHRoaXMuX21vbml0b3JBdXRvbWF0aW9ucy5iaW5kKHRoaXMpO1xuICAgIHRoaXMuX21vbml0b3JBdXRvbWF0aW9ucygpO1xuXG4gICAgdGhpcy5zdGFydCA9IHRoaXMuc3RhcnQuYmluZCh0aGlzKTtcbiAgICAvLyBhZGRFdmVudChmdW4sIG1ldHJpY1Bvc2l0aW9uLCBsb29rYWhlYWQgPSBmYWxzZSkge1xuICAgIGNvbnN0IG5leHRNZWFzdXJlUG9zaXRpb24gPSBNYXRoLmNlaWwodGhpcy5tZXRyaWNTY2hlZHVsZXIuY3VycmVudFBvc2l0aW9uKTtcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5hZGRFdmVudCh0aGlzLnN0YXJ0LCBuZXh0TWVhc3VyZVBvc2l0aW9uKTtcbiAgfVxuXG4gIGNvbm5lY3QoZGVzdGluYXRpb24pIHtcbiAgICB0aGlzLm11dGVHYWluLmNvbm5lY3QoZGVzdGluYXRpb24pO1xuICB9XG5cbiAgbXV0ZSh2YWx1ZSkge1xuICAgIGNvbnN0IGdhaW4gPSB2YWx1ZSA/IDAgOiAxO1xuICAgIHRoaXMubXV0ZUdhaW4uZ2Fpbi52YWx1ZSA9IGdhaW47XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBjb25zdCBub3cgPSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG5cbiAgICBjb25zdCBjdXJyZW50UG9zaXRpb24gPSB0aGlzLm1ldHJpY1NjaGVkdWxlci5jdXJyZW50UG9zaXRpb247XG4gICAgY29uc3Qgc3RhcnRGYWRlID0gY3VycmVudFBvc2l0aW9uO1xuICAgIGNvbnN0IGVuZEZhZGUgPSBjdXJyZW50UG9zaXRpb24gKyBmYWRlSW5UaW1lO1xuICAgIGNvbnN0IHN0YXJ0RmFkZVRpbWUgPSB0aGlzLm1ldHJpY1NjaGVkdWxlci5nZXRBdWRpb1RpbWVBdE1ldHJpY1Bvc2l0aW9uKHN0YXJ0RmFkZSk7XG4gICAgY29uc3QgZW5kRmFkZVRpbWUgPSB0aGlzLm1ldHJpY1NjaGVkdWxlci5nZXRBdWRpb1RpbWVBdE1ldHJpY1Bvc2l0aW9uKGVuZEZhZGUpO1xuXG4gICAgdGhpcy5tYXN0ZXIuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCBzdGFydEZhZGVUaW1lKTtcbiAgICB0aGlzLm1hc3Rlci5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIGVuZEZhZGVUaW1lKTtcbiAgfVxuXG4gIGNyZWF0ZUNoYW5uZWwoY2hhbm5lbElkLCB0cmFjaykge1xuICAgIGNvbnN0IGNoYW5uZWwgPSB7fTtcblxuICAgIGNoYW5uZWwuaW5wdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIGNoYW5uZWwuaW5wdXQuY29ubmVjdCh0aGlzLm1hc3Rlcik7XG4gICAgY2hhbm5lbC5pbnB1dC5nYWluLnZhbHVlID0gMDtcblxuICAgIHRyYWNrLmNvbm5lY3QoY2hhbm5lbC5pbnB1dCk7XG5cbiAgICBjaGFubmVsLnRyYWNrID0gdHJhY2s7XG5cbiAgICBjaGFubmVsLmF1dG9tYXRpb24gPSB7XG4gICAgICBhY3RpdmVUaW1lOiAtSW5maW5pdHksXG4gICAgICBzdGFydFRpbWU6IC1JbmZpbml0eSxcbiAgICAgIGR1cmF0aW9uOiAwLFxuICAgICAgc3RhcnRHYWluOiAwLFxuICAgICAgdGFyZ2V0R2FpbjogMCxcbiAgICB9O1xuXG4gICAgdGhpcy5jaGFubmVscy5zZXQoY2hhbm5lbElkLCBjaGFubmVsKTtcbiAgfVxuXG4gIGRlbGV0ZUNoYW5uZWwoY2hhbm5lbElkKSB7XG4gICAgY29uc3QgY2hhbm5lbCA9IHRoaXMuY2hhbm5lbHMuZ2V0KGNoYW5uZWxJZCk7XG4gICAgY2hhbm5lbC5pbnB1dC5nYWluLnZhbHVlID0gMDtcbiAgICBjaGFubmVsLmlucHV0LmRpc2Nvbm5lY3QoKTtcblxuICAgIHRoaXMuY2hhbm5lbHMuZGVsZXRlKGNoYW5uZWxJZCk7XG4gIH1cblxuICBzZXRHYWluKGNoYW5uZWxJZCwgdmFsdWUpIHtcbiAgICBjb25zdCB7IGlucHV0IH0gPSB0aGlzLmNoYW5uZWxzLmdldChjaGFubmVsSWQpO1xuICAgIGlucHV0LmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgfVxuXG4gIHNldEF1dG9tYXRpb24oY2hhbm5lbElkLCB0YXJnZXRHYWluLCBkdXJhdGlvbiA9IDAuNSkge1xuICAgIGNvbnN0IG5vdyA9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZTtcbiAgICBjb25zdCBjaGFubmVsID0gdGhpcy5jaGFubmVscy5nZXQoY2hhbm5lbElkKTtcbiAgICBjb25zdCB7IGF1dG9tYXRpb24sIGlucHV0LCB0cmFjayB9ID0gY2hhbm5lbDtcbiAgICBjb25zdCBjdXJyZW50R2FpbiA9IGlucHV0LmdhaW4udmFsdWU7XG5cbiAgICBpZiAodGFyZ2V0R2FpbiAhPT0gY3VycmVudEdhaW4pIHtcbiAgICAgIGF1dG9tYXRpb24uc3RhcnRUaW1lID0gbm93O1xuICAgICAgYXV0b21hdGlvbi5kdXJhdGlvbiA9IGR1cmF0aW9uO1xuICAgICAgYXV0b21hdGlvbi5zdGFydEdhaW4gPSBpbnB1dC5nYWluLnZhbHVlO1xuICAgICAgYXV0b21hdGlvbi50YXJnZXRHYWluID0gdGFyZ2V0R2FpbjtcbiAgICB9XG5cbiAgICAvLyBhY3RpdmF0ZSB0cmFjayBpZiBpbmFjdGl2ZVxuICAgIGlmICghdHJhY2suYWN0aXZlICYmIHRhcmdldEdhaW4gIT09IDApXG4gICAgICB0cmFjay5hY3RpdmUgPSB0cnVlO1xuXG4gICAgLy8gaWYgYWN0aXZlIGJ1dCBpZGxlIGZvciBhIGxvbmcgdGltZVxuICAgIGlmICh0cmFjay5hY3RpdmUgJiYgdGFyZ2V0R2FpbiA9PT0gMCAmJiBub3cgPiBhdXRvbWF0aW9uLmFjdGl2ZVRpbWUgKyBtYXhJZGxlVGltZSlcbiAgICAgIHRyYWNrLmFjdGl2ZSA9IGZhbHNlO1xuICB9XG5cbiAgX21vbml0b3JBdXRvbWF0aW9ucygpIHtcbiAgICBjb25zdCBub3cgPSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWU7XG5cbiAgICBmb3IgKGxldCBbaWQsIGNoYW5uZWxdIG9mIHRoaXMuY2hhbm5lbHMpIHtcbiAgICAgIGNvbnN0IHsgc3RhcnRUaW1lLCBkdXJhdGlvbiwgc3RhcnRHYWluLCB0YXJnZXRHYWluIH0gPSBjaGFubmVsLmF1dG9tYXRpb247XG4gICAgICBsZXQgZHQgPSBNYXRoLm1heCgwLCBub3cgLSBzdGFydFRpbWUpO1xuXG4gICAgICAvLyBhcyB0aGlzIHNob3VsZCBiZSBjYWxsZWQgZXZlcnkgMTZtcyBhdCA2MGZwcyB3ZSBwcm9iYWJseSBtaXNzIHRoZVxuICAgICAgLy8gdGFyZ2V0LCBzbyB3ZSBhZGQgc29tZSBsb29raGVhZC4uLlxuICAgICAgaWYgKGR0IDw9IGR1cmF0aW9uICsgMC4wNSkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgZG9uJ3QgZ28gYmV5b25kIHRhcmdldCB2YWx1ZVxuICAgICAgICBpZiAoZHQgPiBkdXJhdGlvbilcbiAgICAgICAgICBkdCA9IGR1cmF0aW9uO1xuXG4gICAgICAgIGNvbnN0IGdhaW4gPSBzdGFydEdhaW4gKyAodGFyZ2V0R2FpbiAtIHN0YXJ0R2FpbikgKiAoZHQgLyBkdXJhdGlvbik7XG4gICAgICAgIGxldCBjbGlwcGVkR2FpbiA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIGdhaW4pKTtcblxuICAgICAgICBpZiAoY2xpcHBlZEdhaW4gPCAwLjAwMSkgLy8gLTYwZEJcbiAgICAgICAgICBjbGlwcGVkR2FpbiA9IDA7XG5cbiAgICAgICAgY2hhbm5lbC5pbnB1dC5nYWluLnZhbHVlID0gY2xpcHBlZEdhaW47XG5cbiAgICAgICAgaWYgKGNsaXBwZWRHYWluID4gMClcbiAgICAgICAgICBjaGFubmVsLmF1dG9tYXRpb24uYWN0aXZlVGltZSA9IG5vdztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fbW9uaXRvckF1dG9tYXRpb25zKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBNaXhlcjtcbiJdfQ==