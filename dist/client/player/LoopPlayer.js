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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audio = soundworks.audio;
var audioContext = soundworks.audioContext;
var audioScheduler = soundworks.audio.getScheduler();

function appendSegments(segments, loopSegment, measureDuration) {
  var audioBuffer = loopSegment.audioBuffer;
  var bufferDuration = audioBuffer ? audioBuffer.duration : 0;
  var startOffset = loopSegment.startOffset;
  var repeat = loopSegment.repeat || 1;
  var length = loopSegment.length || Math.floor(audioBuffer.duration / measureDuration + 0.5);

  for (var n = 0; n < repeat; n++) {
    var cont = !!loopSegment.continue;

    for (var i = 0; i < length; i++) {
      var offset = startOffset + i * measureDuration;

      if (offset < bufferDuration) {
        var segment = new Segment(audioBuffer, offset, Infinity, 0, cont);
        segments.push(segment);
      }

      cont = true;
    }
  }
}

var Segment = function Segment(audioBuffer) {
  var offsetInBuffer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var durationInBuffer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var offsetInMeasure = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var cont = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
  (0, _classCallCheck3.default)(this, Segment);

  this.audioBuffer = audioBuffer;
  this.offsetInBuffer = offsetInBuffer;
  this.durationInBuffer = durationInBuffer; // 0: continue untill next segment starts
  this.offsetInMeasure = offsetInMeasure;
  this.continue = cont; // segment continues previous segment
};

var SegmentTrack = function () {
  function SegmentTrack(segments) {
    var transitionTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.05;
    (0, _classCallCheck3.default)(this, SegmentTrack);

    this.src = audioContext.createBufferSource();

    this.segments = segments;
    this.transitionTime = transitionTime;

    this.minCutoffFreq = 5;
    this.maxCutoffFreq = audioContext.sampleRate / 2;
    this.logCutoffRatio = Math.log(this.maxCutoffFreq / this.minCutoffFreq);

    var cutoff = audioContext.createBiquadFilter();
    cutoff.type = 'lowpass';
    cutoff.frequency.value = this.maxCutoffFreq;

    this.output = cutoff;

    this.src = null;
    this.env = null;
    this.cutoff = cutoff;
    this.endTime = 0;

    this._active = false;
  }

  (0, _createClass3.default)(SegmentTrack, [{
    key: 'connect',
    value: function connect(node) {
      this.output.connect(node);
    }
  }, {
    key: 'disconnect',
    value: function disconnect(node) {
      this.output.disconnect(node);
    }
  }, {
    key: 'startSegment',
    value: function startSegment(audioTime, audioBuffer, offsetInBuffer) {
      var durationInBuffer = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Infinity;

      var bufferDuration = audioBuffer.duration;
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

        var _env = audioContext.createGain();
        _env.connect(this.cutoff);

        if (transitionTime > 0) {
          _env.gain.value = 0;
          _env.gain.setValueAtTime(0, audioTime + delay);
          _env.gain.linearRampToValueAtTime(1, audioTime + delay + transitionTime);
        }

        var _src = audioContext.createBufferSource();
        _src.connect(_env);
        _src.buffer = audioBuffer;
        _src.start(audioTime + delay, offsetInBuffer - transitionTime);

        audioTime += transitionTime;

        durationInBuffer = Math.min(durationInBuffer, bufferDuration - offsetInBuffer);

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

      if (this._active) {
        var measureIndexInPattern = measureIndex % this.segments.length;
        var segment = this.segments[measureIndexInPattern];

        if (segment && !(segment.continue && canContinue)) {
          var delay = segment.offsetInMeasure || 0;
          this.startSegment(audioTime + delay, segment.audioBuffer, segment.offsetInBuffer, segment.durationInBuffer);
        }
      }
    }
  }, {
    key: 'setCutoff',
    value: function setCutoff(value) {
      var cutoffFreq = this.minCutoffFreq * Math.exp(this.logCutoffRatio * value);
      this.cutoff.frequency.value = cutoffFreq;
    }
  }, {
    key: 'active',
    get: function get() {
      return this._active;
    },
    set: function set(active) {
      if (!active) this.stopSegment();

      this._active = active;
    }
  }]);
  return SegmentTrack;
}();

