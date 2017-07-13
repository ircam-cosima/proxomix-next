'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var audio = soundworks.audio;
var audioContext = soundworks.audioContext;
var audioScheduler = soundworks.audio.getScheduler();

var RandomPlayer = function (_audio$TimeEngine) {
  (0, _inherits3.default)(RandomPlayer, _audio$TimeEngine);

  function RandomPlayer(metricScheduler, segments, options) {
    (0, _classCallCheck3.default)(this, RandomPlayer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (RandomPlayer.__proto__ || (0, _getPrototypeOf2.default)(RandomPlayer)).call(this));

    _this.metricScheduler = metricScheduler;

    _this.segments = segments;
    _this.segmentIndex = 0;

    _this.minFirstSilence = options.minFirstSilence !== undefined ? options.minFirstSilence : 1;
    _this.maxFirstSilence = options.maxFirstSilence !== undefined ? options.maxFirstSilence : 16;
    _this.minSilence = options.minSilence !== undefined ? options.minSilence : 1;
    _this.maxSilence = options.maxSilence !== undefined ? options.maxSilence : 16;
    _this.skipProbability = options.skipProbability !== undefined ? options.skipProbability : 0;

    _this.output = audioContext.createGain();

    _this.metricScheduler.add(_this);
    return _this;
  }

  (0, _createClass3.default)(RandomPlayer, [{
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
    key: 'syncPosition',
    value: function syncPosition(syncTime, metricPosition, metricSpeed) {
      var silenceLength = this.minFirstSilence + Math.random() * (this.maxFirstSilence - this.minFirstSilence);
      return metricPosition + silenceLength;
    }
  }, {
    key: 'advancePosition',
    value: function advancePosition(syncTime, metricPosition, metricSpeed) {
      var audioTime = audioScheduler.currentTime;
      var segmentIndex = this.segmentIndex;
      var segment = this.segments[this.segmentIndex];

      var src = audioContext.createBufferSource();
      src.connect(this.output);
      src.buffer = segment.audioBuffer;
      src.start(audioTime);

      var indexIncrement = Math.random() > this.skipProbability ? 1 : 2;
      this.segmentIndex = (segmentIndex + indexIncrement) % this.segments.length;

      var silenceLength = this.minSilence + Math.random() * (this.maxSilence - this.minSilence);
      return metricPosition + segment.length + silenceLength;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.metricScheduler.remove(this);
    }
  }]);
  return RandomPlayer;
}(audio.TimeEngine);

