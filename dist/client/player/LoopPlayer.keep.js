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
          var track = _step.value;

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
          var track = _step2.value;

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

    /** used ? */

  }, {
    key: 'removeLoopTrack',
    value: function removeLoopTrack(track) {
      if (track) {
        track.stopSegment();
        this.segmentTracks.delete(track);
      }
    }
  }, {
    key: 'addLoopTrack',
    value: function addLoopTrack(loop) {
      var _this2 = this;

      var segments = [];

      if (Array.isArray(loop)) loop.forEach(function (elem) {
        return appendSegments(segments, elem, _this2.measureDuration);
      });else appendSegments(segments, loop, this.measureDuration);

      var track = new SegmentTrack(segments, this.transitionTime);
      this.segmentTracks.add(track);

      return track;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvb3BQbGF5ZXIua2VlcC5qcyJdLCJuYW1lcyI6WyJzb3VuZHdvcmtzIiwiYXVkaW8iLCJhdWRpb0NvbnRleHQiLCJhdWRpb1NjaGVkdWxlciIsImdldFNjaGVkdWxlciIsImFwcGVuZFNlZ21lbnRzIiwic2VnbWVudHMiLCJsb29wU2VnbWVudCIsIm1lYXN1cmVEdXJhdGlvbiIsImF1ZGlvQnVmZmVyIiwiYnVmZmVyRHVyYXRpb24iLCJkdXJhdGlvbiIsInN0YXJ0T2Zmc2V0IiwicmVwZWF0IiwibGVuZ3RoIiwiTWF0aCIsImZsb29yIiwibiIsImNvbnQiLCJjb250aW51ZSIsImkiLCJvZmZzZXQiLCJzZWdtZW50IiwiU2VnbWVudCIsIkluZmluaXR5IiwicHVzaCIsIm9mZnNldEluQnVmZmVyIiwiZHVyYXRpb25JbkJ1ZmZlciIsIm9mZnNldEluTWVhc3VyZSIsIlNlZ21lbnRUcmFjayIsInRyYW5zaXRpb25UaW1lIiwic3JjIiwiY3JlYXRlQnVmZmVyU291cmNlIiwibWluQ3V0b2ZmRnJlcSIsIm1heEN1dG9mZkZyZXEiLCJzYW1wbGVSYXRlIiwibG9nQ3V0b2ZmUmF0aW8iLCJsb2ciLCJjdXRvZmYiLCJjcmVhdGVCaXF1YWRGaWx0ZXIiLCJ0eXBlIiwiZnJlcXVlbmN5IiwidmFsdWUiLCJvdXRwdXQiLCJlbnYiLCJlbmRUaW1lIiwiX2FjdGl2ZSIsIm5vZGUiLCJjb25uZWN0IiwiZGlzY29ubmVjdCIsImF1ZGlvVGltZSIsIm1pbiIsImdhaW4iLCJzZXRWYWx1ZUF0VGltZSIsImxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lIiwic3RvcCIsImRlbGF5IiwiY3JlYXRlR2FpbiIsImJ1ZmZlciIsInN0YXJ0IiwiZW5kSW5CdWZmZXIiLCJjdXJyZW50VGltZSIsIm1lYXN1cmVJbmRleCIsImNhbkNvbnRpbnVlIiwibWVhc3VyZUluZGV4SW5QYXR0ZXJuIiwic3RhcnRTZWdtZW50IiwiY3V0b2ZmRnJlcSIsImV4cCIsImFjdGl2ZSIsInN0b3BTZWdtZW50IiwiTG9vcFBsYXllciIsIm1ldHJpY1NjaGVkdWxlciIsIm1lYXN1cmVMZW5ndGgiLCJ0ZW1wbyIsInRlbXBvVW5pdCIsInVuZGVmaW5lZCIsInNlZ21lbnRUcmFja3MiLCJhZGQiLCJ0cmFjayIsInN5bmNUaW1lIiwibWV0cmljUG9zaXRpb24iLCJtZXRyaWNTcGVlZCIsInN0b3BBbGxUcmFja3MiLCJmbG9hdE1lYXN1cmVzIiwibnVtTWVhc3VyZXMiLCJjZWlsIiwibmV4dE1lYXN1cmVQb3NpdGlvbiIsIm5leHRNZWFzdXJlVGltZSIsImFicyIsInN0YXJ0TWVhc3VyZSIsImRlbGV0ZSIsImxvb3AiLCJBcnJheSIsImlzQXJyYXkiLCJmb3JFYWNoIiwiZWxlbSIsInJlbW92ZSIsIlRpbWVFbmdpbmUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7Ozs7O0FBRVosSUFBTUMsUUFBUUQsV0FBV0MsS0FBekI7QUFDQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQztBQUNBLElBQU1DLGlCQUFpQkgsV0FBV0MsS0FBWCxDQUFpQkcsWUFBakIsRUFBdkI7O0FBRUEsU0FBU0MsY0FBVCxDQUF3QkMsUUFBeEIsRUFBa0NDLFdBQWxDLEVBQStDQyxlQUEvQyxFQUFnRTtBQUM5RCxNQUFNQyxjQUFjRixZQUFZRSxXQUFoQztBQUNBLE1BQU1DLGlCQUFpQkQsY0FBY0EsWUFBWUUsUUFBMUIsR0FBcUMsQ0FBNUQ7QUFDQSxNQUFNQyxjQUFjTCxZQUFZSyxXQUFoQztBQUNBLE1BQU1DLFNBQVNOLFlBQVlNLE1BQVosSUFBc0IsQ0FBckM7QUFDQSxNQUFNQyxTQUFTUCxZQUFZTyxNQUFaLElBQXVCQyxLQUFLQyxLQUFMLENBQVlQLFlBQVlFLFFBQVosR0FBdUJILGVBQXhCLEdBQTJDLEdBQXRELENBQXRDOztBQUVBLE9BQUssSUFBSVMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJSixNQUFwQixFQUE0QkksR0FBNUIsRUFBaUM7QUFDL0IsUUFBSUMsT0FBTyxDQUFD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QVcsRUFBakI7O0FBRUEsVUFBSXNGLE1BQU1DLE9BQU4sQ0FBY0YsSUFBZCxDQUFKLEVBQ0VBLEtBQUtHLE9BQUwsQ0FBYSxVQUFDQyxJQUFEO0FBQUEsZUFBVTFGLGVBQWVDLFFBQWYsRUFBeUJ5RixJQUF6QixFQUErQixPQUFLdkYsZUFBcEMsQ0FBVjtBQUFBLE9BQWIsRUFERixLQUdFSCxlQUFlQyxRQUFmLEVBQXlCcUYsSUFBekIsRUFBK0IsS0FBS25GLGVBQXBDOztBQUVGLFVBQU1zRSxRQUFRLElBQUlqRCxZQUFKLENBQWlCdkIsUUFBakIsRUFBMkIsS0FBS3dCLGNBQWhDLENBQWQ7QUFDQSxXQUFLOEMsYUFBTCxDQUFtQkMsR0FBbkIsQ0FBdUJDLEtBQXZCOztBQUVBLGFBQU9BLEtBQVA7QUFDRDs7OzhCQUVTO0FBQ1IsV0FBS0ksYUFBTDtBQUNBLFdBQUtYLGVBQUwsQ0FBcUJ5QixNQUFyQixDQUE0QixJQUE1QjtBQUNEOzs7RUEvRXNCL0YsTUFBTWdHLFU7O2tCQWtGaEIzQixVIiwiZmlsZSI6Ikxvb3BQbGF5ZXIua2VlcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuXG5jb25zdCBhdWRpbyA9IHNvdW5kd29ya3MuYXVkaW87XG5jb25zdCBhdWRpb0NvbnRleHQgPSBzb3VuZHdvcmtzLmF1ZGlvQ29udGV4dDtcbmNvbnN0IGF1ZGlvU2NoZWR1bGVyID0gc291bmR3b3Jrcy5hdWRpby5nZXRTY2hlZHVsZXIoKTtcblxuZnVuY3Rpb24gYXBwZW5kU2VnbWVudHMoc2VnbWVudHMsIGxvb3BTZWdtZW50LCBtZWFzdXJlRHVyYXRpb24pIHtcbiAgY29uc3QgYXVkaW9CdWZmZXIgPSBsb29wU2VnbWVudC5hdWRpb0J1ZmZlcjtcbiAgY29uc3QgYnVmZmVyRHVyYXRpb24gPSBhdWRpb0J1ZmZlciA/IGF1ZGlvQnVmZmVyLmR1cmF0aW9uIDogMDtcbiAgY29uc3Qgc3RhcnRPZmZzZXQgPSBsb29wU2VnbWVudC5zdGFydE9mZnNldDtcbiAgY29uc3QgcmVwZWF0ID0gbG9vcFNlZ21lbnQucmVwZWF0IHx8IDE7XG4gIGNvbnN0IGxlbmd0aCA9IGxvb3BTZWdtZW50Lmxlbmd0aCB8fCDCoE1hdGguZmxvb3IoKGF1ZGlvQnVmZmVyLmR1cmF0aW9uIC8gbWVhc3VyZUR1cmF0aW9uKSArIDAuNSk7XG5cbiAgZm9yIChsZXQgbiA9IDA7IG4gPCByZXBlYXQ7IG4rKykge1xuICAgIGxldCBjb250ID0gISFsb29wU2VnbWVudC5jb250aW51ZTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IG9mZnNldCA9IHN0YXJ0T2Zmc2V0ICsgaSAqIG1lYXN1cmVEdXJhdGlvbjtcblxuICAgICAgaWYgKG9mZnNldCA8IGJ1ZmZlckR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IHNlZ21lbnQgPSBuZXcgU2VnbWVudChhdWRpb0J1ZmZlciwgb2Zmc2V0LCBJbmZpbml0eSwgMCwgY29udCk7XG4gICAgICAgIHNlZ21lbnRzLnB1c2goc2VnbWVudCk7XG4gICAgICB9XG5cbiAgICAgIGNvbnQgPSB0cnVlO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBTZWdtZW50IHtcbiAgY29uc3RydWN0b3IoYXVkaW9CdWZmZXIsIG9mZnNldEluQnVmZmVyID0gMCwgZHVyYXRpb25JbkJ1ZmZlciA9IEluZmluaXR5LCBvZmZzZXRJbk1lYXN1cmUgPSAwLCBjb250ID0gZmFsc2UpIHtcbiAgICB0aGlzLmF1ZGlvQnVmZmVyID0gYXVkaW9CdWZmZXI7XG4gICAgdGhpcy5vZmZzZXRJbkJ1ZmZlciA9IG9mZnNldEluQnVmZmVyO1xuICAgIHRoaXMuZHVyYXRpb25JbkJ1ZmZlciA9IGR1cmF0aW9uSW5CdWZmZXI7IC8vIDA6IGNvbnRpbnVlIHVudGlsbCBuZXh0IHNlZ21lbnQgc3RhcnRzXG4gICAgdGhpcy5vZmZzZXRJbk1lYXN1cmUgPSBvZmZzZXRJbk1lYXN1cmU7XG4gICAgdGhpcy5jb250aW51ZSA9IGNvbnQ7IC8vIHNlZ21lbnQgY29udGludWVzIHByZXZpb3VzIHNlZ21lbnRcbiAgfVxufVxuXG5jbGFzcyBTZWdtZW50VHJhY2sge1xuICBjb25zdHJ1Y3RvcihzZWdtZW50cywgdHJhbnNpdGlvblRpbWUgPSAwLjA1KSB7XG4gICAgdGhpcy5zcmMgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cbiAgICB0aGlzLnNlZ21lbnRzID0gc2VnbWVudHM7XG4gICAgdGhpcy50cmFuc2l0aW9uVGltZSA9IHRyYW5zaXRpb25UaW1lO1xuXG4gICAgdGhpcy5taW5DdXRvZmZGcmVxID0gNTtcbiAgICB0aGlzLm1heEN1dG9mZkZyZXEgPSBhdWRpb0NvbnRleHQuc2FtcGxlUmF0ZSAvIDI7XG4gICAgdGhpcy5sb2dDdXRvZmZSYXRpbyA9IE1hdGgubG9nKHRoaXMubWF4Q3V0b2ZmRnJlcSAvIHRoaXMubWluQ3V0b2ZmRnJlcSk7XG5cbiAgICBjb25zdCBjdXRvZmYgPSBhdWRpb0NvbnRleHQuY3JlYXRlQmlxdWFkRmlsdGVyKCk7XG4gICAgY3V0b2ZmLnR5cGUgPSAnbG93cGFzcyc7XG4gICAgY3V0b2ZmLmZyZXF1ZW5jeS52YWx1ZSA9IHRoaXMubWF4Q3V0b2ZmRnJlcTtcblxuICAgIHRoaXMub3V0cHV0ID0gY3V0b2ZmO1xuXG4gICAgdGhpcy5zcmMgPSBudWxsO1xuICAgIHRoaXMuZW52ID0gbnVsbDtcbiAgICB0aGlzLmN1dG9mZiA9IGN1dG9mZjtcbiAgICB0aGlzLmVuZFRpbWUgPSAwO1xuXG4gICAgdGhpcy5fYWN0aXZlID0gZmFsc2U7XG4gIH1cblxuICBnZXQgYWN0aXZlKCkge1xuICAgIHJldHVybiB0aGlzLl9hY3RpdmU7XG4gIH1cblxuICBzZXQgYWN0aXZlKGFjdGl2ZSkge1xuICAgIGlmICghYWN0aXZlKVxuICAgICAgdGhpcy5zdG9wU2VnbWVudCgpO1xuXG4gICAgdGhpcy5fYWN0aXZlID0gYWN0aXZlO1xuICB9XG5cbiAgY29ubmVjdChub2RlKSB7XG4gICAgdGhpcy5vdXRwdXQuY29ubmVjdChub2RlKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3Qobm9kZSkge1xuICAgIHRoaXMub3V0cHV0LmRpc2Nvbm5lY3Qobm9kZSk7XG4gIH1cblxuICBzdGFydFNlZ21lbnQoYXVkaW9UaW1lLCBhdWRpb0J1ZmZlciwgb2Zmc2V0SW5CdWZmZXIsIGR1cmF0aW9uSW5CdWZmZXIgPSBJbmZpbml0eSkge1xuICAgIGNvbnN0IGJ1ZmZlckR1cmF0aW9uID0gYXVkaW9CdWZmZXIuZHVyYXRpb247XG4gICAgbGV0IHRyYW5zaXRpb25UaW1lID0gdGhpcy50cmFuc2l0aW9uVGltZTtcblxuICAgIGlmIChhdWRpb1RpbWUgPCB0aGlzLmVuZFRpbWUgLSB0cmFuc2l0aW9uVGltZSkge1xuICAgICAgY29uc3Qgc3JjID0gdGhpcy5zcmM7XG4gICAgICBjb25zdCBlbmRUaW1lID0gTWF0aC5taW4oYXVkaW9UaW1lICsgdHJhbnNpdGlvblRpbWUsIHRoaXMuZW5kVGltZSk7XG5cbiAgICAgIGlmICh0cmFuc2l0aW9uVGltZSA+IDApIHtcbiAgICAgICAgY29uc3QgZW52ID0gdGhpcy5lbnY7XG4gICAgICAgIC8vIGVudi5nYWluLmNhbmNlbFNjaGVkdWxlZFZhbHVlcyhhdWRpb1RpbWUpO1xuICAgICAgICBlbnYuZ2Fpbi5zZXRWYWx1ZUF0VGltZSgxLCBhdWRpb1RpbWUpO1xuICAgICAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBlbmRUaW1lKTtcbiAgICAgIH1cblxuICAgICAgc3JjLnN0b3AoZW5kVGltZSk7XG4gICAgfVxuXG4gICAgaWYgKG9mZnNldEluQnVmZmVyIDwgYnVmZmVyRHVyYXRpb24pIHtcbiAgICAgIGxldCBkZWxheSA9IDA7XG5cbiAgICAgIGlmIChvZmZzZXRJbkJ1ZmZlciA8IHRyYW5zaXRpb25UaW1lKSB7XG4gICAgICAgIGRlbGF5ID0gdHJhbnNpdGlvblRpbWUgLSBvZmZzZXRJbkJ1ZmZlcjtcbiAgICAgICAgdHJhbnNpdGlvblRpbWUgPSBvZmZzZXRJbkJ1ZmZlcjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZW52ID0gYXVkaW9Db250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgIGVudi5jb25uZWN0KHRoaXMuY3V0b2ZmKTtcblxuICAgICAgaWYgKHRyYW5zaXRpb25UaW1lID4gMCkge1xuICAgICAgICBlbnYuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDAsIGF1ZGlvVGltZSArIGRlbGF5KTtcbiAgICAgICAgZW52LmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoMSwgYXVkaW9UaW1lICsgZGVsYXkgKyB0cmFuc2l0aW9uVGltZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHNyYyA9IGF1ZGlvQ29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHNyYy5jb25uZWN0KGVudik7XG4gICAgICBzcmMuYnVmZmVyID0gYXVkaW9CdWZmZXI7XG4gICAgICBzcmMuc3RhcnQoYXVkaW9UaW1lICsgZGVsYXksIG9mZnNldEluQnVmZmVyIC0gdHJhbnNpdGlvblRpbWUpO1xuXG4gICAgICBhdWRpb1RpbWUgKz0gdHJhbnNpdGlvblRpbWU7XG5cbiAgICAgIGR1cmF0aW9uSW5CdWZmZXIgPSBNYXRoLm1pbihkdXJhdGlvbkluQnVmZmVyLCBidWZmZXJEdXJhdGlvbiAtIG9mZnNldEluQnVmZmVyKTtcblxuICAgICAgY29uc3QgZW5kSW5CdWZmZXIgPSBvZmZzZXRJbkJ1ZmZlciArIGR1cmF0aW9uSW5CdWZmZXI7XG4gICAgICBsZXQgZW5kVGltZSA9IGF1ZGlvVGltZSArIGR1cmF0aW9uSW5CdWZmZXI7XG5cbiAgICAgIHRoaXMuc3JjID0gc3JjO1xuICAgICAgdGhpcy5lbnYgPSBlbnY7XG4gICAgICB0aGlzLmVuZFRpbWUgPSBlbmRUaW1lO1xuICAgIH1cbiAgfVxuXG4gIHN0b3BTZWdtZW50KGF1ZGlvVGltZSA9IGF1ZGlvQ29udGV4dC5jdXJyZW50VGltZSkge1xuICAgIGNvbnN0IHNyYyA9IHRoaXMuc3JjO1xuXG4gICAgaWYgKHNyYykge1xuICAgICAgY29uc3QgdHJhbnNpdGlvblRpbWUgPSB0aGlzLnRyYW5zaXRpb25UaW1lO1xuICAgICAgY29uc3QgZW52ID0gdGhpcy5lbnY7XG5cbiAgICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDEsIGF1ZGlvVGltZSk7XG4gICAgICBlbnYuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBhdWRpb1RpbWUgKyB0cmFuc2l0aW9uVGltZSk7XG5cbiAgICAgIHNyYy5zdG9wKGF1ZGlvVGltZSArIHRyYW5zaXRpb25UaW1lKTtcblxuICAgICAgdGhpcy5zcmMgPSBudWxsO1xuICAgICAgdGhpcy5lbnYgPSBudWxsO1xuICAgICAgdGhpcy5lbmRUaW1lID0gMDtcbiAgICB9XG4gIH1cblxuICBzdGFydE1lYXN1cmUoYXVkaW9UaW1lLCBtZWFzdXJlSW5kZXgsIGNhbkNvbnRpbnVlID0gZmFsc2UpIHtcbiAgICBpZiAodGhpcy5fYWN0aXZlKSB7XG4gICAgICBjb25zdCBtZWFzdXJlSW5kZXhJblBhdHRlcm4gPSBtZWFzdXJlSW5kZXggJSB0aGlzLnNlZ21lbnRzLmxlbmd0aDtcbiAgICAgIGNvbnN0IHNlZ21lbnQgPSB0aGlzLnNlZ21lbnRzW21lYXN1cmVJbmRleEluUGF0dGVybl07XG5cbiAgICAgIGlmIChzZWdtZW50ICYmICEoc2VnbWVudC5jb250aW51ZSAmJiBjYW5Db250aW51ZSkpIHtcbiAgICAgICAgY29uc3QgZGVsYXkgPSBzZWdtZW50Lm9mZnNldEluTWVhc3VyZSB8fCAwO1xuICAgICAgICB0aGlzLnN0YXJ0U2VnbWVudChhdWRpb1RpbWUgKyBkZWxheSwgc2VnbWVudC5hdWRpb0J1ZmZlciwgc2VnbWVudC5vZmZzZXRJbkJ1ZmZlciwgc2VnbWVudC5kdXJhdGlvbkluQnVmZmVyKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRDdXRvZmYodmFsdWUpIHtcbiAgICBjb25zdCBjdXRvZmZGcmVxID0gdGhpcy5taW5DdXRvZmZGcmVxICogTWF0aC5leHAodGhpcy5sb2dDdXRvZmZSYXRpbyAqIHZhbHVlKTtcbiAgICB0aGlzLmN1dG9mZi5mcmVxdWVuY3kudmFsdWUgPSBjdXRvZmZGcmVxO1xuICB9XG59XG5cbmNsYXNzIExvb3BQbGF5ZXIgZXh0ZW5kcyBhdWRpby5UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IobWV0cmljU2NoZWR1bGVyLCBtZWFzdXJlTGVuZ3RoID0gMSwgdGVtcG8gPSA2MCwgdGVtcG9Vbml0ID0gMSAvIDQsIHRyYW5zaXRpb25UaW1lID0gMC4wNSkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlciA9IG1ldHJpY1NjaGVkdWxlcjtcbiAgICB0aGlzLm1lYXN1cmVMZW5ndGggPSBtZWFzdXJlTGVuZ3RoO1xuICAgIHRoaXMudGVtcG8gPSB0ZW1wbztcbiAgICB0aGlzLnRlbXBvVW5pdCA9IHRlbXBvVW5pdDtcbiAgICB0aGlzLnRyYW5zaXRpb25UaW1lID0gdHJhbnNpdGlvblRpbWU7XG5cbiAgICB0aGlzLm1lYXN1cmVEdXJhdGlvbiA9IDYwIC8gKHRlbXBvICogdGVtcG9Vbml0KTtcbiAgICB0aGlzLm1lYXN1cmVJbmRleCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnNlZ21lbnRUcmFja3MgPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5hZGQodGhpcyk7XG4gIH1cblxuICBzdG9wQWxsVHJhY2tzKCkge1xuICAgIGZvciAobGV0IHRyYWNrIG9mIHRoaXMuc2VnbWVudFRyYWNrcylcbiAgICAgIHRyYWNrLnN0b3BTZWdtZW50KCk7XG4gIH1cblxuICBzeW5jU3BlZWQoc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCBtZXRyaWNTcGVlZCkge1xuICAgIGlmIChtZXRyaWNTcGVlZCA9PT0gMClcbiAgICAgIHRoaXMuc3RvcEFsbFRyYWNrcygpO1xuICB9XG5cbiAgc3luY1Bvc2l0aW9uKHN5bmNUaW1lLCBtZXRyaWNQb3NpdGlvbiwgbWV0cmljU3BlZWQpIHtcbiAgICBjb25zdCBhdWRpb1RpbWUgPSBhdWRpb1NjaGVkdWxlci5jdXJyZW50VGltZTtcbiAgICBjb25zdCBmbG9hdE1lYXN1cmVzID0gbWV0cmljUG9zaXRpb24gLyB0aGlzLm1lYXN1cmVMZW5ndGg7XG4gICAgY29uc3QgbnVtTWVhc3VyZXMgPSBNYXRoLmNlaWwoZmxvYXRNZWFzdXJlcyk7XG4gICAgY29uc3QgbmV4dE1lYXN1cmVQb3NpdGlvbiA9IG51bU1lYXN1cmVzICogdGhpcy5tZWFzdXJlTGVuZ3RoO1xuXG4gICAgdGhpcy5tZWFzdXJlSW5kZXggPSBudW1NZWFzdXJlcyAtIDE7XG4gICAgdGhpcy5uZXh0TWVhc3VyZVRpbWUgPSB1bmRlZmluZWQ7XG5cbiAgICByZXR1cm4gbmV4dE1lYXN1cmVQb3NpdGlvbjtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbihzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIG1ldHJpY1NwZWVkKSB7XG4gICAgY29uc3QgYXVkaW9UaW1lID0gYXVkaW9TY2hlZHVsZXIuY3VycmVudFRpbWU7XG5cbiAgICB0aGlzLm1lYXN1cmVJbmRleCsrO1xuXG4gICAgY29uc3QgY2FuQ29udGludWUgPSAhISh0aGlzLm5leHRNZWFzdXJlVGltZSAmJiBNYXRoLmFicyhhdWRpb1RpbWUgLSB0aGlzLm5leHRNZWFzdXJlVGltZSkgPCAwLjAxKTtcblxuICAgIGZvciAobGV0IHRyYWNrIG9mIHRoaXMuc2VnbWVudFRyYWNrcylcbiAgICAgIHRyYWNrLnN0YXJ0TWVhc3VyZShhdWRpb1RpbWUsIHRoaXMubWVhc3VyZUluZGV4LCBjYW5Db250aW51ZSk7XG5cbiAgICB0aGlzLm5leHRNZWFzdXJlVGltZSA9IGF1ZGlvVGltZSArIHRoaXMubWVhc3VyZUR1cmF0aW9uO1xuXG4gICAgcmV0dXJuIG1ldHJpY1Bvc2l0aW9uICsgdGhpcy5tZWFzdXJlTGVuZ3RoO1xuICB9XG5cbiAgLyoqIHVzZWQgPyAqL1xuICByZW1vdmVMb29wVHJhY2sodHJhY2spIHtcbiAgICBpZiAodHJhY2spIHtcbiAgICAgIHRyYWNrLnN0b3BTZWdtZW50KCk7XG4gICAgICB0aGlzLnNlZ21lbnRUcmFja3MuZGVsZXRlKHRyYWNrKTtcbiAgICB9XG4gIH1cblxuICBhZGRMb29wVHJhY2sobG9vcCkge1xuICAgIGNvbnN0IHNlZ21lbnRzID0gW107XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShsb29wKSlcbiAgICAgIGxvb3AuZm9yRWFjaCgoZWxlbSkgPT4gYXBwZW5kU2VnbWVudHMoc2VnbWVudHMsIGVsZW0sIHRoaXMubWVhc3VyZUR1cmF0aW9uKSk7XG4gICAgZWxzZVxuICAgICAgYXBwZW5kU2VnbWVudHMoc2VnbWVudHMsIGxvb3AsIHRoaXMubWVhc3VyZUR1cmF0aW9uKTtcblxuICAgIGNvbnN0IHRyYWNrID0gbmV3IFNlZ21lbnRUcmFjayhzZWdtZW50cywgdGhpcy50cmFuc2l0aW9uVGltZSk7XG4gICAgdGhpcy5zZWdtZW50VHJhY2tzLmFkZCh0cmFjayk7XG5cbiAgICByZXR1cm4gdHJhY2s7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuc3RvcEFsbFRyYWNrcygpO1xuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyLnJlbW92ZSh0aGlzKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMb29wUGxheWVyO1xuIl19