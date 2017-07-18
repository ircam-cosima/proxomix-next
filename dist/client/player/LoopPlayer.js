'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _math = require('soundworks/utils/math');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audio = soundworks.audio;
var audioContext = soundworks.audioContext;
var audioScheduler = soundworks.audio.getScheduler();

function appendSegments(segments, loopSegment, measureDuration) {
  var buffer = loopSegment.buffer;
  var bufferDuration = buffer ? buffer.duration : 0;
  var offset = loopSegment.offset || 0;
  var gain = loopSegment.gain || 0;
  var repeat = loopSegment.repeat || 1;

  for (var n = 0; n < repeat; n++) {
    var cont = !!loopSegment.continue;

    for (var i = 0; i < loopSegment.length; i++) {
      var offsetInBuffer = offset + i * measureDuration;

      if (offsetInBuffer < bufferDuration) {
        var segment = new Segment(buffer, offsetInBuffer, Infinity, 0, gain, cont);
        segments.push(segment);
      }

      cont = true;
    }
  }
}

var Segment = function Segment(buffer) {
  var offsetInBuffer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var durationInBuffer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var offsetInMeasure = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var gain = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var cont = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  (0, _classCallCheck3.default)(this, Segment);

  this.buffer = buffer;
  this.offsetInBuffer = offsetInBuffer;
  this.durationInBuffer = durationInBuffer; // 0: continue untill next segment starts
  this.offsetInMeasure = offsetInMeasure;
  this.gain = gain;
  this.continue = cont; // segment continues previous segment
};

var SegmentTrack = function () {
  function SegmentTrack(segmentedLoops) {
    var transitionTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.05;
    (0, _classCallCheck3.default)(this, SegmentTrack);

    this.src = audioContext.createBufferSource();

    this.segmentedLoops = segmentedLoops;
    this.transitionTime = transitionTime;

    this.minCutoffFreq = 5;
    this.maxCutoffFreq = audioContext.sampleRate / 2;
    this.logCutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    this.loopIndex = 0;
    this.discontinue = true;

    var cutoff = audioContext.createBiquadFilter();
    cutoff.type = 'lowpass';
    cutoff.frequency.value = this.maxCutoffFreq;

    this.output = cutoff;

    this.src = null;
    this.env = null;
    this.cutoff = cutoff;
    this.endTime = 0;
  }

  (0, _createClass3.default)(SegmentTrack, [{
    key: 'startSegment',
    value: function startSegment(audioTime, segment) {
      var buffer = segment.buffer;
      var bufferDuration = buffer.duration;
      var offsetInBuffer = segment.offsetInBuffer;
      var durationInBuffer = Math.min(segment.durationInBuffer || Infinity, bufferDuration - offsetInBuffer);
      var transitionTime = this.transitionTime;

      if (audioTime < this.endTime - transitionTime) {
        var src = this.src;
        var endTime = Math.min(audioTime + transitionTime, this.endTime);

        if (transitionTime > 0) {
          var env = this.env;
          // env.gain.cancelScheduledValues(audioTime);
          env.gain.setValueAtTime(1, audioTime);
          env.gain.linearRampToValueAtTime(0, endTime);
        }

        src.stop(endTime);
      }

      if (offsetInBuffer < bufferDuration) {
        var delay = 0;

        if (offsetInBuffer < transitionTime) {
          delay = transitionTime - offsetInBuffer;
          transitionTime = offsetInBuffer;
        }

        var gain = audioContext.createGain();
        gain.connect(this.cutoff);
        gain.gain.value = (0, _math.decibelToLinear)(segment.gain);

        var _env = audioContext.createGain();
        _env.connect(gain);

        if (transitionTime > 0) {
          _env.gain.value = 0;
          _env.gain.setValueAtTime(0, audioTime + delay);
          _env.gain.linearRampToValueAtTime(1, audioTime + delay + transitionTime);
        }

        var _src = audioContext.createBufferSource();
        _src.connect(_env);
        _src.buffer = buffer;
        _src.start(audioTime + delay, offsetInBuffer - transitionTime);

        audioTime += transitionTime;

        var endInBuffer = offsetInBuffer + durationInBuffer;
        var _endTime = audioTime + durationInBuffer;

        this.src = _src;
        this.env = _env;
        this.endTime = _endTime;
      }
    }
  }, {
    key: 'stopSegment',
    value: function stopSegment() {
      var audioTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : audioContext.currentTime;

      var src = this.src;

      if (src) {
        var transitionTime = this.transitionTime;
        var env = this.env;

        env.gain.setValueAtTime(1, audioTime);
        env.gain.linearRampToValueAtTime(0, audioTime + transitionTime);

        src.stop(audioTime + transitionTime);

        this.src = null;
        this.env = null;
        this.endTime = 0;
      }
    }
  }, {
    key: 'startMeasure',
    value: function startMeasure(audioTime, measureIndex) {
      var canContinue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var segments = this.segmentedLoops[this.loopIndex];
      var measureIndexInPattern = measureIndex % segments.length;
      var segment = segments[measureIndexInPattern];

      if (segment && (this.discontinue || !(segment.continue && canContinue))) {
        var delay = segment.offsetInMeasure || 0;
        this.startSegment(audioTime + delay, segment);
        this.discontinue = false;
      }
    }
  }, {
    key: 'setCutoff',
    value: function setCutoff(value) {
      var cutoffFreq = this.minCutoffFreq * Math.exp(this.logCutoffRatio * value);
      this.cutoff.frequency.value = cutoffFreq;
    }
  }, {
    key: 'setLoop',
    value: function setLoop(value) {
      this.loopIndex = value;
      this.discontinue = true;
    }
  }, {
    key: 'connect',
    value: function connect(node) {
      this.output.connect(node);
    }
  }, {
    key: 'disconnect',
    value: function disconnect(node) {
      this.output.disconnect(node);
    }
  }]);
  return SegmentTrack;
}();