exports.default = RandomPlayer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlJhbmRvbVBsYXllci5qcyJdLCJuYW1lcyI6WyJzb3VuZHdvcmtzIiwiYXVkaW8iLCJhdWRpb0NvbnRleHQiLCJhdWRpb1NjaGVkdWxlciIsImdldFNjaGVkdWxlciIsIlJhbmRvbVBsYXllciIsIm1ldHJpY1NjaGVkdWxlciIsInNlZ21lbnRzIiwib3B0aW9ucyIsInNlZ21lbnRJbmRleCIsIm1pbkZpcnN0U2lsZW5jZSIsInVuZGVmaW5lZCIsIm1heEZpcnN0U2lsZW5jZSIsIm1pblNpbGVuY2UiLCJtYXhTaWxlbmNlIiwic2tpcFByb2JhYmlsaXR5Iiwib3V0cHV0IiwiY3JlYXRlR2FpbiIsImFkZCIsIm5vZGUiLCJjb25uZWN0IiwiZGlzY29ubmVjdCIsInN5bmNUaW1lIiwibWV0cmljUG9zaXRpb24iLCJtZXRyaWNTcGVlZCIsInNpbGVuY2VMZW5ndGgiLCJNYXRoIiwicmFuZG9tIiwiYXVkaW9UaW1lIiwiY3VycmVudFRpbWUiLCJzZWdtZW50Iiwic3JjIiwiY3JlYXRlQnVmZmVyU291cmNlIiwiYnVmZmVyIiwiYXVkaW9CdWZmZXIiLCJzdGFydCIsImluZGV4SW5jcmVtZW50IiwibGVuZ3RoIiwicmVtb3ZlIiwiVGltZUVuZ2luZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7Ozs7O0FBRVosSUFBTUMsUUFBUUQsV0FBV0MsS0FBekI7QUFDQSxJQUFNQyxlQUFlRixXQUFXRSxZQUFoQztBQUNBLElBQU1DLGlCQUFpQkgsV0FBV0MsS0FBWCxDQUFpQkcsWUFBakIsRUFBdkI7O0lBRU1DLFk7OztBQUNKLHdCQUFZQyxlQUFaLEVBQTZCQyxRQUE3QixFQUF1Q0MsT0FBdkMsRUFBZ0Q7QUFBQTs7QUFBQTs7QUFHOUMsVUFBS0YsZUFBTCxHQUF1QkEsZUFBdkI7O0FBRUEsVUFBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxVQUFLRSxZQUFMLEdBQW9CLENBQXBCOztBQUVBLFVBQUtDLGVBQUwsR0FBd0JGLFFBQVFFLGVBQVIsS0FBNEJDLFNBQTdCLEdBQTBDSCxRQUFRRSxlQUFsRCxHQUFvRSxDQUEzRjtBQUNBLFVBQUtFLGVBQUwsR0FBd0JKLFFBQVFJLGVBQVIsS0FBNEJELFNBQTdCLEdBQTBDSCxRQUFRSSxlQUFsRCxHQUFvRSxFQUEzRjtBQUNBLFVBQUtDLFVBQUwsR0FBbUJMLFFBQVFLLFVBQVIsS0FBdUJGLFNBQXhCLEdBQXFDSCxRQUFRSyxVQUE3QyxHQUEwRCxDQUE1RTtBQUNBLFVBQUtDLFVBQUwsR0FBbUJOLFFBQVFNLFVBQVIsS0FBdUJILFNBQXhCLEdBQXFDSCxRQUFRTSxVQUE3QyxHQUEwRCxFQUE1RTtBQUNBLFVBQUtDLGVBQUwsR0FBd0JQLFFBQVFPLGVBQVIsS0FBNEJKLFNBQTdCLEdBQTBDSCxRQUFRTyxlQUFsRCxHQUFvRSxDQUEzRjs7QUFFQSxVQUFLQyxNQUFMLEdBQWNkLGFBQWFlLFVBQWIsRUFBZDs7QUFFQSxVQUFLWCxlQUFMLENBQXFCWSxHQUFyQjtBQWhCOEM7QUFpQi9DOzs7OzRCQUVPQyxJLEVBQU07QUFDWixXQUFLSCxNQUFMLENBQVlJLE9BQVosQ0FBb0JELElBQXBCO0FBQ0Q7OzsrQkFFVUEsSSxFQUFNO0FBQ2YsV0FBS0gsTUFBTCxDQUFZSyxVQUFaLENBQXVCRixJQUF2QjtBQUNEOzs7aUNBRVlHLFEsRUFBVUMsYyxFQUFnQkMsVyxFQUFhO0FBQ2xELFVBQU1DLGdCQUFnQixLQUFLZixlQUFMLEdBQXVCZ0IsS0FBS0MsTUFBTCxNQUFpQixLQUFLZixlQUFMLEdBQXVCLEtBQUtGLGVBQTdDLENBQTdDO0FBQ0EsYUFBT2EsaUJBQWlCRSxhQUF4QjtBQUNEOzs7b0NBRWVILFEsRUFBVUMsYyxFQUFnQkMsVyxFQUFhO0FBQ3JELFVBQU1JLFlBQVl6QixlQUFlMEIsV0FBakM7QUFDQSxVQUFNcEIsZUFBZSxLQUFLQSxZQUExQjtBQUNBLFVBQU1xQixVQUFVLEtBQUt2QixRQUFMLENBQWMsS0FBS0UsWUFBbkIsQ0FBaEI7O0FBRUEsVUFBTXNCLE1BQU03QixhQUFhOEIsa0JBQWIsRUFBWjtBQUNBRCxVQUFJWCxPQUFKLENBQVksS0FBS0osTUFBakI7QUFDQWUsVUFBSUUsTUFBSixHQUFhSCxRQUFRSSxXQUFyQjtBQUNBSCxVQUFJSSxLQUFKLENBQVVQLFNBQVY7O0FBRUEsVUFBTVEsaUJBQWtCVixLQUFLQyxNQUFMLEtBQWdCLEtBQUtaLGVBQXRCLEdBQXlDLENBQXpDLEdBQTZDLENBQXBFO0FBQ0EsV0FBS04sWUFBTCxHQUFvQixDQUFDQSxlQUFlMkIsY0FBaEIsSUFBa0MsS0FBSzdCLFFBQUwsQ0FBYzhCLE1BQXBFOztBQUVBLFVBQU1aLGdCQUFnQixLQUFLWixVQUFMLEdBQWtCYSxLQUFLQyxNQUFMLE1BQWlCLEtBQUtiLFVBQUwsR0FBa0IsS0FBS0QsVUFBeEMsQ0FBeEM7QUFDQSxhQUFPVSxpQkFBaUJPLFFBQVFPLE1BQXpCLEdBQWtDWixhQUF6QztBQUNEOzs7OEJBRVM7QUFDUixXQUFLbkIsZUFBTCxDQUFxQmdDLE1BQXJCLENBQTRCLElBQTVCO0FBQ0Q7OztFQXBEd0JyQyxNQUFNc0MsVTs7a0JBdURsQmxDLFkiLCJmaWxlIjoiUmFuZG9tUGxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbmNvbnN0IGF1ZGlvID0gc291bmR3b3Jrcy5hdWRpbztcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuY29uc3QgYXVkaW9TY2hlZHVsZXIgPSBzb3VuZHdvcmtzLmF1ZGlvLmdldFNjaGVkdWxlcigpO1xuXG5jbGFzcyBSYW5kb21QbGF5ZXIgZXh0ZW5kcyBhdWRpby5UaW1lRW5naW5lIHtcbiAgY29uc3RydWN0b3IobWV0cmljU2NoZWR1bGVyLCBzZWdtZW50cywgb3B0aW9ucykge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlciA9IG1ldHJpY1NjaGVkdWxlcjtcblxuICAgIHRoaXMuc2VnbWVudHMgPSBzZWdtZW50cztcbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IDA7XG5cbiAgICB0aGlzLm1pbkZpcnN0U2lsZW5jZSA9IChvcHRpb25zLm1pbkZpcnN0U2lsZW5jZSAhPT0gdW5kZWZpbmVkKSA/IG9wdGlvbnMubWluRmlyc3RTaWxlbmNlIDogMTtcbiAgICB0aGlzLm1heEZpcnN0U2lsZW5jZSA9IChvcHRpb25zLm1heEZpcnN0U2lsZW5jZSAhPT0gdW5kZWZpbmVkKSA/IG9wdGlvbnMubWF4Rmlyc3RTaWxlbmNlIDogMTY7XG4gICAgdGhpcy5taW5TaWxlbmNlID0gKG9wdGlvbnMubWluU2lsZW5jZSAhPT0gdW5kZWZpbmVkKSA/IG9wdGlvbnMubWluU2lsZW5jZSA6IDE7XG4gICAgdGhpcy5tYXhTaWxlbmNlID0gKG9wdGlvbnMubWF4U2lsZW5jZSAhPT0gdW5kZWZpbmVkKSA/IG9wdGlvbnMubWF4U2lsZW5jZSA6IDE2O1xuICAgIHRoaXMuc2tpcFByb2JhYmlsaXR5ID0gKG9wdGlvbnMuc2tpcFByb2JhYmlsaXR5ICE9PSB1bmRlZmluZWQpID8gb3B0aW9ucy5za2lwUHJvYmFiaWxpdHkgOiAwO1xuXG4gICAgdGhpcy5vdXRwdXQgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuXG4gICAgdGhpcy5tZXRyaWNTY2hlZHVsZXIuYWRkKHRoaXMpO1xuICB9XG5cbiAgY29ubmVjdChub2RlKSB7XG4gICAgdGhpcy5vdXRwdXQuY29ubmVjdChub2RlKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3Qobm9kZSkge1xuICAgIHRoaXMub3V0cHV0LmRpc2Nvbm5lY3Qobm9kZSk7XG4gIH1cblxuICBzeW5jUG9zaXRpb24oc3luY1RpbWUsIG1ldHJpY1Bvc2l0aW9uLCBtZXRyaWNTcGVlZCkge1xuICAgIGNvbnN0IHNpbGVuY2VMZW5ndGggPSB0aGlzLm1pbkZpcnN0U2lsZW5jZSArIE1hdGgucmFuZG9tKCkgKiAodGhpcy5tYXhGaXJzdFNpbGVuY2UgLSB0aGlzLm1pbkZpcnN0U2lsZW5jZSk7XG4gICAgcmV0dXJuIG1ldHJpY1Bvc2l0aW9uICsgc2lsZW5jZUxlbmd0aDtcbiAgfVxuXG4gIGFkdmFuY2VQb3NpdGlvbihzeW5jVGltZSwgbWV0cmljUG9zaXRpb24sIG1ldHJpY1NwZWVkKSB7XG4gICAgY29uc3QgYXVkaW9UaW1lID0gYXVkaW9TY2hlZHVsZXIuY3VycmVudFRpbWU7XG4gICAgY29uc3Qgc2VnbWVudEluZGV4ID0gdGhpcy5zZWdtZW50SW5kZXg7XG4gICAgY29uc3Qgc2VnbWVudCA9IHRoaXMuc2VnbWVudHNbdGhpcy5zZWdtZW50SW5kZXhdO1xuXG4gICAgY29uc3Qgc3JjID0gYXVkaW9Db250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgIHNyYy5jb25uZWN0KHRoaXMub3V0cHV0KTtcbiAgICBzcmMuYnVmZmVyID0gc2VnbWVudC5hdWRpb0J1ZmZlcjtcbiAgICBzcmMuc3RhcnQoYXVkaW9UaW1lKTtcblxuICAgIGNvbnN0IGluZGV4SW5jcmVtZW50ID0gKE1hdGgucmFuZG9tKCkgPiB0aGlzLnNraXBQcm9iYWJpbGl0eSkgPyAxIDogMjtcbiAgICB0aGlzLnNlZ21lbnRJbmRleCA9IChzZWdtZW50SW5kZXggKyBpbmRleEluY3JlbWVudCkgJSB0aGlzLnNlZ21lbnRzLmxlbmd0aDtcblxuICAgIGNvbnN0IHNpbGVuY2VMZW5ndGggPSB0aGlzLm1pblNpbGVuY2UgKyBNYXRoLnJhbmRvbSgpICogKHRoaXMubWF4U2lsZW5jZSAtIHRoaXMubWluU2lsZW5jZSk7XG4gICAgcmV0dXJuIG1ldHJpY1Bvc2l0aW9uICsgc2VnbWVudC5sZW5ndGggKyBzaWxlbmNlTGVuZ3RoO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLm1ldHJpY1NjaGVkdWxlci5yZW1vdmUodGhpcyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUmFuZG9tUGxheWVyO1xuIl19