var LoopPlayer = function (_audio$TimeEngine) {
  (0, _inherits3.default)(LoopPlayer, _audio$TimeEngine);

  function LoopPlayer(metricScheduler) {
    var measureLength = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var tempo = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 60;
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
    _this.segmentTracks = new _map2.default();

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
          var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
              id = _step$value[0],
              track = _step$value[1];

          track.stopSegment();
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

      var canContinue = !!(this.nextMeasureTime && Math.abs(audioTime - this.nextMeasureTime) < 0.01);

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = (0, _getIterator3.default)(this.segmentTracks), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
              id = _step2$value[0],
              track = _step2$value[1];

          track.startMeasure(audioTime, this.measureIndex, canContinue);
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
    key: 'getLoopTrack',
    value: function getLoopTrack(id) {
      return this.segmentTracks.get(id);
    }

    /** used ? */

  }, {
    key: 'removeLoopTrack',
    value: function removeLoopTrack(id) {
      var segmentTrack = this.segmentTracks.get(id);

      if (segmentTrack) {
        segmentTrack.stopSegment();
        this.segmentTracks.remove(id);
      }
    }
  }, {
    key: 'addLoopTrack',
    value: function addLoopTrack(id, loop) {
      var _this2 = this;

      var segmentTrack = this.segmentTracks.get(id);

      if (segmentTrack) throw new Error('Cannot had segmentTrack twice (id: ' + id + ')');

      var segments = [];

      if (Array.isArray(loop)) loop.forEach(function (elem) {
        return appendSegments(segments, elem, _this2.measureDuration);
      });else appendSegments(segments, loop, this.measureDuration);

      segmentTrack = new SegmentTrack(segments, this.transitionTime);
      this.segmentTracks.set(id, segmentTrack);

      return segmentTrack;
    }
  }, {
    key: 'setCutoff',
    value: function setCutoff(id, value) {
      if (id >= 0) {
        var segmentTrack = this.segmentTracks.get(id);

        if (segmentTrack) segmentTrack.setCutoff(value);
      } else {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = (0, _getIterator3.default)(this.segmentTracks), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _step3$value = (0, _slicedToArray3.default)(_step3.value, 2),
                _id = _step3$value[0],
                _segmentTrack = _step3$value[1];

            _segmentTrack.setCutoff(value);
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
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvb3BQbGF5ZXIuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsImF1ZGlvIiwiYXVkaW9Db250ZXh0IiwiYXVkaW9TY2hlZHVsZXIiLCJnZXRTY2hlZHVsZXIiLCJhcHBlbmRTZWdtZW50cyIsInNlZ21lbnRzIiwibG9vcFNlZ21lbnQiLCJtZWFzdXJlRHVyYXRpb24iLCJhdWRpb0J1ZmZlciIsImJ1ZmZlckR1cmF0aW9uIiwiZHVyYXRpb24iLCJzdGFydE9mZnNldCIsInJlcGVhdCIsImxlbmd0aCIsIk1hdGgiLCJmbG9vciIsIm4iLCJjb250IiwiY29udGludWUiLCJpIiwib2Zmc2V0Iiwic2VnbWVudCIsIlNlZ21lbnQiLCJJbmZpbml0eSIsInB1c2giLCJvZmZzZXRJbkJ1ZmZlciIsImR1cmF0aW9uSW5CdWZmZXIiLCJvZmZzZXRJbk1lYXN1cmUiLCJTZWdtZW50VHJhY2siLCJ0cmFuc2l0aW9uVGltZSIsInNyYyIsImNyZWF0ZUJ1ZmZlclNvdXJjZSIsIm1pbkN1dG9mZkZyZXEiLCJtYXhDdXRvZmZGcmVxIiwic2FtcGxlUmF0ZSIsImxvZ0N1dG9mZlJhdGlvIiwibG9nIiwiY3V0b2ZmIiwiY3JlYXRlQmlxdWFkRmlsdGVyIiwidHlwZSIsImZyZXF1ZW5jeSIsInZhbHVlIiwib3V0cHV0IiwiZW52IiwiZW5kVGltZSIsIl9hY3RpdmUiLCJub2RlIiwiY29ubmVjdCIsImRpc2Nvbm5lY3QiLCJhdWRpb1RpbWUiLCJtaW4iLCJnYWluIiwic2V0VmFsdWVBdFRpbWUiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsInN0b3AiLCJkZWxheSIsImNyZWF0ZUdhaW4iLCJidWZmZXIiLCJzdGFydCIsImVuZEluQnVmZmVyIiwiY3VycmVudFRpbWUiLCJtZWFzdXJlSW5kZXgiLCJjYW5Db250aW51ZSIsIm1lYXN1cmVJbmRleEluUGF0dGVybiIsInN0YXJ0U2VnbWVudCIsImN1dG9mZkZyZXEiLCJleHAiLCJhY3RpdmUiLCJzdG9wU2VnbWVudCIsIkxvb3BQbGF5ZXIiLCJtZXRyaWNTY2hlZHVsZXIiLCJtZWFzdXJlTGVuZ3RoIiwidGVtcG8iLCJ0ZW1wb1VuaXQiLCJ1bmRlZmluZWQiLCJzZWdtZW50VHJhY2tzIiwiYWRkIiwiaWQiLCJ0cmFjayIsInN5bmNUaW1lIiwibWV0cmljUG9zaXRpb24iLCJtZXRyaWNTcGVlZCIsInN0b3BBbGxUcmFja3MiLCJmbG9hdE1lYXN1cmVzIiwibnVtTWVhc3VyZXMiLCJjZWlsIiwibmV4dE1lYXN1cmVQb3NpdGlvbiIsIm5leHRNZWFzdXJlVGltZSIsImFicyIsInN0YXJ0TWVhc3VyZSIsImdldCIsInNlZ21lbnRUcmFjayIsInJlbW92ZSIsImxvb3AiLCJFcnJvciIsIkFycmF5IiwiaXNBcnJheSIsImZvckVhY2giLCJlbGVtIiwic2V0Iiwic2V0Q3V0b2ZmIiwiVGltZUVuZ2luZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7Ozs7O0FBRVosSUFBTUMsUUFBUUQsV0FBV0MsS0FBekI7QUFDQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQztBQUNBLElBQU1DLGlCQUFpQkgsV0FBV0MsS0FBWCxDQUFpQkcsWUFBakIsRUFBdkI7O0FBRUEsU0FBU0MsY0FBVCxDQUF3QkMsUUFBeEIsRUFBa0NDLFdBQWxDLEVBQStDQyxlQUEvQyxFQUFnRTtBQUM5RCxNQUFNQyxjQUFjRixZQUFZRSxXQUFoQztBQUNBLE1BQU1DLGlCQUFpQkQsY0FBY0EsWUFBWUUsUUFBMUIsR0FBcUMsQ0FBNUQ7QUFDQSxNQUFNQyxjQUFjTCxZQUFZSyxXQUFoQztBQUNBLE1BQU1DLFNBQVNOLFlBQVlNLE1BQVosSUFBc0IsQ0FBckM7QUFDQSxNQUFNQyxTQUFTUCxZQUFZTyxNQUFaLElBQXVCQyxLQUFLQyxLQUFMLENBQVlQLFlBQVlFLFFBQVosR0FBdUJILGVBQXhCLEdBQTJDLEdBQXRELENBQXRDOztBQUVBLE9BQUssSUFBSVMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJSixNQUFw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QUFDTCwyREFBK0IsS0FBS2tDLGFBQXBDO0FBQUE7QUFBQSxnQkFBVUUsR0FBVjtBQUFBLGdCQUFjYyxhQUFkOztBQUNFQSwwQkFBYVMsU0FBYixDQUF1QjNELEtBQXZCO0FBREY7QUFESztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBR047QUFDRjs7OzhCQUVTO0FBQ1IsV0FBS3lDLGFBQUw7QUFDQSxXQUFLWixlQUFMLENBQXFCc0IsTUFBckIsQ0FBNEIsSUFBNUI7QUFDRDs7O0VBdEdzQjVGLE1BQU1xRyxVOztrQkF5R2hCaEMsVSIsImZpbGUiOiJMb29wUGxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbmNvbnN0IGF1ZGlvID0gc291bmR3b3Jrcy5hdWRpbztcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuY29uc3QgYXVkaW9TY2hlZHVsZXIgPSBzb3VuZHdvcmtzLmF1ZGlvLmdldFNjaGVkdWxlcigpO1xuXG5mdW5jdGlvbiBhcHBlbmRTZWdtZW50cyhzZWdtZW50cywgbG9vcFNlZ21lbnQsIG1lYXN1cmVEdXJhdGlvbikge1xuICBjb25zdCBhdWRpb0J1ZmZlciA9IGxvb3BTZWdtZW50LmF1ZGlvQnVmZmVyO1xuICBjb25zdCBidWZmZXJEdXJhdGlvbiA9IGF1ZGlvQnVmZmVyID8gYXVkaW9CdWZmZXIuZHVyYXRpb24gOiAwO1xuICBjb25zdCBzdGFydE9mZnNldCA9IGxvb3BTZWdtZW50LnN0YXJ0T2Zmc2V0O1xuICBjb25zdCByZXBlYXQgPSBsb29wU2VnbWVudC5yZXBlYXQgfHwgMTtcbiAgY29uc3QgbGVuZ3RoID0gbG9vcFNlZ21lbnQubGVuZ3RoIHx8IMKgTWF0aC5mbG9vcigoYXVkaW9CdWZmZXIuZHVyYXRpb24gLyBtZWFzdXJlRHVyYXRpb24pICsgMC41KTtcblxuICBmb3IgKGxldCBuID0gMDsgbiA8IHJlcGVhdDsgbisrKSB7XG4gICAgbGV0IGNvbnQgPSAhIWxvb3BTZWdtZW50LmNvbnRpbnVlO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3Qgb2Zmc2V0ID0gc3RhcnRPZmZzZXQgKyBpICogbWVhc3VyZUR1cmF0aW9uO1xuXG4gICAgICBpZiAob2Zmc2V0IDwgYnVmZmVyRHVyYXRpb24pIHtcbiAgICAgICAgY29uc3Qgc2VnbWVudCA9IG5ldyBTZWdtZW50KGF1ZGlvQnVmZmVyLCBvZmZzZXQsIEluZmluaXR5LCAwLCBjb250KTtcbiAgICAgICAgc2VnbWVudHMucHVzaChzZWdtZW50KTtcbiAgICAgIH1cblxuICAgICAgY29udCA9IHRydWU7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFNlZ21lbnQge1xuICBjb25zdHJ1Y3RvcihhdWRpb0J1ZmZlciwgb2Zmc2V0SW5CdWZmZXIgPSAwLCBkdXJhdGlvbkluQnVmZmVyID0gSW5maW5pdHksIG9mZnNldEluTWVhc3VyZSA9IDAsIGNvbnQgPSBmYWxzZSkge1xuICAgIHRoaXMuYXVkaW9CdWZmZXIgPSBhdWRpb0J1ZmZlcjtcbiAgICB0aGlzLm9mZnNldEluQnVmZmVyID0gb2Zmc2V0SW5CdWZmZXI7XG4gICAgdGhpcy5kdXJhdGlvbkluQnVmZmVyID0gZHVyYXRpb25JbkJ1ZmZlcjsgLy8gMDogY29udGludWUgdW50aWxsIG5leHQgc2VnbWVudCBzdGFydHNcbiAgICB0aGlzLm9mZnNldEluTWVhc3VyZSA9IG9mZnNldEluTWVhc3VyZTtcbiAgICB0aGlzLmNvbnRpbnVlID0gY29udDsgLy8gc2VnbWVudCBjb250aW51ZXMgcHJldmlvdXMgc2VnbWVudFxuICB9XG59XG5cbmNsYXNzIFNlZ21lbnRUcmFjayB7XG4gIGNvbnN0cnVjdG9yKHNlZ21lbnRzLCB0cmFuc2l0aW9uVGltZSA9IDAuMDUpIHtcbiAgICB0aGlzLnNyYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcblxuICAgIHRoaXMuc2VnbWVudHMgPSBzZWdtZW50cztcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gdHJhbnNpdGlvblRpbWU7XG5cbiAgICB0aGlzLm1pbkN1dG9mZkZyZXEgPSA1O1xuICAgIHRoaXMubWF4Q3V0b2ZmRnJlcSA9IGF1ZGlvQ29udGV4dC5zYW1wbGVSYXRlIC8gMjtcbiAgICB0aGlzLmxvZ0N1dG9mZlJhdGlvID0gTWF0aC5sb2codGhpcy5tYXhDdXRvZmZGcmVxIC8gdGhpcy5taW5DdXRvZmZGcmVxKTtcblxuICAgIGNvbnN0IGN1dG9mZiA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCaXF1YWRGaWx0ZXIoKTtcbiAgICBjdXRvZmYudHlwZSA9ICdsb3dwYXNzJztcbiAgICBjdXRvZmYuZnJlcXVlbmN5LnZhbHVlID0gdGhpcy5tYXhDdXRvZmZGcmVxO1xuXG4gICAgdGhpcy5vdXRwdXQgPSBjdXRvZmY7XG5cbiAgICB0aGlzLnNyYyA9IG51bGw7XG4gICAgdGhpcy5lbnYgPSBudWxsO1xuICAgIHRoaXMuY3V0b2ZmID0gY3V0b2ZmO1xuICAgIHRoaXMuZW5kVGltZSA9IDA7XG5cbiAgICB0aGlzLl9hY3RpdmUgPSBmYWxzZTtcbiAgfVxuXG4gIGdldCBhY3RpdmUoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FjdGl2ZTtcbiAgfVxuXG4gIHNldCBhY3RpdmUoYWN0aXZlKSB7XG4gICAgaWYgKCFhY3RpdmUpXG4gICAgICB0aGlzLnN0b3BTZWdtZW50KCk7XG5cbiAgICB0aGlzLl9hY3RpdmUgPSBhY3RpdmU7XG4gIH1cblxuICBjb25uZWN0KG5vZGUpIHtcbiAgICB0aGlzLm91dHB1dC5jb25uZWN0KG5vZGUpO1xuICB9XG5cbiAgZGlzY29ubmVjdChub2RlKSB7XG4gICAgdGhpcy5vdXRwdXQuZGlzY29ubmVjdChub2RlKTtcbiAgfVxuXG4gIHN0YXJ0U2VnbWVudChhdWRpb1RpbWUsIGF1ZGlvQnVmZmVyLCBvZmZzZXRJbkJ1ZmZlciwgZHVyYXRpb25JbkJ1ZmZlciA9IEluZmluaXR5KSB7XG4gICAgY29uc3QgYnVmZmVyRHVyYXRpb24gPSBhdWRpb0J1ZmZlci5kdXJhdGlvbjtcbiAgICBsZXQgdHJhbnNpdGlvblRpbWUgPSB0aGlzLnRyYW5zaXRpb25UaW1lO1xuXG4gICAgaWYgKGF1ZGlvVGltZSA8IHRoaXMuZW5kVGltZSAtIHRyYW5zaXRpb25UaW1lKSB7XG4gICAgICBjb25zdCBzcmMgPSB0aGlzLnNyYztcbiAgICAgIGNvbnN0IGVuZFRpbWUgPSBNYXRoLm1pbihhdWRpb1RpbWUgKyB0cmFuc2l0aW9uVGltZSwgdGhpcy5lbmRUaW1lKTtcblxuICAgICAgaWYgKHRyYW5zaXRpb25UaW1lID4gMCkge1xuICAgICAgICBjb25zdCBlbnYgPSB0aGlzLmVudjtcbiAgICAgICAgLy8gZW52LmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKGF1ZGlvVGltZSk7XG4gICAgICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDEsIGF1ZGlvVGltZSk7XG4gICAgICAgIGVudi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGVuZFRpbWUpO1xuICAgICAgfVxuXG4gICAgICBzcmMuc3RvcChlbmRUaW1lKTtcbiAgICB9XG5cbiAgICBpZiAob2Zmc2V0SW5CdWZmZXIgPCBidWZmZXJEdXJhdGlvbikge1xuICAgICAgbGV0IGRlbGF5ID0gMDtcblxuICAgICAgaWYgKG9mZnNldEluQnVmZmVyIDwgdHJhbnNpdGlvblRpbWUpIHtcbiAgICAgICAgZGVsYXkgPSB0cmFuc2l0aW9uVGltZSAtIG9mZnNldEluQnVmZmVyO1xuICAgICAgICB0cmFuc2l0aW9uVGltZSA9IG9mZnNldEluQnVmZmVyO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBlbnYgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgICAgZW52LmNvbm5lY3QodGhpcy5jdXRvZmYpO1xuXG4gICAgICBpZiAodHJhbnNpdGlvblRpbWUgPiAwKSB7XG4gICAgICAgIGVudi5nYWluLnZhbHVlID0gMDtcbiAgICAgICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMCwgYXVkaW9UaW1lICsgZGVsYXkpO1xuICAgICAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgxLCBhdWRpb1RpbWUgKyBkZWxheSArIHRyYW5zaXRpb25UaW1lKTtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc3JjID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgICAgc3JjLmNvbm5lY3QoZW52KTtcbiAgICAgIHNyYy5idWZmZXIgPSBhdWRpb0J1ZmZlcjtcbiAgICAgIHNyYy5zdGFydChhdWRpb1RpbWUgKyBkZWxheSwgb2Zmc2V0SW5CdWZmZXIgLSB0cmFuc2l0aW9uVGltZSk7XG5cbiAgICAgIGF1ZGlvVGltZSArPSB0cmFuc2l0aW9uVGltZTtcblxuICAgICAgZHVyYXRpb25JbkJ1ZmZlciA9IE1hdGgubWluKGR1cmF0aW9uSW5CdWZmZXIsIGJ1ZmZlckR1cmF0aW9uIC0gb2Zmc2V0SW5CdWZmZXIpO1xuXG4gICAgICBjb25zdCBlbmRJbkJ1ZmZlciA9IG9mZnNldEluQnVmZmVyICsgZHVyYXRpb25JbkJ1ZmZlcjtcbiAgICAgIGxldCBlbmRUaW1lID0gYXVkaW9UaW1lICsgZHVyYXRpb25JbkJ1ZmZlcjtcblxuICAgICAgdGhpcy5zcmMgPSBzcmM7XG4gICAgICB0aGlzLmVudiA9IGVudjtcbiAgICAgIHRoaXMuZW5kVGltZSA9IGVuZFRpbWU7XG4gICAgfVxuICB9XG5cbiAgc3RvcFNlZ21lbnQoYXVkaW9UaW1lID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lKSB7XG4gICAgY29uc3Qgc3JjID0gdGhpcy5zcmM7XG5cbiAgICBpZiAoc3JjKSB7XG4gICAgICBjb25zdCB0cmFuc2l0aW9uVGltZSA9IHRoaXMudHJhbnNpdGlvblRpbWU7XG4gICAgICBjb25zdCBlbnYgPSB0aGlzLmVudjtcblxuICAgICAgZW52LmdhaW4uc2V0VmFsdWVBdFRpbWUoMSwgYXVkaW9UaW1lKTtcbiAgICAgIGVudi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGF1ZGlvVGltZSArIHRyYW5zaXRpb25UaW1lKTtcblxuICAgICAgc3JjLnN0b3AoYXVkaW9UaW1lICsgdHJhbnNpdGlvblRpbWUpO1xuXG4gICAgICB0aGlzLnNyYyA9IG51bGw7XG4gICAgICB0aGlzLmVudiA9IG51bGw7XG4gICAgICB0aGlzLmVuZFRpbWUgPSAwO1xuICAgIH1cbiAgfVxuXG4gIHN0YXJ0TWVhc3VyZShhdWRpb1RpbWUsIG1lYXN1cmVJbmRleCwgY2FuQ29udGludWUgPSBmYWxzZSkge1xuICAgIGlmICh0aGlzLl9hY3RpdmUpIHtcbiAgICAgIGNvbnN0IG1lYXN1cmVJbmRleEluUGF0dGVybiA9IG1lYXN1cmVJbmRleCAlIHRoaXMuc2VnbWVudHMubGVuZ3RoO1xuICAgICAgY29uc3Qgc2VnbWVudCA9IHRoaXMuc2VnbWVudHNbbWVhc3VyZUluZGV4SW5QYXR0ZXJuXTtcblxuICAgICAgaWYgKHNlZ21lbnQgJiYgIShzZWdtZW50LmNvbnRpbnVlICYmIGNhbkNvbnRpbnVlKSkge1xuICAgICAgICBjb25zdCBkZWxheSA9IHNlZ21lbnQub2Zmc2V0SW5NZWFzdXJlIHx8IDA7XG4gICAgICAgIHRoaXMuc3RhcnRTZWdtZW50KGF1ZGlvVGltZSArIGRlbGF5LCBzZWdtZW50LmF1ZGlvQnVmZmVyLCBzZWdtZW50Lm9mZnNldEluQnVmZmVyLCBzZWdtZW50LmR1cmF0aW9uSW5CdWZmZXIpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldEN1dG9mZih2YWx1ZSkge1xuICAgIGNvbnN0IGN1dG9mZkZyZXEgPSB0aGlzLm1pbkN1dG9mZkZyZXEgKiBNYXRoLmV4cCh0aGlzLmxvZ0N1dG9mZlJhdGlvICogdmFsdWUpO1xuICAgIHRoaXMuY3V0b2ZmLmZyZXF1ZW5jeS52YWx1ZSA9IGN1dG9mZkZyZXE7XG4gIH1cbn1cblxuY2xhc3MgTG9vcFBsYXllciBleHRlbmRzIGF1ZGlvLlRpbWVFbmdpbmUge1xuICBjb25zdHJ1Y3RvcihtZXRyaWNTY2hlZHVsZXIsIG1lYXN1cmVMZW5ndGggPSAxLCB0ZW1wbyA9IDYwLCB0ZW1wb1VuaXQgPSAxIC8gNCwgdHJhbnNpdGlvblRpbWUgPSAwLjA1KSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyID0gbWV0cmljU2NoZWR1bGVyO1xuICAgIHRoaXMubWVhc3VyZUxlbmd0aCA9IG1lYXN1cmVMZW5ndGg7XG4gICAgdGhpcy50ZW1wbyA9IHRlbXBvO1xuICAgIHRoaXMudGVtcG9Vbml0ID0gdGVtcG9Vbml0O1xuICAgIHRoaXMudHJhbnNpdGlvblRpbWUgPSB0cmFuc2l0aW9uVGltZTtcblxuICAgIHRoaXMubWVhc3VyZUR1cmF0aW9uID0gNjAgLyAodGVtcG8gKiB0ZW1wb1VuaXQpO1xuICAgIHRoaXMubWVhc3VyZUluZGV4ID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuc2VnbWVudFRyYWNrcyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyLmFkZCh0aGlzKTtcbiAgfVxuXG4gIHN0b3BBbGxUcmFja3MoKSB7XG4gICAgZm9yIChsZXQgW2lkLCB0cmFja10gb2YgdGhpcy5zZWdtZW50VHJhY2tzKVxuICAgICAgdHJhY2suc3RvcFNlZ21lbnQoKTtcbiAgfVxuXG4gIHN5bmNTcGVlZChzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIG1ldHJpY1NwZWVkKSB7XG4gICAgaWYgKG1ldHJpY1NwZWVkID09PSAwKVxuICAgICAgdGhpcy5zdG9wQWxsVHJhY2tzKCk7XG4gIH1cblxuICBzeW5jUG9zaXRpb24oc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCBtZXRyaWNTcGVlZCkge1xuICAgIGNvbnN0IGF1ZGlvVGltZSA9IGF1ZGlvU2NoZWR1bGVyLmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IGZsb2F0TWVhc3VyZXMgPSBtZXRyaWNQb3NpdGlvbiAvIHRoaXMubWVhc3VyZUxlbmd0aDtcbiAgICBjb25zdCBudW1NZWFzdXJlcyA9IE1hdGguY2VpbChmbG9hdE1lYXN1cmVzKTtcbiAgICBjb25zdCBuZXh0TWVhc3VyZVBvc2l0aW9uID0gbnVtTWVhc3VyZXMgKiB0aGlzLm1lYXN1cmVMZW5ndGg7XG5cbiAgICB0aGlzLm1lYXN1cmVJbmRleCA9IG51bU1lYXN1cmVzIC0gMTtcbiAgICB0aGlzLm5leHRNZWFzdXJlVGltZSA9IHVuZGVmaW5lZDtcblxuICAgIHJldHVybiBuZXh0TWVhc3VyZVBvc2l0aW9uO1xuICB9XG5cbiAgYWR2YW5jZVBvc2l0aW9uKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgbWV0cmljU3BlZWQpIHtcbiAgICBjb25zdCBhdWRpb1RpbWUgPSBhdWRpb1NjaGVkdWxlci5jdXJyZW50VGltZTtcblxuICAgIHRoaXMubWVhc3VyZUluZGV4Kys7XG5cbiAgICBjb25zdCBjYW5Db250aW51ZSA9ICEhKHRoaXMubmV4dE1lYXN1cmVUaW1lICYmIE1hdGguYWJzKGF1ZGlvVGltZSAtIHRoaXMubmV4dE1lYXN1cmVUaW1lKSA8IDAuMDEpO1xuXG4gICAgZm9yIChsZXQgW2lkLCB0cmFja10gb2YgdGhpcy5zZWdtZW50VHJhY2tzKVxuICAgICAgdHJhY2suc3RhcnRNZWFzdXJlKGF1ZGlvVGltZSwgdGhpcy5tZWFzdXJlSW5kZXgsIGNhbkNvbnRpbnVlKTtcblxuICAgIHRoaXMubmV4dE1lYXN1cmVUaW1lID0gYXVkaW9UaW1lICsgdGhpcy5tZWFzdXJlRHVyYXRpb247XG5cbiAgICByZXR1cm4gbWV0cmljUG9zaXRpb24gKyB0aGlzLm1lYXN1cmVMZW5ndGg7XG4gIH1cblxuICBnZXRMb29wVHJhY2soaWQpIHtcbiAgICByZXR1cm4gdGhpcy5zZWdtZW50VHJhY2tzLmdldChpZCk7XG4gIH1cblxuICAvKiogdXNlZCA/ICovXG4gIHJlbW92ZUxvb3BUcmFjayhpZCkge1xuICAgIGNvbnN0IHNlZ21lbnRUcmFjayA9IHRoaXMuc2VnbWVudFRyYWNrcy5nZXQoaWQpO1xuXG4gICAgaWYgKHNlZ21lbnRUcmFjaykge1xuICAgICAgc2VnbWVudFRyYWNrLnN0b3BTZWdtZW50KCk7XG4gICAgICB0aGlzLnNlZ21lbnRUcmFja3MucmVtb3ZlKGlkKTtcbiAgICB9XG4gIH1cblxuICBhZGRMb29wVHJhY2soaWQsIGxvb3ApIHtcbiAgICBsZXQgc2VnbWVudFRyYWNrID0gdGhpcy5zZWdtZW50VHJhY2tzLmdldChpZCk7XG5cbiAgICBpZiAoc2VnbWVudFRyYWNrKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgaGFkIHNlZ21lbnRUcmFjayB0d2ljZSAoaWQ6ICR7aWR9KWApO1xuXG4gICAgY29uc3Qgc2VnbWVudHMgPSBbXTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGxvb3ApKVxuICAgICAgbG9vcC5mb3JFYWNoKChlbGVtKSA9PiBhcHBlbmRTZWdtZW50cyhzZWdtZW50cywgZWxlbSwgdGhpcy5tZWFzdXJlRHVyYXRpb24pKTtcbiAgICBlbHNlXG4gICAgICBhcHBlbmRTZWdtZW50cyhzZWdtZW50cywgbG9vcCwgdGhpcy5tZWFzdXJlRHVyYXRpb24pO1xuXG4gICAgc2VnbWVudFRyYWNrID0gbmV3IFNlZ21lbnRUcmFjayhzZWdtZW50cywgdGhpcy50cmFuc2l0aW9uVGltZSk7XG4gICAgdGhpcy5zZWdtZW50VHJhY2tzLnNldChpZCwgc2VnbWVudFRyYWNrKTtcblxuICAgIHJldHVybiBzZWdtZW50VHJhY2s7XG4gIH1cblxuICBzZXRDdXRvZmYoaWQsIHZhbHVlKSB7XG4gICAgaWYgKGlkID49IDApIHtcbiAgICAgIGNvbnN0IHNlZ21lbnRUcmFjayA9IHRoaXMuc2VnbWVudFRyYWNrcy5nZXQoaWQpO1xuXG4gICAgICBpZiAoc2VnbWVudFRyYWNrKVxuICAgICAgICBzZWdtZW50VHJhY2suc2V0Q3V0b2ZmKHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChsZXQgW2lkLCBzZWdtZW50VHJhY2tdIG9mIHRoaXMuc2VnbWVudFRyYWNrcylcbiAgICAgICAgc2VnbWVudFRyYWNrLnNldEN1dG9mZih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLnN0b3BBbGxUcmFja3MoKTtcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTG9vcFBsYXllcjtcbiJdfQ==