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

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _math = require('soundworks/utils/math');

var _Beacon = require('../../shared/services/client/Beacon');

var _Beacon2 = _interopRequireDefault(_Beacon);

var _Mixer = require('./Mixer');

var _Mixer2 = _interopRequireDefault(_Mixer);

var _LoopPlayer = require('./LoopPlayer');

var _LoopPlayer2 = _interopRequireDefault(_LoopPlayer);

var _instrumentFactory = require('./instrumentFactory');

var _instrumentFactory2 = _interopRequireDefault(_instrumentFactory);

var _setup = require('../../shared/setup');

var _setup2 = _interopRequireDefault(_setup);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var client = soundworks.client;
var audio = soundworks.audio;
var audioContext = soundworks.audioContext;
var audioScheduler = soundworks.audio.getScheduler();

audioScheduler.lookahead = 0.1;
audioScheduler.period = 0.05;

var instrumentList = (0, _keys2.default)(_setup2.default.instruments);
var numInstruments = instrumentList.length;

var tempo = 121;
var beatDuration = 60 / tempo;
var measureDuration = 4 * beatDuration;

var PlayerExperience = function (_soundworks$Experienc) {
  (0, _inherits3.default)(PlayerExperience, _soundworks$Experienc);

  function PlayerExperience(assetsDomain, beaconUUID) {
    (0, _classCallCheck3.default)(this, PlayerExperience);

    var _this = (0, _possibleConstructorReturn3.default)(this, (PlayerExperience.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience)).call(this));

    _this.platform = _this.require('platform', { features: ['web-audio'] });
    _this.metricScheduler = _this.require('metric-scheduler');

    _this.audioBufferManager = _this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain + 'sounds/',
      files: _setup2.default
    });

    _this.motionInput = _this.require('motion-input', {
      descriptors: ['accelerationIncludingGravity']
    });

    var beaconConfig = {
      uuid: beaconUUID,
      txPower: -55, // in dB (see beacon service for detail)
      major: 0,
      skipService: false,
      debug: false
    };

    beaconConfig.emulate = !!window.cordova ? null : { numPeers: 0 };
    _this.beacon = _this.require('beacon', beaconConfig);

    _this.playerId = null;
    _this.intrumentConfig = null;
    _this.playerIds = null;

    _this.instruments = [];
    _this.localInstrumentEnv = null;
    _this.remoteInstrumentEnv = null;

    _this.onBeaconRanging = _this.onBeaconRanging.bind(_this);
    _this.onInstrumentControl = _this.onInstrumentControl.bind(_this);
    _this.onPlayerEntered = _this.onPlayerEntered.bind(_this);
    _this.onPlayerExit = _this.onPlayerExit.bind(_this);
    _this.runApplication = _this.runApplication.bind(_this);
    _this.refuseApplication = _this.refuseApplication.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(PlayerExperience, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'start', this).call(this);

      var viewModel = {
        sorry: false
      };

      this.view = new soundworks.View('');

      this.show().then(function () {
        if (client.urlParams !== null) {
          var intrumentName = client.urlParams.join('-');
          var index = instrumentList.indexOf(intrumentName);

          if (index !== -1) _this2.playerId = index;
        }

        _this2.send('player:enter', _this2.playerId);
        _this2.receive('player:ack', _this2.runApplication);
        _this2.receive('player:refused', _this2.refuseApplication);
      });
    }
  }, {
    key: 'getInstrument',
    value: function getInstrument(index) {
      var instrument = this.instruments[index];

      if (!instrument) {
        var audioSetup = this.audioBufferManager.data;
        var instrumentId = instrumentList[index];
        var instrumentDescr = audioSetup.instruments[instrumentId];
        var instrumentEnv = index === this.playerId ? this.localInstrumentEnv : this.remoteInstrumentEnv;
        this.instruments[index] = instrument = _instrumentFactory2.default.createInstrument(instrumentEnv, instrumentDescr.type, instrumentDescr);
      }

      return instrument;
    }
  }, {
    key: 'refuseApplication',
    value: function refuseApplication() {
      console.log('Sorry, no place :-(');
    }
  }, {
    key: 'runApplication',
    value: function runApplication(playerId, playerIds) {
      var audioSetup = this.audioBufferManager.data;
      var commonConfig = audioSetup.common;

      this.playerId = playerId;
      this.playerIds = new _set2.default(playerIds);

      if (this.playerId >= instrumentList.length) throw new Error('Invalid (out of range) playerId - something doesn\'t work properly');

      var loopPlayer = new _LoopPlayer2.default(this.metricScheduler, commonConfig.measureLength, commonConfig.tempo, commonConfig.tempoUnit, 0.05);

      this.localInstrumentEnv = {
        screenContainer: this.view.$el,
        motionInput: this.motionInput,
        sendControl: this.sendIntrumentControl(this.playerId),
        metricScheduler: this.metricScheduler,
        loopPlayer: loopPlayer
      };

      this.remoteInstrumentEnv = {
        screenContainer: null,
        motionInput: null,
        sendControl: null,
        metricScheduler: this.metricScheduler,
        loopPlayer: loopPlayer
      };

      // init audio
      this.mixer = new _Mixer2.default(this.metricScheduler);
      this.mixer.connect(audioContext.destination);

      // create instruments
      var playerInstrumentId = instrumentList[this.playerId];

      // loop track test
      for (var index = 0; index < numInstruments; index++) {
        var instrument = this.getInstrument(index);

        // add instrement to mixer
        this.mixer.createChannel(index, instrument);

        var debug = false;

        // init view if local instrument
        if (index === this.playerId) {
          instrument.visible = true;
          instrument.active = true;
          this.mixer.setGain(index, 1);
        } else if (debug) {
          instrument.active = true;
          this.mixer.setGain(index, 0.5);
        }
      }

      this.receive('instrument:control', this.onInstrumentControl);
      this.receive('player:entered', this.onPlayerEntered);
      this.receive('player:exit', this.onPlayerExit);

      this.beacon.minor = this.playerId;
      this.beacon.addListener(this.onBeaconRanging);
      this.beacon.startAdvertising();
      this.beacon.startRanging();
    }
  }, {
    key: 'sendIntrumentControl',
    value: function sendIntrumentControl(playerId) {
      var _this3 = this;

      return function (name, value) {
        return _this3.send('instrument:control', playerId, name, value);
      };
    }
  }, {
    key: 'onInstrumentControl',
    value: function onInstrumentControl(playerId, name, value) {
      var instrument = this.instruments[playerId];

      if (instrument) instrument.setControl(name, value);
    }
  }, {
    key: 'onPlayerEntered',
    value: function onPlayerEntered(playerId) {
      this.playerIds.add(playerId);
    }
  }, {
    key: 'onPlayerExit',
    value: function onPlayerExit(playerId) {
      // reset mixer and stop track
      this.mixer.setAutomation(playerId, 0, 0.05);

      var instrument = this.instruments[playerId];
      if (instrument) instrument.active = false;

      this.playerIds.delete(playerId);
    }

    /**
     * @warning - a peer who kill its app still send beacon informations for
     * around 10 seconds. That's why we must keep a booking of the connected
     * clientts according to the server informations.
     */

  }, {
    key: 'onBeaconRanging',
    value: function onBeaconRanging(pluginResults) {
      var _this4 = this;

      var offThreshold = -60;

      pluginResults.beacons.forEach(function (beacon, index) {
        if (beacon.minor === _this4.playerId) throw new Error('Invalid peer beacon minor, is equal to this.playerId');

        var playerId = beacon.minor;

        // prevent exited players to trigger automation and activation
        if (_this4.playerIds.has(playerId)) {
          var instrumentId = instrumentList[playerId];
          var instrument = _setup2.default.instruments[instrumentId];
          var estimatedDistance = _this4.beacon.rssiToDist(beacon.rssi);
          var constRadius = instrument.constRadius !== undefined ? instrument.constRadius : 1;
          var offRadius = instrument.offRadius !== undefined ? instrument.offRadius : 3;
          var gain = 0;

          if (estimatedDistance < offRadius) {
            gain = 1;

            if (estimatedDistance > constRadius) {
              var level = offThreshold * (estimatedDistance - constRadius) / (offRadius - constRadius);
              gain = (0, _math.decibelToLinear)(level);
            }
          }

          _this4.mixer.setAutomation(playerId, gain, 0.5);
        }
      });
    }
  }]);
  return PlayerExperience;
}(soundworks.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsImNsaWVudCIsImF1ZGlvIiwiYXVkaW9Db250ZXh0IiwiYXVkaW9TY2hlZHVsZXIiLCJnZXRTY2hlZHVsZXIiLCJsb29rYWhlYWQiLCJwZXJpb2QiLCJpbnN0cnVtZW50TGlzdCIsImluc3RydW1lbnRzIiwibnVtSW5zdHJ1bWVudHMiLCJsZW5ndGgiLCJ0ZW1wbyIsImJlYXREdXJhdGlvbiIsIm1lYXN1cmVEdXJhdGlvbiIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJiZWFjb25VVUlEIiwicGxhdGZvcm0iLCJyZXF1aXJlIiwiZmVhdHVyZXMiLCJtZXRyaWNTY2hlZHVsZXIiLCJhdWRpb0J1ZmZlck1hbmFnZXIiLCJmaWxlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJiZWFjb25Db25maWciLCJ1dWlkIiwidHhQb3dlciIsIm1ham9yIiwic2tpcFNlcnZpY2UiLCJkZWJ1ZyIsImVtdWxhdGUiLCJ3aW5kb3ciLCJjb3Jkb3ZhIiwibnVtUGVlcnMiLCJiZWFjb24iLCJwbGF5ZXJJZCIsImludHJ1bWVudENvbmZpZyIsInBsYXllcklkcyIsImxvY2FsSW5zdHJ1bWVudEVudiIsInJlbW90ZUluc3RydW1lbnRFbnYiLCJvbkJlYWNvblJhbmdpbmciLCJiaW5kIiwib25JbnN0cnVtZW50Q29udHJvbCIsIm9uUGxheWVyRW50ZXJlZCIsIm9uUGxheWVyRXhpdCIsInJ1bkFwcGxpY2F0aW9uIiwicmVmdXNlQXBwbGljYXRpb24iLCJ2aWV3TW9kZWwiLCJzb3JyeSIsInZpZXciLCJWaWV3Iiwic2hvdyIsInRoZW4iLCJ1cmxQYXJhbXMiLCJpbnRydW1lbnROYW1lIiwiam9pbiIsImluZGV4IiwiaW5kZXhPZiIsInNlbmQiLCJyZWNlaXZlIiwiaW5zdHJ1bWVudCIsImF1ZGlvU2V0dXAiLCJkYXRhIiwiaW5zdHJ1bWVudElkIiwiaW5zdHJ1bWVudERlc2NyIiwiaW5zdHJ1bWVudEVudiIsImNyZWF0ZUluc3RydW1lbnQiLCJ0eXBlIiwiY29uc29sZSIsImxvZyIsImNvbW1vbkNvbmZpZyIsImNvbW1vbiIsIkVycm9yIiwibG9vcFBsYXllciIsIm1lYXN1cmVMZW5ndGgiLCJ0ZW1wb1VuaXQiLCJzY3JlZW5Db250YWluZXIiLCIkZWwiLCJzZW5kQ29udHJvbCIsInNlbmRJbnRydW1lbnRDb250cm9sIiwibWl4ZXIiLCJjb25uZWN0IiwiZGVzdGluYXRpb24iLCJwbGF5ZXJJbnN0cnVtZW50SWQiLCJnZXRJbnN0cnVtZW50IiwiY3JlYXRlQ2hhbm5lbCIsInZpc2libGUiLCJhY3RpdmUiLCJzZXRHYWluIiwibWlub3IiLCJhZGRMaXN0ZW5lciIsInN0YXJ0QWR2ZXJ0aXNpbmciLCJzdGFydFJhbmdpbmciLCJuYW1lIiwidmFsdWUiLCJzZXRDb250cm9sIiwiYWRkIiwic2V0QXV0b21hdGlvbiIsImRlbGV0ZSIsInBsdWdpblJlc3VsdHMiLCJvZmZUaHJlc2hvbGQiLCJiZWFjb25zIiwiZm9yRWFjaCIsImhhcyIsImVzdGltYXRlZERpc3RhbmNlIiwicnNzaVRvRGlzdCIsInJzc2kiLCJjb25zdFJhZGl1cyIsInVuZGVmaW5lZCIsIm9mZlJhZGl1cyIsImdhaW4iLCJsZXZlbCIsIkV4cGVyaWVuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0lBQVlBLFU7O0FBQ1o7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQyxTQUFTRCxXQUFXQyxNQUExQjtBQUNBLElBQU1DLFFBQVFGLFdBQVdFLEtBQXpCO0FBQ0EsSUFBTUMsZUFBZUgsV0FBV0csWUFBaEM7QUFDQSxJQUFNQyxpQkFBaUJKLFdBQVdFLEtBQVgsQ0FBaUJHLFlBQWpCLEVBQXZCOztBQUVBRCxlQUFlRSxTQUFmLEdBQTJCLEdBQTNCO0FBQ0FGLGVBQWVHLE1BQWYsR0FBd0IsSUFBeEI7O0FB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QUFXaUIsYUFBWCxDQUF5QjlELFFBQXpCLEVBQW1DMkUsSUFBbkMsRUFBeUMsR0FBekM7QUFDRDtBQUNGLE9BMUJEO0FBMkJEOzs7RUFuTjRCaEgsV0FBV2tILFU7O2tCQXNOM0JuRyxnQiIsImZpbGUiOiJQbGF5ZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgeyBkZWNpYmVsVG9MaW5lYXIgfSBmcm9tICdzb3VuZHdvcmtzL3V0aWxzL21hdGgnO1xuaW1wb3J0IEJlYWNvbiBmcm9tICcuLi8uLi9zaGFyZWQvc2VydmljZXMvY2xpZW50L0JlYWNvbic7XG5pbXBvcnQgTWl4ZXIgZnJvbSAnLi9NaXhlcic7XG5pbXBvcnQgTG9vcFBsYXllciBmcm9tICcuL0xvb3BQbGF5ZXInO1xuaW1wb3J0IGluc3RydW1lbnRGYWN0b3J5IGZyb20gJy4vaW5zdHJ1bWVudEZhY3RvcnknO1xuaW1wb3J0IHNldHVwIGZyb20gJy4uLy4uL3NoYXJlZC9zZXR1cCc7XG5cbmNvbnN0IGNsaWVudCA9IHNvdW5kd29ya3MuY2xpZW50O1xuY29uc3QgYXVkaW8gPSBzb3VuZHdvcmtzLmF1ZGlvO1xuY29uc3QgYXVkaW9Db250ZXh0ID0gc291bmR3b3Jrcy5hdWRpb0NvbnRleHQ7XG5jb25zdCBhdWRpb1NjaGVkdWxlciA9IHNvdW5kd29ya3MuYXVkaW8uZ2V0U2NoZWR1bGVyKCk7XG5cbmF1ZGlvU2NoZWR1bGVyLmxvb2thaGVhZCA9IDAuMTtcbmF1ZGlvU2NoZWR1bGVyLnBlcmlvZCA9IDAuMDU7XG5cbmNvbnN0IGluc3RydW1lbnRMaXN0ID0gT2JqZWN0LmtleXMoc2V0dXAuaW5zdHJ1bWVudHMpO1xuY29uc3QgbnVtSW5zdHJ1bWVudHMgPSBpbnN0cnVtZW50TGlzdC5sZW5ndGg7XG5cbmNvbnN0IHRlbXBvID0gMTIxO1xuY29uc3QgYmVhdER1cmF0aW9uID0gNjAgLyB0ZW1wbztcbmNvbnN0IG1lYXN1cmVEdXJhdGlvbiA9IDQgKiBiZWF0RHVyYXRpb247XG5cbmNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4sIGJlYWNvblVVSUQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbyddIH0pO1xuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyID0gdGhpcy5yZXF1aXJlKCdtZXRyaWMtc2NoZWR1bGVyJyk7XG5cbiAgICB0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlciA9IHRoaXMucmVxdWlyZSgnYXVkaW8tYnVmZmVyLW1hbmFnZXInLCB7XG4gICAgICBhc3NldHNEb21haW46IGFzc2V0c0RvbWFpbiArICdzb3VuZHMvJyxcbiAgICAgIGZpbGVzOiBzZXR1cFxuICAgIH0pO1xuXG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IHRoaXMucmVxdWlyZSgnbW90aW9uLWlucHV0Jywge1xuICAgICAgZGVzY3JpcHRvcnM6IFsnYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSddLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYmVhY29uQ29uZmlnID0ge1xuICAgICAgdXVpZDogYmVhY29uVVVJRCxcbiAgICAgIHR4UG93ZXI6IC01NSwgLy8gaW4gZEIgKHNlZSBiZWFjb24gc2VydmljZSBmb3IgZGV0YWlsKVxuICAgICAgbWFqb3I6IDAsXG4gICAgICBza2lwU2VydmljZTogZmFsc2UsXG4gICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgfTtcblxuICAgIGJlYWNvbkNvbmZpZy5lbXVsYXRlID0gKCEhd2luZG93LmNvcmRvdmEpID8gbnVsbCA6IHsgbnVtUGVlcnM6IDAgfTtcbiAgICB0aGlzLmJlYWNvbiA9IHRoaXMucmVxdWlyZSgnYmVhY29uJywgYmVhY29uQ29uZmlnKTtcblxuICAgIHRoaXMucGxheWVySWQgPSBudWxsO1xuICAgIHRoaXMuaW50cnVtZW50Q29uZmlnID0gbnVsbDtcbiAgICB0aGlzLnBsYXllcklkcyA9IG51bGw7XG5cbiAgICB0aGlzLmluc3RydW1lbnRzID0gW107XG4gICAgdGhpcy5sb2NhbEluc3RydW1lbnRFbnYgPSBudWxsO1xuICAgIHRoaXMucmVtb3RlSW5zdHJ1bWVudEVudiA9IG51bGw7XG5cbiAgICB0aGlzLm9uQmVhY29uUmFuZ2luZyA9IHRoaXMub25CZWFjb25SYW5naW5nLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbkluc3RydW1lbnRDb250cm9sID0gdGhpcy5vbkluc3RydW1lbnRDb250cm9sLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vblBsYXllckVudGVyZWQgPSB0aGlzLm9uUGxheWVyRW50ZXJlZC5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25QbGF5ZXJFeGl0ID0gdGhpcy5vblBsYXllckV4aXQuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJ1bkFwcGxpY2F0aW9uID0gdGhpcy5ydW5BcHBsaWNhdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVmdXNlQXBwbGljYXRpb24gPSB0aGlzLnJlZnVzZUFwcGxpY2F0aW9uLmJpbmQodGhpcyk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgY29uc3Qgdmlld01vZGVsID0ge1xuICAgICAgc29ycnk6IGZhbHNlLFxuICAgIH07XG5cbiAgICB0aGlzLnZpZXcgPSBuZXcgc291bmR3b3Jrcy5WaWV3KCcnKTtcblxuICAgIHRoaXMuc2hvdygpLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKGNsaWVudC51cmxQYXJhbXMgIT09IG51bGwpIHtcbiAgICAgICAgY29uc3QgaW50cnVtZW50TmFtZSA9IGNsaWVudC51cmxQYXJhbXMuam9pbignLScpO1xuICAgICAgICBjb25zdCBpbmRleCA9IGluc3RydW1lbnRMaXN0LmluZGV4T2YoaW50cnVtZW50TmFtZSk7XG5cbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICB0aGlzLnBsYXllcklkID0gaW5kZXg7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2VuZCgncGxheWVyOmVudGVyJywgdGhpcy5wbGF5ZXJJZCk7XG4gICAgICB0aGlzLnJlY2VpdmUoJ3BsYXllcjphY2snLCB0aGlzLnJ1bkFwcGxpY2F0aW9uKTtcbiAgICAgIHRoaXMucmVjZWl2ZSgncGxheWVyOnJlZnVzZWQnLCB0aGlzLnJlZnVzZUFwcGxpY2F0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIGdldEluc3RydW1lbnQoaW5kZXgpIHtcbiAgICBsZXQgaW5zdHJ1bWVudCA9IHRoaXMuaW5zdHJ1bWVudHNbaW5kZXhdO1xuXG4gICAgaWYgKCFpbnN0cnVtZW50KSB7XG4gICAgICBjb25zdCBhdWRpb1NldHVwID0gdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIuZGF0YTtcbiAgICAgIGNvbnN0IGluc3RydW1lbnRJZCA9IGluc3RydW1lbnRMaXN0W2luZGV4XTtcbiAgICAgIGNvbnN0IGluc3RydW1lbnREZXNjciA9IGF1ZGlvU2V0dXAuaW5zdHJ1bWVudHNbaW5zdHJ1bWVudElkXTtcbiAgICAgIGNvbnN0IGluc3RydW1lbnRFbnYgPSAoaW5kZXggPT09IHRoaXMucGxheWVySWQpID8gdGhpcy5sb2NhbEluc3RydW1lbnRFbnYgOiB0aGlzLnJlbW90ZUluc3RydW1lbnRFbnY7XG4gICAgICB0aGlzLmluc3RydW1lbnRzW2luZGV4XSA9IGluc3RydW1lbnQgPSBpbnN0cnVtZW50RmFjdG9yeS5jcmVhdGVJbnN0cnVtZW50KGluc3RydW1lbnRFbnYsIGluc3RydW1lbnREZXNjci50eXBlLCBpbnN0cnVtZW50RGVzY3IpO1xuICAgIH1cblxuICAgIHJldHVybiBpbnN0cnVtZW50O1xuICB9XG5cbiAgcmVmdXNlQXBwbGljYXRpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ1NvcnJ5LCBubyBwbGFjZSA6LSgnKTtcbiAgfVxuXG4gIHJ1bkFwcGxpY2F0aW9uKHBsYXllcklkLCBwbGF5ZXJJZHMpIHtcbiAgICBjb25zdCBhdWRpb1NldHVwID0gdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIuZGF0YTtcbiAgICBjb25zdCBjb21tb25Db25maWcgPSBhdWRpb1NldHVwLmNvbW1vbjtcblxuICAgIHRoaXMucGxheWVySWQgPSBwbGF5ZXJJZDtcbiAgICB0aGlzLnBsYXllcklkcyA9IG5ldyBTZXQocGxheWVySWRzKTtcblxuICAgIGlmICh0aGlzLnBsYXllcklkID49IGluc3RydW1lbnRMaXN0Lmxlbmd0aClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCAob3V0IG9mIHJhbmdlKSBwbGF5ZXJJZCAtIHNvbWV0aGluZyBkb2Vzbid0IHdvcmsgcHJvcGVybHlgKTtcblxuICAgIGNvbnN0IGxvb3BQbGF5ZXIgPSBuZXcgTG9vcFBsYXllcih0aGlzLm1ldHJpY1NjaGVkdWxlciwgY29tbW9uQ29uZmlnLm1lYXN1cmVMZW5ndGgsIGNvbW1vbkNvbmZpZy50ZW1wbywgY29tbW9uQ29uZmlnLnRlbXBvVW5pdCwgMC4wNSk7XG5cbiAgICB0aGlzLmxvY2FsSW5zdHJ1bWVudEVudiA9IHtcbiAgICAgIHNjcmVlbkNvbnRhaW5lcjogdGhpcy52aWV3LiRlbCxcbiAgICAgIG1vdGlvbklucHV0OiB0aGlzLm1vdGlvbklucHV0LFxuICAgICAgc2VuZENvbnRyb2w6IHRoaXMuc2VuZEludHJ1bWVudENvbnRyb2wodGhpcy5wbGF5ZXJJZCksXG4gICAgICBtZXRyaWNTY2hlZHVsZXI6IHRoaXMubWV0cmljU2NoZWR1bGVyLFxuICAgICAgbG9vcFBsYXllcjogbG9vcFBsYXllcixcbiAgICB9O1xuXG4gICAgdGhpcy5yZW1vdGVJbnN0cnVtZW50RW52ID0ge1xuICAgICAgc2NyZWVuQ29udGFpbmVyOiBudWxsLFxuICAgICAgbW90aW9uSW5wdXQ6IG51bGwsXG4gICAgICBzZW5kQ29udHJvbDogbnVsbCxcbiAgICAgIG1ldHJpY1NjaGVkdWxlcjogdGhpcy5tZXRyaWNTY2hlZHVsZXIsXG4gICAgICBsb29wUGxheWVyOiBsb29wUGxheWVyLFxuICAgIH07XG5cbiAgICAvLyBpbml0IGF1ZGlvXG4gICAgdGhpcy5taXhlciA9IG5ldyBNaXhlcih0aGlzLm1ldHJpY1NjaGVkdWxlcik7XG4gICAgdGhpcy5taXhlci5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG5cbiAgICAvLyBjcmVhdGUgaW5zdHJ1bWVudHNcbiAgICBjb25zdCBwbGF5ZXJJbnN0cnVtZW50SWQgPSBpbnN0cnVtZW50TGlzdFt0aGlzLnBsYXllcklkXTtcblxuICAgIC8vIGxvb3AgdHJhY2sgdGVzdFxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBudW1JbnN0cnVtZW50czsgaW5kZXgrKykge1xuICAgICAgY29uc3QgaW5zdHJ1bWVudCA9IHRoaXMuZ2V0SW5zdHJ1bWVudChpbmRleCk7XG5cbiAgICAgIC8vIGFkZCBpbnN0cmVtZW50IHRvIG1peGVyXG4gICAgICB0aGlzLm1peGVyLmNyZWF0ZUNoYW5uZWwoaW5kZXgsIGluc3RydW1lbnQpO1xuXG4gICAgICBjb25zdCBkZWJ1ZyA9IGZhbHNlO1xuXG4gICAgICAvLyBpbml0IHZpZXcgaWYgbG9jYWwgaW5zdHJ1bWVudFxuICAgICAgaWYgKGluZGV4ID09PSB0aGlzLnBsYXllcklkKSB7XG4gICAgICAgIGluc3RydW1lbnQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIGluc3RydW1lbnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5taXhlci5zZXRHYWluKGluZGV4LCAxKTtcbiAgICAgIH0gZWxzZSBpZiAoZGVidWcpIHtcbiAgICAgICAgaW5zdHJ1bWVudC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLm1peGVyLnNldEdhaW4oaW5kZXgsIDAuNSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5yZWNlaXZlKCdpbnN0cnVtZW50OmNvbnRyb2wnLCB0aGlzLm9uSW5zdHJ1bWVudENvbnRyb2wpO1xuICAgIHRoaXMucmVjZWl2ZSgncGxheWVyOmVudGVyZWQnLCB0aGlzLm9uUGxheWVyRW50ZXJlZCk7XG4gICAgdGhpcy5yZWNlaXZlKCdwbGF5ZXI6ZXhpdCcsIHRoaXMub25QbGF5ZXJFeGl0KTtcblxuICAgIHRoaXMuYmVhY29uLm1pbm9yID0gdGhpcy5wbGF5ZXJJZDtcbiAgICB0aGlzLmJlYWNvbi5hZGRMaXN0ZW5lcih0aGlzLm9uQmVhY29uUmFuZ2luZyk7XG4gICAgdGhpcy5iZWFjb24uc3RhcnRBZHZlcnRpc2luZygpO1xuICAgIHRoaXMuYmVhY29uLnN0YXJ0UmFuZ2luZygpO1xuICB9XG5cbiAgc2VuZEludHJ1bWVudENvbnRyb2wocGxheWVySWQpIHtcbiAgICByZXR1cm4gKG5hbWUsIHZhbHVlKSA9PiB0aGlzLnNlbmQoJ2luc3RydW1lbnQ6Y29udHJvbCcsIHBsYXllcklkLCBuYW1lLCB2YWx1ZSk7XG4gIH1cblxuICBvbkluc3RydW1lbnRDb250cm9sKHBsYXllcklkLCBuYW1lLCB2YWx1ZSkge1xuICAgIGNvbnN0IGluc3RydW1lbnQgPSB0aGlzLmluc3RydW1lbnRzW3BsYXllcklkXTtcblxuICAgIGlmIChpbnN0cnVtZW50KVxuICAgICAgaW5zdHJ1bWVudC5zZXRDb250cm9sKG5hbWUsIHZhbHVlKTtcbiAgfVxuXG4gIG9uUGxheWVyRW50ZXJlZChwbGF5ZXJJZCkge1xuICAgIHRoaXMucGxheWVySWRzLmFkZChwbGF5ZXJJZCk7XG4gIH1cblxuICBvblBsYXllckV4aXQocGxheWVySWQpIHtcbiAgICAvLyByZXNldCBtaXhlciBhbmQgc3RvcCB0cmFja1xuICAgIHRoaXMubWl4ZXIuc2V0QXV0b21hdGlvbihwbGF5ZXJJZCwgMCwgMC4wNSk7XG5cbiAgICBjb25zdCBpbnN0cnVtZW50ID0gdGhpcy5pbnN0cnVtZW50c1twbGF5ZXJJZF07XG4gICAgaWYgKGluc3RydW1lbnQpXG4gICAgICBpbnN0cnVtZW50LmFjdGl2ZSA9IGZhbHNlO1xuXG4gICAgdGhpcy5wbGF5ZXJJZHMuZGVsZXRlKHBsYXllcklkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAd2FybmluZyAtIGEgcGVlciB3aG8ga2lsbCBpdHMgYXBwIHN0aWxsIHNlbmQgYmVhY29uIGluZm9ybWF0aW9ucyBmb3JcbiAgICogYXJvdW5kIDEwIHNlY29uZHMuIFRoYXQncyB3aHkgd2UgbXVzdCBrZWVwIGEgYm9va2luZyBvZiB0aGUgY29ubmVjdGVkXG4gICAqIGNsaWVudHRzIGFjY29yZGluZyB0byB0aGUgc2VydmVyIGluZm9ybWF0aW9ucy5cbiAgICovXG4gIG9uQmVhY29uUmFuZ2luZyhwbHVnaW5SZXN1bHRzKSB7XG4gICAgY29uc3Qgb2ZmVGhyZXNob2xkID0gLTYwO1xuXG4gICAgcGx1Z2luUmVzdWx0cy5iZWFjb25zLmZvckVhY2goKGJlYWNvbiwgaW5kZXgpID0+IHtcbiAgICAgIGlmIChiZWFjb24ubWlub3IgPT09IHRoaXMucGxheWVySWQpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBwZWVyIGJlYWNvbiBtaW5vciwgaXMgZXF1YWwgdG8gdGhpcy5wbGF5ZXJJZCcpO1xuXG4gICAgICBjb25zdCBwbGF5ZXJJZCA9IGJlYWNvbi5taW5vcjtcblxuICAgICAgLy8gcHJldmVudCBleGl0ZWQgcGxheWVycyB0byB0cmlnZ2VyIGF1dG9tYXRpb24gYW5kIGFjdGl2YXRpb25cbiAgICAgIGlmICh0aGlzLnBsYXllcklkcy5oYXMocGxheWVySWQpKSB7XG4gICAgICAgIGNvbnN0IGluc3RydW1lbnRJZCA9IGluc3RydW1lbnRMaXN0W3BsYXllcklkXTtcbiAgICAgICAgY29uc3QgaW5zdHJ1bWVudCA9IHNldHVwLmluc3RydW1lbnRzW2luc3RydW1lbnRJZF07XG4gICAgICAgIGNvbnN0IGVzdGltYXRlZERpc3RhbmNlID0gdGhpcy5iZWFjb24ucnNzaVRvRGlzdChiZWFjb24ucnNzaSk7XG4gICAgICAgIGNvbnN0IGNvbnN0UmFkaXVzID0gaW5zdHJ1bWVudC5jb25zdFJhZGl1cyAhPT0gdW5kZWZpbmVkID8gaW5zdHJ1bWVudC5jb25zdFJhZGl1cyA6IDE7XG4gICAgICAgIGNvbnN0IG9mZlJhZGl1cyA9IGluc3RydW1lbnQub2ZmUmFkaXVzICE9PSB1bmRlZmluZWQgPyBpbnN0cnVtZW50Lm9mZlJhZGl1cyA6IDM7XG4gICAgICAgIGxldCBnYWluID0gMDtcblxuICAgICAgICBpZiAoZXN0aW1hdGVkRGlzdGFuY2UgPCBvZmZSYWRpdXMpIHtcbiAgICAgICAgICBnYWluID0gMTtcblxuICAgICAgICAgIGlmIChlc3RpbWF0ZWREaXN0YW5jZSA+IGNvbnN0UmFkaXVzKSB7XG4gICAgICAgICAgICBjb25zdCBsZXZlbCA9IG9mZlRocmVzaG9sZCAqIChlc3RpbWF0ZWREaXN0YW5jZSAtIGNvbnN0UmFkaXVzKSAvIChvZmZSYWRpdXMgLSBjb25zdFJhZGl1cyk7XG4gICAgICAgICAgICBnYWluID0gZGVjaWJlbFRvTGluZWFyKGxldmVsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1peGVyLnNldEF1dG9tYXRpb24ocGxheWVySWQsIGdhaW4sIDAuNSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxheWVyRXhwZXJpZW5jZTtcbiJdfQ==