var LoopPlayer = function (_audio$TimeEngine) {
  (0, _inherits3.default)(LoopPlayer, _audio$TimeEngine);

  function LoopPlayer(metricScheduler) {
    var measureLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var tempo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 120;
    var tempoUnit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1 / 4;
    var transitionTime = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.05;
    (0, _classCallCheck3.default)(this, LoopPlayer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LoopPlayer.__proto__ || (0, _getPrototypeOf2.default)(LoopPlayer)).call(this));

    _this.metricScheduler = metricScheduler;
    _this.measureLength = measureLength;
    _this.tempo = tempo;
    _this.tempoUnit = tempoUnit;
    _this.transitionTime = transitionTime;

    _this.measureDuration = 60 / (tempo * tempoUnit);
    _this.measureIndex = undefined;
    _this.segmentTracks = new _set2.default();

    _this.metricScheduler.add(_this);
    return _this;
  }

  (0, _createClass3.default)(LoopPlayer, [{
    key: 'stopAllTracks',
    value: function stopAllTracks() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator3.default)(this.segmentTracks), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var segmentTrack = _step.value;

          segmentTrack.stopSegment();
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
    }
  }, {
    key: 'syncSpeed',
    value: function syncSpeed(syncTime, metricPosition, metricSpeed) {
      if (metricSpeed === 0) this.stopAllTracks();
    }
  }, {
    key: 'syncPosition',
    value: function syncPosition(syncTime, metricPosition, metricSpeed) {
      var audioTime = audioScheduler.currentTime;
      var floatMeasures = metricPosition / this.measureLength;
      var numMeasures = Math.ceil(floatMeasures);
      var nextMeasurePosition = numMeasures * this.measureLength;

      this.measureIndex = numMeasures - 1;
      this.nextMeasureTime = undefined;

      return nextMeasurePosition;
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(syncTime, metricPosition, metricSpeed) {
      var audioTime = audioScheduler.currentTime;

      this.measureIndex++;

      var canContinue = this.nextMeasureTime && Math.abs(audioTime - this.nextMeasureTime) < 0.01;

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(this.segmentTracks), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var segmentTrack = _step2.value;

          segmentTrack.startMeasure(audioTime, this.measureIndex, canContinue);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      this.nextMeasureTime = audioTime + this.measureDuration;

      return metricPosition + this.measureLength;
    }
  }, {
    key: 'removeLoopTrack',
    value: function removeLoopTrack(segmentTrack) {
      segmentTrack.stopSegment();
      this.segmentTracks.delete(segmentTrack);
    }
  }, {
    key: 'addLoopTrack',
    value: function addLoopTrack(loopDescriptions) {
      var _this2 = this;

      var segmentedLoops = [];

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        var _loop = function _loop() {
          var descr = _step3.value;

          var segments = [];

          if (Array.isArray(descr)) descr.forEach(function (seg) {
            return appendSegments(segments, seg, _this2.measureDuration);
          });else appendSegments(segments, descr, _this2.measureDuration);

          segmentedLoops.push(segments);
        };

        for (var _iterator3 = (0, _getIterator3.default)(loopDescriptions), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          _loop();
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var segmentTrack = new SegmentTrack(segmentedLoops, this.transitionTime);
      this.segmentTracks.add(segmentTrack);

      return segmentTrack;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.stopAllTracks();
      this.metricScheduler.remove(this);
    }
  }]);
  return LoopPlayer;
}(audio.TimeEngine);

exports.default = LoopPlayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvb3BQbGF5ZXIuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsImF1ZGlvIiwiYXVkaW9Db250ZXh0IiwiYXVkaW9TY2hlZHVsZXIiLCJnZXRTY2hlZHVsZXIiLCJhcHBlbmRTZWdtZW50cyIsInNlZ21lbnRzIiwibG9vcFNlZ21lbnQiLCJtZWFzdXJlRHVyYXRpb24iLCJidWZmZXIiLCJidWZmZXJEdXJhdGlvbiIsImR1cmF0aW9uIiwib2Zmc2V0IiwiZ2FpbiIsInJlcGVhdCIsIm4iLCJjb250IiwiY29udGludWUiLCJpIiwibGVuZ3RoIiwib2Zmc2V0SW5CdWZmZXIiLCJzZWdtZW50IiwiU2VnbWVudCIsIkluZmluaXR5IiwicHVzaCIsImR1cmF0aW9uSW5CdWZmZXIiLCJvZmZzZXRJbk1lYXN1cmUiLCJTZWdtZW50VHJhY2siLCJzZWdtZW50ZWRMb29wcyIsInRyYW5zaXRpb25UaW1lIiwic3JjIiwiY3JlYXRlQnVmZmVyU291cmNlIiwibWluQ3V0b2ZmRnJlcSIsIm1heEN1dG9mZkZyZXEiLCJzYW1wbGVSYXRlIiwibG9nQ3V0b2ZmUmF0aW8iLCJNYXRoIiwibG9nIiwibG9vcEluZGV4IiwiZGlzY29udGludWUiLCJjdXRvZmYiLCJjcmVhdGVCaXF1YWRGaWx0ZXIiLCJ0eXBlIiwiZnJlcXVlbmN5IiwidmFsdWUiLCJvdXRwdXQiLCJlbnYiLCJlbmRUaW1lIiwiYXVkaW9UaW1lIiwibWluIiwic2V0VmFsdWVBdFRpbWUiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsInN0b3AiLCJkZWxheSIsImNyZWF0ZUdhaW4iLCJjb25uZWN0Iiwic3RhcnQiLCJlbmRJbkJ1ZmZlciIsImN1cnJlbnRUaW1lIiwibWVhc3VyZUluZGV4IiwiY2FuQ29udGludWUiLCJtZWFzdXJlSW5kZXhJblBhdHRlcm4iLCJzdGFydFNlZ21lbnQiLCJjdXRvZmZGcmVxIiwiZXhwIiwibm9kZSIsImRpc2Nvbm5lY3QiLCJMb29wUGxheWVyIiwibWV0cmljU2NoZWR1bGVyIiwibWVhc3VyZUxlbmd0aCIsInRlbXBvIiwidGVtcG9Vbml0IiwidW5kZWZpbmVkIiwic2VnbWVudFRyYWNrcyIsImFkZCIsInNlZ21lbnRUcmFjayIsInN0b3BTZWdtZW50Iiwic3luY1RpbWUiLCJtZXRyaWNQb3NpdGlvbiIsIm1ldHJpY1NwZWVkIiwic3RvcEFsbFRyYWNrcyIsImZsb2F0TWVhc3VyZXMiLCJudW1NZWFzdXJlcyIsImNlaWwiLCJuZXh0TWVhc3VyZVBvc2l0aW9uIiwibmV4dE1lYXN1cmVUaW1lIiwiYWJzIiwic3RhcnRNZWFzdXJlIiwiZGVsZXRlIiwibG9vcERlc2NyaXB0aW9ucyIsImRlc2NyIiwiQXJyYXkiLCJpc0FycmF5IiwiZm9yRWFjaCIsInNlZyIsInJlbW92ZSIsIlRpbWVFbmdpbmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7Ozs7O0FBRUEsSUFBTUMsUUFBUUQsV0FBV0MsS0FBekI7QUFDQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQztBQUNBLElBQU1DLGlCQUFpQkgsV0FBV0MsS0FBWCxDQUFpQkcsWUFBakIsRUFBdkI7O0FBRUEsU0FBU0MsY0FBVCxDQUF3QkMsUUFBeEIsRUFBa0NDLFdBQWxDLEVBQStDQyxlQUEvQyxFQUFnRTtBQUM5RCxNQUFNQyxTQUFTRixZQUFZRSxNQUEzQjtBQUNBLE1BQU1DLGlCQUFpQkQsU0FBU0EsT0FBT0UsUUFBaEIsR0FBMkIsQ0FBbEQ7QUFDQSxNQUFNQyxTQUFTTCxZQUFZSyxNQUFaLElBQXNCLENBQXJDO0FBQ0EsTUFBTUMsT0FBT04sWUFBWU0sSUFBWixJQUFvQixDQUFqQztBQUNBLE1BQU1DLFNBQVNQLFlBQVlPLE1BQVosSUFBc0IsQ0FBckM7O0FBRUEsT0FBSyxJQUFJQyxJQUFJLENBQWIsRUFBZ0JBLElBQUlELE1BQXBCLEVBQTRCQyxHQUE1QixFQUFpQztBQUMvQixRQUFJQyxPQUFPLENBQUMsQ0FBQ1QsWUFBWVUsUUFBekI7O0FBRUEsU0FB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IGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IHsgZGVjaWJlbFRvTGluZWFyIH0gZnJvbSAnc291bmR3b3Jrcy91dGlscy9tYXRoJztcblxuY29uc3QgYXVkaW8gPSBzb3VuZHdvcmtzLmF1ZGlvO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5jb25zdCBhdWRpb1NjaGVkdWxlciA9IHNvdW5kd29ya3MuYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG5cbmZ1bmN0aW9uIGFwcGVuZFNlZ21lbnRzKHNlZ21lbnRzLCBsb29wU2VnbWVudCwgbWVhc3VyZUR1cmF0aW9uKSB7XG4gIGNvbnN0IGJ1ZmZlciA9IGxvb3BTZWdtZW50LmJ1ZmZlcjtcbiAgY29uc3QgYnVmZmVyRHVyYXRpb24gPSBidWZmZXIgPyBidWZmZXIuZHVyYXRpb24gOiAwO1xuICBjb25zdCBvZmZzZXQgPSBsb29wU2VnbWVudC5vZmZzZXQgfHwgMDtcbiAgY29uc3QgZ2FpbiA9IGxvb3BTZWdtZW50LmdhaW4gfHzCoDA7XG4gIGNvbnN0IHJlcGVhdCA9IGxvb3BTZWdtZW50LnJlcGVhdCB8fCAxO1xuXG4gIGZvciAobGV0IG4gPSAwOyBuIDwgcmVwZWF0OyBuKyspIHtcbiAgICBsZXQgY29udCA9ICEhbG9vcFNlZ21lbnQuY29udGludWU7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvb3BTZWdtZW50Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBvZmZzZXRJbkJ1ZmZlciA9IG9mZnNldCArIGkgKiBtZWFzdXJlRHVyYXRpb247XG5cbiAgICAgIGlmIChvZmZzZXRJbkJ1ZmZlciA8IGJ1ZmZlckR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNlZ21lbnQgPSBuZXcgU2VnbWVudChidWZmZXIsIG9mZnNldEluQnVmZmVyLCBJbmZpbml0eSwgMCwgZ2FpbiwgY29udCk7XG4gICAgICAgIHNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnQgPSB0cnVlO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWdtZW50IHtcbiAgY29uc3RydWN0b3IoYnVmZmVyLCBvZmZzZXRJbkJ1ZmZlciA9IDAsIGR1cmF0aW9uSW5CdWZmZXIgPSBJbmZpbml0eSwgb2Zmc2V0SW5NZWFzdXJlID0gMCwgZ2FpbiA9IDAsIGNvbnQgPSBmYWxzZSkge1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMub2Zmc2V0SW5CdWZmZXIgPSBvZmZzZXRJbkJ1ZmZlcjtcbiAgICB0aGlzLmR1cmF0aW9uSW5CdWZmZXIgPSBkdXJhdGlvbkluQnVmZmVyOyAvLyAwOiBjb250aW51ZSB1bnRpbGwgbmV4dCBzZWdtZW50IHN0YXJ0c1xuICAgIHRoaXMub2Zmc2V0SW5NZWFzdXJlID0gb2Zmc2V0SW5NZWFzdXJlO1xuICAgIHRoaXMuZ2FpbiA9IGdhaW47XG4gICAgdGhpcy5jb250aW51ZSA9IGNvbnQ7IC8vIHNlZ21lbnQgY29udGludWVzIHByZXZpb3VzIHNlZ21lbnRcbiAgfVxufVxuXG5jbGFzcyBTZWdtZW50VHJhY2sge1xuICBjb25zdHJ1Y3RvcihzZWdtZW50ZWRMb29wcywgdHJhbnNpdGlvblRpbWUgPSAwLjA1KSB7XG4gICAgdGhpcy5zcmMgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cbiAgICB0aGlzLnNlZ21lbnRlZExvb3BzID0gc2VnbWVudGVkTG9vcHM7XG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IHRyYW5zaXRpb25UaW1lO1xuXG4gICAgdGhpcy5taW5DdXRvZmZGcmVxID0gNTtcbiAgICB0aGlzLm1heEN1dG9mZkZyZXEgPSBhdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSAvIDI7XG4gICAgdGhpcy5sb2dDdXRvZmZSYXRpbyA9IE1hdGgubG9nKHRoaXMubWF4Q3V0b2ZmRnJlcSAvIHRoaXMubWluQ3V0b2ZmRnJlcSk7XG5cbiAgICB0aGlzLmxvb3BJbmRleCA9IDA7XG4gICAgdGhpcy5kaXNjb250aW51ZSA9IHRydWU7XG5cbiAgICBjb25zdCBjdXRvZmYgPSBhdWRpb0NvbnRleHQuY3JlYXRlQmlxdWFkRmlsdGVyKCk7XG4gICAgY3V0b2ZmLnR5cGUgPSAnbG93cGFzcyc7XG4gICAgY3V0b2ZmLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMubWF4Q3V0b2ZmRnJlcTtcblxuICAgIHRoaXMub3V0cHV0ID0gY3V0b2ZmO1xuXG4gICAgdGhpcy5zcmMgPSBudWxsO1xuICAgIHRoaXMuZW52ID0gbnVsbDtcbiAgICB0aGlzLmN1dG9mZiA9IGN1dG9mZjtcbiAgICB0aGlzLmVuZFRpbWUgPSAwO1xuICB9XG5cbiAgc3RhcnRTZWdtZW50KGF1ZGlvVGltZSwgc2VnbWVudCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IHNlZ21lbnQuYnVmZmVyO1xuICAgIGNvbnN0IGJ1ZmZlckR1cmF0aW9uID0gYnVmZmVyLmR1cmF0aW9uO1xuICAgIGNvbnN0IG9mZnNldEluQnVmZmVyID0gc2VnbWVudC5vZmZzZXRJbkJ1ZmZlcjtcbiAgICBjb25zdCBkdXJhdGlvbkluQnVmZmVyID0gTWF0aC5taW4oKHNlZ21lbnQuZHVyYXRpb25JbkJ1ZmZlciB8fCBJbmZpbml0eSksIGJ1ZmZlckR1cmF0aW9uIC0gb2Zmc2V0SW5CdWZmZXIpO1xuICAgIGxldCB0cmFuc2l0aW9uVGltZSA9IHRoaXMudHJhbnNpdGlvblRpbWU7XG5cbiAgICBpZiAoYXVkaW9UaW1lIDwgdGhpcy5lbmRUaW1lIC0gdHJhbnNpdGlvblRpbWUpIHtcbiAgICAgIGNvbnN0IHNyYyA9IHRoaXMuc3JjO1xuICAgICAgY29uc3QgZW5kVGltZSA9IE1hdGgubWluKGF1ZGlvVGltZSArIHRyYW5zaXRpb25UaW1lLCB0aGlzLmVuZFRpbWUpO1xuXG4gICAgICBpZiAodHJhbnNpdGlvblRpbWUgPiAwKSB7XG4gICAgICAgIGNvbnN0IGVudiA9IHRoaXMuZW52O1xuICAgICAgICAvLyBlbnYuZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoYXVkaW9UaW1lKTtcbiAgICAgICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMSwgYXVkaW9UaW1lKTtcbiAgICAgICAgZW52LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMCwgZW5kVGltZSk7XG4gICAgICB9XG5cbiAgICAgIHNyYy5zdG9wKGVuZFRpbWUpO1xuICAgIH1cblxuICAgIGlmIChvZmZzZXRJbkJ1ZmZlciA8IGJ1ZmZlckR1cmF0aW9uKSB7XG4gICAgICBsZXQgZGVsYXkgPSAwO1xuXG4gICAgICBpZiAob2Zmc2V0SW5CdWZmZXIgPCB0cmFuc2l0aW9uVGltZSkge1xuICAgICAgICBkZWxheSA9IHRyYW5zaXRpb25UaW1lIC0gb2Zmc2V0SW5CdWZmZXI7XG4gICAgICAgIHRyYW5zaXRpb25UaW1lID0gb2Zmc2V0SW5CdWZmZXI7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGdhaW4gPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZ2Fpbi5jb25uZWN0KHRoaXMuY3V0b2ZmKTtcbiAgICAgIGdhaW4uZ2Fpbi52YWx1ZSA9IGRlY2liZWxUb0xpbmVhcihzZWdtZW50LmdhaW4pO1xuXG4gICAgICBjb25zdCBlbnYgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZW52LmNvbm5lY3QoZ2Fpbik7XG5cbiAgICAgIGlmICh0cmFuc2l0aW9uVGltZSA+IDApIHtcbiAgICAgICAgZW52LmdhaW4udmFsdWUgPSAwO1xuICAgICAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgwLCBhdWRpb1RpbWUgKyBkZWxheSk7XG4gICAgICAgIGVudi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIGF1ZGlvVGltZSArIGRlbGF5ICsgdHJhbnNpdGlvblRpbWUpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBzcmMgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICBzcmMuY29ubmVjdChlbnYpO1xuICAgICAgc3JjLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICAgIHNyYy5zdGFydChhdWRpb1RpbWUgKyBkZWxheSwgb2Zmc2V0SW5CdWZmZXIgLSB0cmFuc2l0aW9uVGltZSk7XG5cbiAgICAgIGF1ZGlvVGltZSArPSB0cmFuc2l0aW9uVGltZTtcblxuICAgICAgY29uc3QgZW5kSW5CdWZmZXIgPSBvZmZzZXRJbkJ1ZmZlciArIGR1cmF0aW9uSW5CdWZmZXI7XG4gICAgICBsZXQgZW5kVGltZSA9IGF1ZGlvVGltZSArIGR1cmF0aW9uSW5CdWZmZXI7XG5cbiAgICAgIHRoaXMuc3JjID0gc3JjO1xuICAgICAgdGhpcy5lbnYgPSBlbnY7XG4gICAgICB0aGlzLmVuZFRpbWUgPSBlbmRUaW1lO1xuICAgIH1cbiAgfVxuXG4gIHN0b3BTZWdtZW50KGF1ZGlvVGltZSA9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSkge1xuICAgIGNvbnN0IHNyYyA9IHRoaXMuc3JjO1xuXG4gICAgaWYgKHNyYykge1xuICAgICAgY29uc3QgdHJhbnNpdGlvblRpbWUgPSB0aGlzLnRyYW5zaXRpb25UaW1lO1xuICAgICAgY29uc3QgZW52ID0gdGhpcy5lbnY7XG5cbiAgICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDEsIGF1ZGlvVGltZSk7XG4gICAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb1RpbWUgKyB0cmFuc2l0aW9uVGltZSk7XG5cbiAgICAgIHNyYy5zdG9wKGF1ZGlvVGltZSArIHRyYW5zaXRpb25UaW1lKTtcblxuICAgICAgdGhpcy5zcmMgPSBudWxsO1xuICAgICAgdGhpcy5lbnYgPSBudWxsO1xuICAgICAgdGhpcy5lbmRUaW1lID0gMDtcbiAgICB9XG4gIH1cblxuICBzdGFydE1lYXN1cmUoYXVkaW9UaW1lLCBtZWFzdXJlSW5kZXgsIGNhbkNvbnRpbnVlID0gZmFsc2UpIHtcbiAgICBjb25zdCBzZWdtZW50cyA9IHRoaXMuc2VnbWVudGVkTG9vcHNbdGhpcy5sb29wSW5kZXhdO1xuICAgIGNvbnN0IG1lYXN1cmVJbmRleEluUGF0dGVybiA9IG1lYXN1cmVJbmRleCAlIHNlZ21lbnRzLmxlbmd0aDtcbiAgICBjb25zdCBzZWdtZW50ID0gc2VnbWVudHNbbWVhc3VyZUluZGV4SW5QYXR0ZXJuXTtcblxuICAgIGlmIChzZWdtZW50ICYmICh0aGlzLmRpc2NvbnRpbnVlIHx8ICEoc2VnbWVudC5jb250aW51ZSAmJiBjYW5Db250aW51ZSkpKSB7XG4gICAgICBjb25zdCBkZWxheSA9IHNlZ21lbnQub2Zmc2V0SW5NZWFzdXJlIHx8IDA7XG4gICAgICB0aGlzLnN0YXJ0U2VnbWVudChhdWRpb1RpbWUgKyBkZWxheSwgc2VnbWVudCk7XG4gICAgICB0aGlzLmRpc2NvbnRpbnVlID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgc2V0Q3V0b2ZmKHZhbHVlKSB7XG4gICAgY29uc3QgY3V0b2ZmRnJlcSA9IHRoaXMubWluQ3V0b2ZmRnJlcSAqIE1hdGguZXhwKHRoaXMubG9nQ3V0b2ZmUmF0aW8gKiB2YWx1ZSk7XG4gICAgdGhpcy5jdXRvZmYuZnJlcXVlbmN5LnZhbHVlID0gY3V0b2ZmRnJlcTtcbiAgfVxuXG4gIHNldExvb3AodmFsdWUpIHtcbiAgICB0aGlzLmxvb3BJbmRleCA9IHZhbHVlO1xuICAgIHRoaXMuZGlzY29udGludWUgPSB0cnVlO1xuICB9XG5cbiAgY29ubmVjdChub2RlKSB7XG4gICAgdGhpcy5vdXRwdXQuY29ubmVjdChub2RlKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3Qobm9kZSkge1xuICAgIHRoaXMub3V0cHV0LmRpc2Nvbm5lY3Qobm9kZSk7XG4gIH1cbn1cblxuY2xhc3MgTG9vcFBsYXllciBleHRlbmRzIGF1ZGlvLlRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihtZXRyaWNTY2hlZHVsZXIsIG1lYXN1cmVMZW5ndGggPSAxLCB0ZW1wbyA9IDEyMCwgdGVtcG9Vbml0ID0gMSAvIDQsIHRyYW5zaXRpb25UaW1lID0gMC4wNSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlciA9IG1ldHJpY1NjaGVkdWxlcjtcbiAgICB0aGlzLm1lYXN1cmVMZW5ndGggPSBtZWFzdXJlTGVuZ3RoO1xuICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcbiAgICB0aGlzLnRlbXBvVW5pdCA9IHRlbXBvVW5pdDtcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gdHJhbnNpdGlvblRpbWU7XG5cbiAgICB0aGlzLm1lYXN1cmVEdXJhdGlvbiA9IDYwIC8gKHRlbXBvICogdGVtcG9Vbml0KTtcbiAgICB0aGlzLm1lYXN1cmVJbmRleCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNlZ21lbnRUcmFja3MgPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5hZGQodGhpcyk7XG4gIH1cblxuICBzdG9wQWxsVHJhY2tzKCkge1xuICAgIGZvciAobGV0IHNlZ21lbnRUcmFjayBvZiB0aGlzLnNlZ21lbnRUcmFja3MpXG4gICAgICBzZWdtZW50VHJhY2suc3RvcFNlZ21lbnQoKTtcbiAgfVxuXG4gIHN5bmNTcGVlZChzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIG1ldHJpY1NwZWVkKSB7XG4gICAgaWYgKG1ldHJpY1NwZWVkID09PSAwKVxuICAgICAgdGhpcy5zdG9wQWxsVHJhY2tzKCk7XG4gIH1cblxuICBzeW5jUG9zaXRpb24oc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCBtZXRyaWNTcGVlZCkge1xuICAgIGNvbnN0IGF1ZGlvVGltZSA9IGF1ZGlvU2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IGZsb2F0TWVhc3VyZXMgPSBtZXRyaWNQb3NpdGlvbiAvIHRoaXMubWVhc3VyZUxlbmd0aDtcbiAgICBjb25zdCBudW1NZWFzdXJlcyA9IE1hdGguY2VpbChmbG9hdE1lYXN1cmVzKTtcbiAgICBjb25zdCBuZXh0TWVhc3VyZVBvc2l0aW9uID0gbnVtTWVhc3VyZXMgKiB0aGlzLm1lYXN1cmVMZW5ndGg7XG5cbiAgICB0aGlzLm1lYXN1cmVJbmRleCA9IG51bU1lYXN1cmVzIC0gMTtcbiAgICB0aGlzLm5leHRNZWFzdXJlVGltZSA9IHVuZGVmaW5lZDtcblxuICAgIHJldHVybiBuZXh0TWVhc3VyZVBvc2l0aW9uO1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgbWV0cmljU3BlZWQpIHtcbiAgICBjb25zdCBhdWRpb1RpbWUgPSBhdWRpb1NjaGVkdWxlci5jdXJyZW50VGltZTtcblxuICAgIHRoaXMubWVhc3VyZUluZGV4Kys7XG5cbiAgICBjb25zdCBjYW5Db250aW51ZSA9ICh0aGlzLm5leHRNZWFzdXJlVGltZSAmJiBNYXRoLmFicyhhdWRpb1RpbWUgLSB0aGlzLm5leHRNZWFzdXJlVGltZSkgPCAwLjAxKTtcblxuICAgIGZvciAobGV0IHNlZ21lbnRUcmFjayBvZiB0aGlzLnNlZ21lbnRUcmFja3MpXG4gICAgICBzZWdtZW50VHJhY2suc3RhcnRNZWFzdXJlKGF1ZGlvVGltZSwgdGhpcy5tZWFzdXJlSW5kZXgsIGNhbkNvbnRpbnVlKTtcblxuICAgIHRoaXMubmV4dE1lYXN1cmVUaW1lID0gYXVkaW9UaW1lICsgdGhpcy5tZWFzdXJlRHVyYXRpb247XG5cbiAgICByZXR1cm4gbWV0cmljUG9zaXRpb24gKyB0aGlzLm1lYXN1cmVMZW5ndGg7XG4gIH1cblxuICByZW1vdmVMb29wVHJhY2soc2VnbWVudFRyYWNrKSB7XG4gICAgc2VnbWVudFRyYWNrLnN0b3BTZWdtZW50KCk7XG4gICAgdGhpcy5zZWdtZW50VHJhY2tzLmRlbGV0ZShzZWdtZW50VHJhY2spO1xuICB9XG5cbiAgYWRkTG9vcFRyYWNrKGxvb3BEZXNjcmlwdGlvbnMpIHtcbiAgICBjb25zdCBzZWdtZW50ZWRMb29wcyA9IFtdO1xuXG4gICAgZm9yIChsZXQgZGVzY3Igb2YgbG9vcERlc2NyaXB0aW9ucykge1xuICAgICAgY29uc3Qgc2VnbWVudHMgPSBbXTtcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGVzY3IpKVxuICAgICAgICBkZXNjci5mb3JFYWNoKChzZWcpID0+IGFwcGVuZFNlZ21lbnRzKHNlZ21lbnRzLCBzZWcsIHRoaXMubWVhc3VyZUR1cmF0aW9uKSk7XG4gICAgICBlbHNlXG4gICAgICAgIGFwcGVuZFNlZ21lbnRzKHNlZ21lbnRzLCBkZXNjciwgdGhpcy5tZWFzdXJlRHVyYXRpb24pO1xuXG4gICAgICBzZWdtZW50ZWRMb29wcy5wdXNoKHNlZ21lbnRzKTtcbiAgICB9XG5cbiAgICBjb25zdCBzZWdtZW50VHJhY2sgPSBuZXcgU2VnbWVudFRyYWNrKHNlZ21lbnRlZExvb3BzLCB0aGlzLnRyYW5zaXRpb25UaW1lKTtcbiAgICB0aGlzLnNlZ21lbnRUcmFja3MuYWRkKHNlZ21lbnRUcmFjayk7XG5cblxuICAgIHJldHVybiBzZWdtZW50VHJhY2s7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuc3RvcEFsbFRyYWNrcygpO1xuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb29wUGxheWVyO1xuIl19