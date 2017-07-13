'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _InstrumentStore = require('./instrument/InstrumentStore');

var _InstrumentStore2 = _interopRequireDefault(_InstrumentStore);

var _LoopPlayer = require('./LoopPlayer');

var _LoopPlayer2 = _interopRequireDefault(_LoopPlayer);

var _CircularView = require('./instrument/CircularView');

var _CircularView2 = _interopRequireDefault(_CircularView);

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

var viewTemplate = '\n  <div class="background fit-container">\n    <div class="section-top flex-middle">\n      <% if (run) { %><p class="big bold">ProXoMix</p><% } %>\n    </div>\n\n    <% if (run) { %>\n    <div class="section-center flex-center run">\n    <% } else { %>\n    <div class="section-center flex-center">\n    <% } %>\n      <% if (wait) { %><p>Please wait...</p><% } %>\n      <% if (sorry) { %><p>Sorry,<br />no place available</p><% } %>\n    </div>\n\n    <div class="section-bottom flex-middle">\n      <% if (run) { %>\n        <p class="small soft-blink">Touch the screen to join!</p>\n      <% } %>\n    </div>\n  </div>\n  <div class="foreground fit-container" id="instrument-container"></div>\n';

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

    _this.onAccelerationIncludingGravity = _this.onAccelerationIncludingGravity.bind(_this);
    _this.onBeaconRanging = _this.onBeaconRanging.bind(_this);
    _this.onCutoffControl = _this.onCutoffControl.bind(_this);
    _this.onPlayerEntered = _this.onPlayerEntered.bind(_this);
    _this.onPlayerExit = _this.onPlayerExit.bind(_this);
    _this.runAudioPreview = _this.runAudioPreview.bind(_this);
    _this.runApplication = _this.runApplication.bind(_this);
    _this.refuseApplication = _this.refuseApplication.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(PlayerExperience, [{
    key: 'start',
    value: function start() {
      (0, _get3.default)(PlayerExperience.prototype.__proto__ || (0, _getPrototypeOf2.default)(PlayerExperience.prototype), 'start', this).call(this);

      var viewModel = {
        wait: true,
        run: false,
        sorry: false
      };
      this.view = new soundworks.SegmentedView(viewTemplate, viewModel, {}, {});
      this.show();

      if (client.urlParams !== null) {
        var intrumentName = client.urlParams.join('-');
        var index = instrumentList.indexOf(intrumentName);

        if (index !== -1) this.playerId = index;
      }

      this.lastCutoff = -Infinity;

      this.send('player:enter', this.playerId);
      this.receive('player:ack', this.runAudioPreview);
      this.receive('player:refused', this.refuseApplication);
    }
  }, {
    key: 'refuseApplication',
    value: function refuseApplication() {
      this.view.model.wait = false;
      this.view.model.sorry = true;
      this.view.render('.background');
    }
  }, {
    key: 'runAudioPreview',
    value: function runAudioPreview(playerId, playerIds) {
      var _this2 = this;

      var audioSetup = this.audioBufferManager.data;
      var instrumentId = instrumentList[playerId];
      var instrumentConfig = audioSetup.instruments[instrumentId];
      var loop = instrumentConfig.loop;

      if (Array.isArray(loop)) {
        var previewSegmentIndex = instrumentConfig.preview || 0;
        loop = loop[previewSegmentIndex];
      }

      var time = audioContext.currentTime;
      var measureDuration = audioSetup.common.measureDuration;
      var fadeTime = 0.05;

      var env = audioContext.createGain();
      env.connect(audioContext.destination);
      env.gain.value = 0;
      env.gain.setValueAtTime(0, time);
      env.gain.linearRampToValueAtTime(1, time + fadeTime);

      var src = audioContext.createBufferSource();
      src.connect(env);
      src.buffer = loop.audioBuffer;
      src.start(time, loop.startOffset - fadeTime);
      src.loopStart = loop.startOffset;
      src.loopEnd = loop.startOffset + loop.length * measureDuration;
      src.loop = true;

      var length = 2;
      var endTime = time + length * measureDuration;
      env.gain.setValueAtTime(1, endTime);
      env.gain.linearRampToValueAtTime(0, endTime + fadeTime);
      src.stop(endTime + fadeTime);

      this.view.model.wait = false;
      this.view.model.run = true;
      this.view.render('.background');

      // console.log(client.platform);
      var interaction = client.platform.interaction === 'touch' ? 'touchstart' : 'mousedown';

      this.view.installEvents((0, _defineProperty3.default)({}, interaction, function () {
        _this2.view.installEvents({}, true);
        _this2.view.model.run = false;
        _this2.view.render('.background');

        // launch the actual application
        _this2.runApplication(playerId, playerIds);
      }));
    }
  }, {
    key: 'runApplication',
    value: function runApplication(playerId, playerIds) {
      this.playerId = playerId;
      this.playerIds = new _set2.default(playerIds);

      if (this.playerId >= instrumentList.length) throw new Error('Invalid (out of range) playerId - something doesn\'t work properly');

      console.log(instrumentList);
      console.log('=> Running "' + instrumentList[this.playerId] + '" instrument (id: ' + this.playerId + ')');

      // init audio
      this.loopPlayer = new _LoopPlayer2.default(this.metricScheduler, 4 / 4, 121, 1 / 4, 0.05);

      this.mixer = new _Mixer2.default(this.metricScheduler);
      this.mixer.connect(audioContext.destination);

      // create instruments
      var audioSetup = this.audioBufferManager.data;
      var commonConfig = audioSetup.common;
      var metricScheduler = this.metricScheduler;
      var playerInstrumentId = instrumentList[this.playerId];
      var isSolo = audioSetup.instruments[playerInstrumentId].solo;

      // loop track test
      for (var index = 0; index < numInstruments; index++) {
        var instrumentId = instrumentList[index];
        var instrumentConfig = audioSetup.instruments[instrumentId];
        // init instrument audio
        var loop = instrumentConfig.loop;
        var audioBuffer = loop.buffer;

        var loopTrack = this.loopPlayer.addLoopTrack(index, loop);
        this.mixer.createChannel(index, loopTrack);

        // @debug: start all instruments
        // const gain = (i === this.playerId) ? 1 : 0.1;
        // this.mixer.setGain(instrumentId, gain);
        // loopTrack.active = true;

        // init view if local instrument
        if (index === this.playerId) {
          this.mixer.setGain(index, 1);
          loopTrack.active = true;

          var displayConfig = instrumentConfig.display;

          if (displayConfig) {
            displayConfig.playerId = this.playerId;
            var instrumentView = new _CircularView2.default(commonConfig, displayConfig, metricScheduler);
            instrumentView.render();
            instrumentView.show();
            instrumentView.appendTo(this.view.$el.querySelector('#instrument-container'));
          }
        }
      }

      this.motionInput.addListener('accelerationIncludingGravity', this.onAccelerationIncludingGravity);

      this.receive('cutoff:control', this.onCutoffControl);
      this.receive('player:entered', this.onPlayerEntered);
      this.receive('player:exit', this.onPlayerExit);

      this.beacon.minor = this.playerId;
      this.beacon.addListener(this.onBeaconRanging);
      this.beacon.startAdvertising();
      this.beacon.startRanging();
    }
  }, {
    key: 'onAccelerationIncludingGravity',
    value: function onAccelerationIncludingGravity(data) {
      var accX = data[0];
      var accY = data[1];
      var accZ = data[2];

      var pitch = 2 * Math.atan2(accY, Math.sqrt(accZ * accZ + accX * accX)) / Math.PI;
      var roll = -2 * Math.atan2(accX, Math.sqrt(accY * accY + accZ * accZ)) / Math.PI;
      var cutoff = 0.5 + Math.max(-0.8, Math.min(0.8, accZ / 9.81)) / 1.6;

      if (Math.abs(cutoff - this.lastCutoff) > 0.01) {
        this.lastCutoff = cutoff;
        // update local audio
        this.loopPlayer.setCutoff(this.playerId, cutoff);
        // update server (hence neighbors)
        this.send('cutoff:control', this.playerId, cutoff);
      }
    }
  }, {
    key: 'onCutoffControl',
    value: function onCutoffControl(playerId, value) {
      this.loopPlayer.setCutoff(playerId, value);
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
      this.loopPlayer.getLoopTrack(playerId).active = false;

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
      var _this3 = this;

      var offThreshold = -60;

      pluginResults.beacons.forEach(function (beacon, index) {
        if (beacon.minor === _this3.playerId) throw new Error('Invalid peer beacon minor, is equal to this.playerId');

        var playerId = beacon.minor;

        // prevent exited players to trigger automation and activation
        if (_this3.playerIds.has(playerId)) {
          var instrumentId = instrumentList[playerId];
          var instrument = _setup2.default.instruments[instrumentId];
          var estimatedDistance = _this3.beacon.rssiToDist(beacon.rssi);
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

          _this3.mixer.setAutomation(playerId, gain, 0.5);
        }
      });
    }
  }]);
  return PlayerExperience;
}(soundworks.Experience);

exports.default = PlayerExperience;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsImNsaWVudCIsImF1ZGlvIiwiYXVkaW9Db250ZXh0IiwiYXVkaW9TY2hlZHVsZXIiLCJnZXRTY2hlZHVsZXIiLCJsb29rYWhlYWQiLCJwZXJpb2QiLCJpbnN0cnVtZW50TGlzdCIsImluc3RydW1lbnRzIiwibnVtSW5zdHJ1bWVudHMiLCJsZW5ndGgiLCJ0ZW1wbyIsImJlYXREdXJhdGlvbiIsIm1lYXN1cmVEdXJhdGlvbiIsInZpZXdUZW1wbGF0ZSIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJiZWFjb25VVUlEIiwicGxhdGZvcm0iLCJyZXF1aXJlIiwiZmVhdHVyZXMiLCJtZXRyaWNTY2hlZHVsZXIiLCJhdWRpb0J1ZmZlck1hbmFnZXIiLCJmaWxlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJiZWFjb25Db25maWciLCJ1dWlkIiwidHhQb3dlciIsIm1ham9yIiwic2tpcFNlcnZpY2UiLCJkZWJ1ZyIsImVtdWxhdGUiLCJ3aW5kb3ciLCJjb3Jkb3ZhIiwibnVtUGVlcnMiLCJiZWFjb24iLCJwbGF5ZXJJZCIsImludHJ1bWVudENvbmZpZyIsInBsYXllcklkcyIsIm9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSIsImJpbmQiLCJvbkJlYWNvblJhbmdpbmciLCJvbkN1dG9mZkNvbnRyb2wiLCJvblBsYXllckVudGVyZWQiLCJvblBsYXllckV4aXQiLCJydW5BdWRpb1ByZXZpZXciLCJydW5BcHBsaWNhdGlvbiIsInJlZnVzZUFwcGxpY2F0aW9uIiwidmlld01vZGVsIiwid2FpdCIsInJ1biIsInNvcnJ5IiwidmlldyIsIlNlZ21lbnRlZFZpZXciLCJzaG93IiwidXJsUGFyYW1zIiwiaW50cnVtZW50TmFtZSIsImpvaW4iLCJpbmRleCIsImluZGV4T2YiLCJsYXN0Q3V0b2ZmIiwiSW5maW5pdHkiLCJzZW5kIiwicmVjZWl2ZSIsIm1vZGVsIiwicmVuZGVyIiwiYXVkaW9TZXR1cCIsImRhdGEiLCJpbnN0cnVtZW50SWQiLCJpbnN0cnVtZW50Q29uZmlnIiwibG9vcCIsIkFycmF5IiwiaXNBcnJheSIsInByZXZpZXdTZWdtZW50SW5kZXgiLCJwcmV2aWV3IiwidGltZSIsImN1cnJlbnRUaW1lIiwiY29tbW9uIiwiZmFkZVRpbWUiLCJlbnYiLCJjcmVhdGVHYWluIiwiY29ubmVjdCIsImRlc3RpbmF0aW9uIiwiZ2FpbiIsInZhbHVlIiwic2V0VmFsdWVBdFRpbWUiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsInNyYyIsImNyZWF0ZUJ1ZmZlclNvdXJjZSIsImJ1ZmZlciIsImF1ZGlvQnVmZmVyIiwic3RhcnQiLCJzdGFydE9mZnNldCIsImxvb3BTdGFydCIsImxvb3BFbmQiLCJlbmRUaW1lIiwic3RvcCIsImludGVyYWN0aW9uIiwiaW5zdGFsbEV2ZW50cyIsIkVycm9yIiwiY29uc29sZSIsImxvZyIsImxvb3BQbGF5ZXIiLCJtaXhlciIsImNvbW1vbkNvbmZpZyIsInBsYXllckluc3RydW1lbnRJZCIsImlzU29sbyIsInNvbG8iLCJsb29wVHJhY2siLCJhZGRMb29wVHJhY2siLCJjcmVhdGVDaGFubmVsIiwic2V0R2FpbiIsImFjdGl2ZSIsImRpc3BsYXlDb25maWciLCJkaXNwbGF5IiwiaW5zdHJ1bWVudFZpZXciLCJhcHBlbmRUbyIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRMaXN0ZW5lciIsIm1pbm9yIiwic3RhcnRBZHZlcnRpc2luZyIsInN0YXJ0UmFuZ2luZyIsImFjY1giLCJhY2NZIiwiYWNjWiIsInBpdGNoIiwiTWF0aCIsImF0YW4yIiwic3FydCIsIlBJIiwicm9sbCIsImN1dG9mZiIsIm1heCIsIm1pbiIsImFicyIsInNldEN1dG9mZiIsImFkZCIsInNldEF1dG9tYXRpb24iLCJnZXRMb29wVHJhY2siLCJkZWxldGUiLCJwbHVnaW5SZXN1bHRzIiwib2ZmVGhyZXNob2xkIiwiYmVhY29ucyIsImZvckVhY2giLCJoYXMiLCJpbnN0cnVtZW50IiwiZXN0aW1hdGVkRGlzdGFuY2UiLCJyc3NpVG9EaXN0IiwicnNzaSIsImNvbnN0UmFkaXVzIiwidW5kZWZpbmVkIiwib2ZmUmFkaXVzIiwibGV2ZWwiLCJFeHBlcmllbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUEsSUFBTUMsU0FBU0QsV0FBV0MsTUFBMUI7QUFDQSxJQUFNQyxRQUFRRixXQUFXRSxLQUF6QjtBQUNBLElBQU1DLGVBQWVILFdBQVdHLFlBQWhDO0FBQ0EsSUFBTUMsaUJBQWlCSixXQUFXRSxLQUFYLENBQWlCRyxZQUFqQixFQUF2Qjs7QUFFQUQsZUFBZUUsU0FBZixHQUEyQixHQUEzQjtBQUNBRixlQUFlRyxNQUFmLEdBQXdCLElBQXhCOztBQUVBLElBQU1DLGlCQUFpQixvQkFBWSxnQkFBTUMsV0FBbEIsQ0FBdkI7QUFDQSxJQUFNQyxpQkFBaUJGLGVBQWVHLE1BQXRDOztBQUVBLElBQU1DLFFBQVEsR0FBZDtBQUNBLElBQU1DLGVBQWUsS0FBS0QsS0FBMUI7QUFDQSxJQUFNRSxrQkFBa0IsSUFBSUQsWUFBNUI7O0FBRUEsSUFBTUUsNnNCQUFOOztJQXdCTUMsZ0I7OztBQUNKLDRCQUFZQyxZQUFaLEVBQTBCQyxVQUExQixFQUFzQztBQUFBOztBQUFBOztBQUdwQyxVQUFLQyxRQUFMLEdBQWdCLE1BQUtDLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLEVBQUVDLFVBQVUsQ0FBQyxXQUFELENBQVosRUFBekIsQ0FBaEI7QUFDQSxVQUFLQyxlQUFMLEdBQXVCLE1BQUtGLE9BQUwsQ0FBYSxrQkFBYixDQUF2Qjs7QUFFQSxVQUFLRyxrQkFBTCxHQUEwQixNQUFLSCxPQUFMLENBQWEsc0JBQWIsRUFBcUM7QUFDN0RILG9CQUFjQSxlQUFlLFNBRGdDO0FBRTdETztBQUY2RCxLQUFyQyxDQUExQjs7QUFLQSxVQUFLQyxXQUFMLEdBQW1CLE1BQUtMLE9BQUwsQ0FBYSxjQUFiLEVBQTZCO0FBQzlDTSxtQkFBYSxDQUFDLDhCQUFEO0FBRGlDLEtBQTdCLENBQW5COztBQUlBLFFBQU1DLGVBQWU7QUFDbkJDLFlBQU1WLFVBRGE7QUFFbkJXLGVBQVMsQ0FBQyxFQUZTLEVBRUw7QUFDZEMsYUFBTyxDQUhZO0FBSW5CQyxtQkFBYSxLQUpNO0FBS25CQyxhQUFPO0FBTFksS0FBckI7O0FBUUFMLGlCQUFhTSxPQUFiLEdBQXdCLENBQUMsQ0FBQ0MsT0FBT0MsT0FBVixHQUFxQixJQUFyQixHQUE0QixFQUFFQyxVQUFVLENBQVosRUFBbkQ7QUFDQSxVQUFLQyxNQUFMLEdBQWMsTUFBS2pCLE9BQUwsQ0FBYSxRQUFiLEVBQXVCTyxZQUF2QixDQUFkOztBQUVBLFVBQUtXLFFBQUwsR0FBZ0IsSUFBaEI7QUFDQSxVQUFLQyxlQUFMLEdBQXVCLElBQXZCO0FBQ0EsVUFBS0MsU0FBTCxHQUFpQixJQUFqQjs7QUFFQSxVQUFLQyw4QkFBTCxHQUFzQyxNQUFLQSw4QkFBTCxDQUFvQ0MsSUFBcEMsT0FBdEM7QUFDQSxVQUFLQyxlQUFMLEdBQXVCLE1BQUtBLGVBQUwsQ0FBcUJELElBQXJCLE9BQXZCO0FBQ0EsVUFBS0UsZUFBTCxHQUF1QixNQUFLQSxlQUFMLENBQXFCRixJQUFyQixPQUF2QjtBQUNBLFVBQUtHLGVBQUwsR0FBdUIsTUFBS0EsZUFBTCxDQUFxQkgsSUFBckIsT0FBdkI7QUFDQSxVQUFLSSxZQUFMLEdBQW9CLE1BQUtBLFlBQUwsQ0FBa0JKLElBQWxCLE9BQXBCO0FBQ0EsVUFBS0ssZUFBTCxHQUF1QixNQUFLQSxlQUFMLENBQXFCTCxJQUFyQixPQUF2QjtBQUNBLFVBQUtNLGNBQUwsR0FBc0IsTUFBS0EsY0FBTCxDQUFvQk4sSUFBcEIsT0FBdEI7QUFDQSxVQUFLTyxpQkFBTCxHQUF5QixNQUFLQSxpQkFBTCxDQUF1QlAsSUFBdkIsT0FBekI7QUFyQ29DO0FBc0NyQzs7Ozs0QkFFTztBQUNOOztBQUVBLFVBQU1RLFlBQVk7QUFDaEJDLGNBQU0sSUFEVTtBQUVoQkMsYUFBSyxLQUZXO0FBR2hCQyxlQUFPO0FBSFMsT0FBbEI7QUFLQSxXQUFLQyxJQUFMLEdBQVksSUFBSXRELFdBQVd1RCxhQUFmLENBQTZCeEMsWUFBN0IsRUFBMkNtQyxTQUEzQyxFQUFzRCxFQUF0RCxFQUEwRCxFQUExRCxDQUFaO0FBQ0EsV0FBS00sSUFBTDs7QUFFQSxVQUFJdkQsT0FBT3dELFNBQVAsS0FBcUIsSUFBekIsRUFBK0I7QUFDN0IsWUFBTUMsZ0JBQWdCekQsT0FBT3dELFNBQVAsQ0FBaUJFLElBQWpCLENBQXNCLEdBQXRCLENBQXRCO0FBQ0EsWUFBTUMsUUFBUXBELGVBQWVxRCxPQUFmLENBQXVCSCxhQUF2QixDQUFkOztBQUVBLFlBQUlFLFVBQVUsQ0FBQyxDQUFmLEVBQ0UsS0FBS3RCLFFBQUwsR0FBZ0JzQixLQUFoQjtBQUNIOztBQUVELFdBQUtFLFVBQUwsR0FBa0IsQ0FBQ0MsUUFBbkI7O0FBRUEsV0FBS0MsSUFBTCxDQUFVLGNBQVYsRUFBMEIsS0FBSzFCLFFBQS9CO0FBQ0EsV0FBSzJCLE9BQUwsQ0FBYSxZQUFiLEVBQTJCLEtBQUtsQixlQUFoQztBQUNBLFdBQUtrQixPQUFMLENBQWEsZ0JBQWIsRUFBK0IsS0FBS2hCLGlCQUFwQztBQUNEOzs7d0NBRW1CO0FBQ2xCLFdBQUtLLElBQUwsQ0FBVVksS0FBVixDQUFnQmYsSUFBaEIsR0FBdUIsS0FBdkI7QUFDQSxXQUFLRyxJQUFMLENBQVVZLEtBQVYsQ0FBZ0JiLEtBQWhCLEdBQXdCLElBQXhCO0FBQ0EsV0FBS0MsSUFBTCxDQUFVYSxNQUFWLENBQWlCLGFBQWpCO0FBQ0Q7OztvQ0FFZTdCLFEsRUFBVUUsUyxFQUFXO0FBQUE7O0FBQ25DLFVBQU00QixhQUFhLEtBQUs3QyxrQkFBTCxDQUF3QjhDLElBQTNDO0FBQ0EsVUFBTUMsZUFBZTlELGVBQWU4QixRQUFmLENBQXJCO0FBQ0EsVUFBTWlDLG1CQUFtQkgsV0FBVzNELFdBQVgsQ0FBdUI2RCxZQUF2QixDQUF6QjtBQUNBLFVBQUlFLE9BQU9ELGlCQUFpQkMsSUFBNUI7O0FBRUEsVUFBR0MsTUFBTUMsT0FBTixDQUFjRixJQUFkLENBQUgsRUFBd0I7QUFDdEIsWUFBTUcsc0JBQXNCSixpQkFBaUJLLE9BQWpCLElBQTRCLENBQXhEO0FBQ0FKLGVBQU9BLEtBQUtHLG1CQUFMLENBQVA7QUFDRDs7QUFFRCxVQUFNRSxPQUFPMUUsYUFBYTJFLFdBQTFCO0FBQ0EsVUFBTWhFLGtCQUFrQnNELFdBQVdXLE1BQVgsQ0FBa0JqRSxlQUExQztBQUNBLFVBQU1rRSxXQUFXLElBQWpCOztBQUVBLFVBQU1DLE1BQU05RSxhQUFhK0UsVUFBYixFQUFaO0FBQ0FELFVBQUlFLE9BQUosQ0FBWWhGLGFBQWFpRixXQUF6QjtBQUNBSCxVQUFJSSxJQUFKLENBQVNDLEtBQVQsR0FBaUIsQ0FBakI7QUFDQUwsVUFBSUksSUFBSixDQUFTRSxjQUFULENBQXdCLENBQXhCLEVBQTJCVixJQUEzQjtBQUNBSSxVQUFJSSxJQUFKLENBQVNHLHVCQUFULENBQWlDLENBQWpDLEVBQW9DWCxPQUFPRyxRQUEzQzs7QUFFQSxVQUFNUyxNQUFNdEYsYUFBYXVGLGtCQUFiLEVBQVo7QUFDQUQsVUFBSU4sT0FBSixDQUFZRixHQUFaO0FBQ0FRLFVBQUlFLE1BQUosR0FBYW5CLEtBQUtvQixXQUFsQjtBQUNBSCxVQUFJSSxLQUFKLENBQVVoQixJQUFWLEVBQWdCTCxLQUFLc0IsV0FBTCxHQUFtQmQsUUFBbkM7QUFDQVMsVUFBSU0sU0FBSixHQUFnQnZCLEtBQUtzQixXQUFyQjtBQUNBTCxVQUFJTyxPQUFKLEdBQWN4QixLQUFLc0IsV0FBTCxHQUFtQnRCLEtBQUs3RCxNQUFMLEdBQWNHLGVBQS9DO0FBQ0EyRSxVQUFJakIsSUFBSixHQUFXLElBQVg7O0FBRUEsVUFBTTdELFNBQVMsQ0FBZjtBQUNBLFVBQU1zRixVQUFVcEIsT0FBT2xFLFNBQVNHLGVBQWhDO0FBQ0FtRSxVQUFJSSxJQUFKLENBQVNFLGNBQVQsQ0FBd0IsQ0FBeEIsRUFBMkJVLE9BQTNCO0FBQ0FoQixVQUFJSSxJQUFKLENBQVNHLHVCQUFULENBQWlDLENBQWpDLEVBQW9DUyxVQUFVakIsUUFBOUM7QUFDQVMsVUFBSVMsSUFBSixDQUFTRCxVQUFVakIsUUFBbkI7O0FBRUEsV0FBSzFCLElBQUwsQ0FBVVksS0FBVixDQUFnQmYsSUFBaEIsR0FBdUIsS0FBdkI7QUFDQSxXQUFLRyxJQUFMLENBQVVZLEtBQVYsQ0FBZ0JkLEdBQWhCLEdBQXNCLElBQXRCO0FBQ0EsV0FBS0UsSUFBTCxDQUFVYSxNQUFWLENBQWlCLGFBQWpCOztBQUVBO0FBQ0EsVUFBTWdDLGNBQWNsRyxPQUFPa0IsUUFBUCxDQUFnQmdGLFdBQWhCLEtBQWdDLE9BQWhDLEdBQ2xCLFlBRGtCLEdBQ0gsV0FEakI7O0FBR0EsV0FBSzdDLElBQUwsQ0FBVThDLGFBQVYsbUNBQ0dELFdBREgsRUFDaUIsWUFBTTtBQUNuQixlQUFLN0MsSUFBTCxDQUFVOEMsYUFBVixDQUF3QixFQUF4QixFQUE0QixJQUE1QjtBQUNBLGVBQUs5QyxJQUFMLENBQVVZLEtBQVYsQ0FBZ0JkLEdBQWhCLEdBQXNCLEtBQXRCO0FBQ0EsZUFBS0UsSUFBTCxDQUFVYSxNQUFWLENBQWlCLGFBQWpCOztBQUVBO0FBQ0EsZUFBS25CLGNBQUwsQ0FBb0JWLFFBQXBCLEVBQThCRSxTQUE5QjtBQUNELE9BUkg7QUFVRDs7O21DQUVjRixRLEVBQVVFLFMsRUFBVztBQUNsQyxXQUFLRixRQUFMLEdBQWdCQSxRQUFoQjtBQUNBLFdBQUtFLFNBQUwsR0FBaUIsa0JBQVFBLFNBQVIsQ0FBakI7O0FBRUEsVUFBSSxLQUFLRixRQUFMLElBQWlCOUIsZUFBZUcsTUFBcEMsRUFDRSxNQUFNLElBQUkwRixLQUFKLHNFQUFOOztBQUVGQyxjQUFRQyxHQUFSLENBQVkvRixjQUFaO0FBQ0E4RixjQUFRQyxHQUFSLGtCQUEyQi9GLGVBQWUsS0FBSzhCLFFBQXBCLENBQTNCLDBCQUE2RSxLQUFLQSxRQUFsRjs7QUFFQTtBQUNBLFdBQUtrRSxVQUFMLEdBQWtCLHlCQUFlLEtBQUtsRixlQUFwQixFQUFxQyxJQUFJLENBQXpDLEVBQTRDLEdBQTVDLEVBQWlELElBQUksQ0FBckQsRUFBd0QsSUFBeEQsQ0FBbEI7O0FBRUEsV0FBS21GLEtBQUwsR0FBYSxvQkFBVSxLQUFLbkYsZUFBZixDQUFiO0FBQ0EsV0FBS21GLEtBQUwsQ0FBV3RCLE9BQVgsQ0FBbUJoRixhQUFhaUYsV0FBaEM7O0FBRUE7QUFDQSxVQUFNaEIsYUFBYSxLQUFLN0Msa0JBQUwsQ0FBd0I4QyxJQUEzQztBQUNBLFVBQU1xQyxlQUFldEMsV0FBV1csTUFBaEM7QUFDQSxVQUFNekQsa0JBQWtCLEtBQUtBLGVBQTdCO0FBQ0EsVUFBTXFGLHFCQUFxQm5HLGVBQWUsS0FBSzhCLFFBQXBCLENBQTNCO0FBQ0EsVUFBTXNFLFNBQVN4QyxXQUFXM0QsV0FBWCxDQUF1QmtHLGtCQUF2QixFQUEyQ0UsSUFBMUQ7O0FBRUE7QUFDQSxXQUFLLElBQUlqRCxRQUFRLENBQWpCLEVBQW9CQSxRQUFRbEQsY0FBNUIsRUFBNENrRCxPQUE1QyxFQUFxRDtBQUNuRCxZQUFNVSxlQUFlOUQsZUFBZW9ELEtBQWYsQ0FBckI7QUFDQSxZQUFNVyxtQkFBbUJILFdBQVczRCxXQUFYLENBQXVCNkQsWUFBdkIsQ0FBekI7QUFDQTtBQUNBLFlBQU1FLE9BQU9ELGlCQUFpQkMsSUFBOUI7QUFDQSxZQUFNb0IsY0FBY3BCLEtBQUttQixNQUF6Qjs7QUFFQSxZQUFNbUIsWUFBWSxLQUFLTixVQUFMLENBQWdCTyxZQUFoQixDQUE2Qm5ELEtBQTdCLEVBQW9DWSxJQUFwQyxDQUFsQjtBQUNBLGFBQUtpQyxLQUFMLENBQVdPLGFBQVgsQ0FBeUJwRCxLQUF6QixFQUFnQ2tELFNBQWhDOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsWUFBSWxELFVBQVUsS0FBS3RCLFFBQW5CLEVBQTZCO0FBQzNCLGVBQUttRSxLQUFMLENBQVdRLE9BQVgsQ0FBbUJyRCxLQUFuQixFQUEwQixDQUExQjtBQUNBa0Qsb0JBQVVJLE1BQVYsR0FBbUIsSUFBbkI7O0FBRUEsY0FBTUMsZ0JBQWdCNUMsaUJBQWlCNkMsT0FBdkM7O0FBRUEsY0FBSUQsYUFBSixFQUFtQjtBQUNqQkEsMEJBQWM3RSxRQUFkLEdBQXlCLEtBQUtBLFFBQTlCO0FBQ0EsZ0JBQU0rRSxpQkFBaUIsMkJBQWlCWCxZQUFqQixFQUErQlMsYUFBL0IsRUFBOEM3RixlQUE5QyxDQUF2QjtBQUNBK0YsMkJBQWVsRCxNQUFmO0FBQ0FrRCwyQkFBZTdELElBQWY7QUFDQTZELDJCQUFlQyxRQUFmLENBQXdCLEtBQUtoRSxJQUFMLENBQVVpRSxHQUFWLENBQWNDLGFBQWQsQ0FBNEIsdUJBQTVCLENBQXhCO0FBQ0Q7QUFDRjtBQUNGOztBQUVELFdBQUsvRixXQUFMLENBQWlCZ0csV0FBakIsQ0FBNkIsOEJBQTdCLEVBQTZELEtBQUtoRiw4QkFBbEU7O0FBRUEsV0FBS3dCLE9BQUwsQ0FBYSxnQkFBYixFQUErQixLQUFLckIsZUFBcEM7QUFDQSxXQUFLcUIsT0FBTCxDQUFhLGdCQUFiLEVBQStCLEtBQUtwQixlQUFwQztBQUNBLFdBQUtvQixPQUFMLENBQWEsYUFBYixFQUE0QixLQUFLbkIsWUFBakM7O0FBRUEsV0FBS1QsTUFBTCxDQUFZcUYsS0FBWixHQUFvQixLQUFLcEYsUUFBekI7QUFDQSxXQUFLRCxNQUFMLENBQVlvRixXQUFaLENBQXdCLEtBQUs5RSxlQUE3QjtBQUNBLFdBQUtOLE1BQUwsQ0FBWXNGLGdCQUFaO0FBQ0EsV0FBS3RGLE1BQUwsQ0FBWXVGLFlBQVo7QUFDRDs7O21EQUU4QnZELEksRUFBTTtBQUNuQyxVQUFNd0QsT0FBT3hELEtBQUssQ0FBTCxDQUFiO0FBQ0EsVUFBTXlELE9BQU96RCxLQUFLLENBQUwsQ0FBYjtBQUNBLFVBQU0wRCxPQUFPMUQsS0FBSyxDQUFMLENBQWI7O0FBRUEsVUFBTTJELFFBQVEsSUFBSUMsS0FBS0MsS0FBTCxDQUFXSixJQUFYLEVBQWlCRyxLQUFLRSxJQUFMLENBQVVKLE9BQU9BLElBQVAsR0FBY0YsT0FBT0EsSUFBL0IsQ0FBakIsQ0FBSixHQUE2REksS0FBS0csRUFBaEY7QUFDQSxVQUFNQyxPQUFPLENBQUMsQ0FBRCxHQUFLSixLQUFLQyxLQUFMLENBQVdMLElBQVgsRUFBaUJJLEtBQUtFLElBQUwsQ0FBVUwsT0FBT0EsSUFBUCxHQUFjQyxPQUFPQSxJQUEvQixDQUFqQixDQUFMLEdBQThERSxLQUFLRyxFQUFoRjtBQUNBLFVBQU1FLFNBQVMsTUFBTUwsS0FBS00sR0FBTCxDQUFTLENBQUMsR0FBVixFQUFlTixLQUFLTyxHQUFMLENBQVMsR0FBVCxFQUFlVCxPQUFPLElBQXRCLENBQWYsSUFBK0MsR0FBcEU7O0FBRUEsVUFBSUUsS0FBS1EsR0FBTCxDQUFTSCxTQUFTLEtBQUt4RSxVQUF2QixJQUFxQyxJQUF6QyxFQUErQztBQUM3QyxhQUFLQSxVQUFMLEdBQWtCd0UsTUFBbEI7QUFDQTtBQUNBLGFBQUs5QixVQUFMLENBQWdCa0MsU0FBaEIsQ0FBMEIsS0FBS3BHLFFBQS9CLEVBQXlDZ0csTUFBekM7QUFDQTtBQUNBLGFBQUt0RSxJQUFMLENBQVUsZ0JBQVYsRUFBNEIsS0FBSzFCLFFBQWpDLEVBQTJDZ0csTUFBM0M7QUFDRDtBQUNGOzs7b0NBRWVoRyxRLEVBQVVnRCxLLEVBQU87QUFDL0IsV0FBS2tCLFVBQUwsQ0FBZ0JrQyxTQUFoQixDQUEwQnBHLFFBQTFCLEVBQW9DZ0QsS0FBcEM7QUFDRDs7O29DQUVlaEQsUSxFQUFVO0FBQ3hCLFdBQUtFLFNBQUwsQ0FBZW1HLEdBQWYsQ0FBbUJyRyxRQUFuQjtBQUNEOzs7aUNBRVlBLFEsRUFBVTtBQUNyQjtBQUNBLFdBQUttRSxLQUFMLENBQVdtQyxhQUFYLENBQXlCdEcsUUFBekIsRUFBbUMsQ0FBbkMsRUFBc0MsSUFBdEM7QUFDQSxXQUFLa0UsVUFBTCxDQUFnQnFDLFlBQWhCLENBQTZCdkcsUUFBN0IsRUFBdUM0RSxNQUF2QyxHQUFnRCxLQUFoRDs7QUFFQSxXQUFLMUUsU0FBTCxDQUFlc0csTUFBZixDQUFzQnhHLFFBQXRCO0FBQ0Q7O0FBRUQ7Ozs7Ozs7O29DQUtnQnlHLGEsRUFBZTtBQUFBOztBQUM3QixVQUFNQyxlQUFlLENBQUMsRUFBdEI7O0FBRUFELG9CQUFjRSxPQUFkLENBQXNCQyxPQUF0QixDQUE4QixVQUFDN0csTUFBRCxFQUFTdUIsS0FBVCxFQUFtQjtBQUMvQyxZQUFJdkIsT0FBT3FGLEtBQVAsS0FBaUIsT0FBS3BGLFFBQTFCLEVBQ0UsTUFBTSxJQUFJK0QsS0FBSixDQUFVLHNEQUFWLENBQU47O0FBRUYsWUFBTS9ELFdBQVdELE9BQU9xRixLQUF4Qjs7QUFFQTtBQUNBLFlBQUksT0FBS2xGLFNBQUwsQ0FBZTJHLEdBQWYsQ0FBbUI3RyxRQUFuQixDQUFKLEVBQWtDO0FBQ2hDLGNBQU1nQyxlQUFlOUQsZUFBZThCLFFBQWYsQ0FBckI7QUFDQSxjQUFNOEcsYUFBYSxnQkFBTTNJLFdBQU4sQ0FBa0I2RCxZQUFsQixDQUFuQjtBQUNBLGNBQU0rRSxvQkFBb0IsT0FBS2hILE1BQUwsQ0FBWWlILFVBQVosQ0FBdUJqSCxPQUFPa0gsSUFBOUIsQ0FBMUI7QUFDQSxjQUFNQyxjQUFjSixXQUFXSSxXQUFYLEtBQTJCQyxTQUEzQixHQUF1Q0wsV0FBV0ksV0FBbEQsR0FBZ0UsQ0FBcEY7QUFDQSxjQUFNRSxZQUFZTixXQUFXTSxTQUFYLEtBQXlCRCxTQUF6QixHQUFxQ0wsV0FBV00sU0FBaEQsR0FBNEQsQ0FBOUU7QUFDQSxjQUFJckUsT0FBTyxDQUFYOztBQUVBLGNBQUlnRSxvQkFBb0JLLFNBQXhCLEVBQW1DO0FBQ2pDckUsbUJBQU8sQ0FBUDs7QUFFQSxnQkFBSWdFLG9CQUFvQkcsV0FBeEIsRUFBcUM7QUFDbkMsa0JBQU1HLFFBQVFYLGdCQUFnQkssb0JBQW9CRyxXQUFwQyxLQUFvREUsWUFBWUYsV0FBaEUsQ0FBZDtBQUNBbkUscUJBQU8sMkJBQWdCc0UsS0FBaEIsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsaUJBQUtsRCxLQUFMLENBQVdtQyxhQUFYLENBQXlCdEcsUUFBekIsRUFBbUMrQyxJQUFuQyxFQUF5QyxHQUF6QztBQUNEO0FBQ0YsT0ExQkQ7QUEyQkQ7OztFQXpRNEJyRixXQUFXNEosVTs7a0JBNFEzQjVJLGdCIiwiZmlsZSI6IlBsYXllckV4cGVyaWVuY2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBzb3VuZHdvcmtzIGZyb20gJ3NvdW5kd29ya3MvY2xpZW50JztcbmltcG9ydCB7IGRlY2liZWxUb0xpbmVhciB9IGZyb20gJ3NvdW5kd29ya3MvdXRpbHMvbWF0aCc7XG5pbXBvcnQgQmVhY29uIGZyb20gJy4uLy4uL3NoYXJlZC9zZXJ2aWNlcy9jbGllbnQvQmVhY29uJztcbmltcG9ydCBNaXhlciBmcm9tICcuL01peGVyJztcbmltcG9ydCBJbnN0cnVtZW50U3RvcmUgZnJvbSAnLi9pbnN0cnVtZW50L0luc3RydW1lbnRTdG9yZSc7XG5pbXBvcnQgTG9vcFBsYXllciBmcm9tICcuL0xvb3BQbGF5ZXInO1xuaW1wb3J0IENpcmN1bGFyVmlldyBmcm9tICcuL2luc3RydW1lbnQvQ2lyY3VsYXJWaWV3JztcbmltcG9ydCBzZXR1cCBmcm9tICcuLi8uLi9zaGFyZWQvc2V0dXAnO1xuXG5jb25zdCBjbGllbnQgPSBzb3VuZHdvcmtzLmNsaWVudDtcbmNvbnN0IGF1ZGlvID0gc291bmR3b3Jrcy5hdWRpbztcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuY29uc3QgYXVkaW9TY2hlZHVsZXIgPSBzb3VuZHdvcmtzLmF1ZGlvLmdldFNjaGVkdWxlcigpO1xuXG5hdWRpb1NjaGVkdWxlci5sb29rYWhlYWQgPSAwLjE7XG5hdWRpb1NjaGVkdWxlci5wZXJpb2QgPSAwLjA1O1xuXG5jb25zdCBpbnN0cnVtZW50TGlzdCA9IE9iamVjdC5rZXlzKHNldHVwLmluc3RydW1lbnRzKTtcbmNvbnN0IG51bUluc3RydW1lbnRzID0gaW5zdHJ1bWVudExpc3QubGVuZ3RoO1xuXG5jb25zdCB0ZW1wbyA9IDEyMTtcbmNvbnN0IGJlYXREdXJhdGlvbiA9IDYwIC8gdGVtcG87XG5jb25zdCBtZWFzdXJlRHVyYXRpb24gPSA0ICogYmVhdER1cmF0aW9uO1xuXG5jb25zdCB2aWV3VGVtcGxhdGUgPSBgXG4gIDxkaXYgY2xhc3M9XCJiYWNrZ3JvdW5kIGZpdC1jb250YWluZXJcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj5cbiAgICAgIDwlIGlmIChydW4pIHsgJT48cCBjbGFzcz1cImJpZyBib2xkXCI+UHJvWG9NaXg8L3A+PCUgfSAlPlxuICAgIDwvZGl2PlxuXG4gICAgPCUgaWYgKHJ1bikgeyAlPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlciBydW5cIj5cbiAgICA8JSB9IGVsc2UgeyAlPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgIDwlIH0gJT5cbiAgICAgIDwlIGlmICh3YWl0KSB7ICU+PHA+UGxlYXNlIHdhaXQuLi48L3A+PCUgfSAlPlxuICAgICAgPCUgaWYgKHNvcnJ5KSB7ICU+PHA+U29ycnksPGJyIC8+bm8gcGxhY2UgYXZhaWxhYmxlPC9wPjwlIH0gJT5cbiAgICA8L2Rpdj5cblxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPlxuICAgICAgPCUgaWYgKHJ1bikgeyAlPlxuICAgICAgICA8cCBjbGFzcz1cInNtYWxsIHNvZnQtYmxpbmtcIj5Ub3VjaCB0aGUgc2NyZWVuIHRvIGpvaW4hPC9wPlxuICAgICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmQgZml0LWNvbnRhaW5lclwiIGlkPVwiaW5zdHJ1bWVudC1jb250YWluZXJcIj48L2Rpdj5cbmA7XG5cbmNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4sIGJlYWNvblVVSUQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbyddIH0pO1xuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyID0gdGhpcy5yZXF1aXJlKCdtZXRyaWMtc2NoZWR1bGVyJyk7XG5cbiAgICB0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlciA9IHRoaXMucmVxdWlyZSgnYXVkaW8tYnVmZmVyLW1hbmFnZXInLCB7XG4gICAgICBhc3NldHNEb21haW46IGFzc2V0c0RvbWFpbiArICdzb3VuZHMvJyxcbiAgICAgIGZpbGVzOiBzZXR1cFxuICAgIH0pO1xuXG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IHRoaXMucmVxdWlyZSgnbW90aW9uLWlucHV0Jywge1xuICAgICAgZGVzY3JpcHRvcnM6IFsnYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSddLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYmVhY29uQ29uZmlnID0ge1xuICAgICAgdXVpZDogYmVhY29uVVVJRCxcbiAgICAgIHR4UG93ZXI6IC01NSwgLy8gaW4gZEIgKHNlZSBiZWFjb24gc2VydmljZSBmb3IgZGV0YWlsKVxuICAgICAgbWFqb3I6IDAsXG4gICAgICBza2lwU2VydmljZTogZmFsc2UsXG4gICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgfTtcblxuICAgIGJlYWNvbkNvbmZpZy5lbXVsYXRlID0gKCEhd2luZG93LmNvcmRvdmEpID8gbnVsbCA6IHsgbnVtUGVlcnM6IDAgfTtcbiAgICB0aGlzLmJlYWNvbiA9IHRoaXMucmVxdWlyZSgnYmVhY29uJywgYmVhY29uQ29uZmlnKTtcblxuICAgIHRoaXMucGxheWVySWQgPSBudWxsO1xuICAgIHRoaXMuaW50cnVtZW50Q29uZmlnID0gbnVsbDtcbiAgICB0aGlzLnBsYXllcklkcyA9IG51bGw7XG5cbiAgICB0aGlzLm9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSA9IHRoaXMub25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbkJlYWNvblJhbmdpbmcgPSB0aGlzLm9uQmVhY29uUmFuZ2luZy5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25DdXRvZmZDb250cm9sID0gdGhpcy5vbkN1dG9mZkNvbnRyb2wuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uUGxheWVyRW50ZXJlZCA9IHRoaXMub25QbGF5ZXJFbnRlcmVkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vblBsYXllckV4aXQgPSB0aGlzLm9uUGxheWVyRXhpdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMucnVuQXVkaW9QcmV2aWV3ID0gdGhpcy5ydW5BdWRpb1ByZXZpZXcuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJ1bkFwcGxpY2F0aW9uID0gdGhpcy5ydW5BcHBsaWNhdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVmdXNlQXBwbGljYXRpb24gPSB0aGlzLnJlZnVzZUFwcGxpY2F0aW9uLmJpbmQodGhpcyk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgY29uc3Qgdmlld01vZGVsID0ge1xuICAgICAgd2FpdDogdHJ1ZSxcbiAgICAgIHJ1bjogZmFsc2UsXG4gICAgICBzb3JyeTogZmFsc2UsXG4gICAgfTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgc291bmR3b3Jrcy5TZWdtZW50ZWRWaWV3KHZpZXdUZW1wbGF0ZSwgdmlld01vZGVsLCB7fSwge30pO1xuICAgIHRoaXMuc2hvdygpO1xuXG4gICAgaWYgKGNsaWVudC51cmxQYXJhbXMgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludHJ1bWVudE5hbWUgPSBjbGllbnQudXJsUGFyYW1zLmpvaW4oJy0nKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gaW5zdHJ1bWVudExpc3QuaW5kZXhPZihpbnRydW1lbnROYW1lKTtcblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgdGhpcy5wbGF5ZXJJZCA9IGluZGV4O1xuICAgIH1cblxuICAgIHRoaXMubGFzdEN1dG9mZiA9IC1JbmZpbml0eTtcblxuICAgIHRoaXMuc2VuZCgncGxheWVyOmVudGVyJywgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5yZWNlaXZlKCdwbGF5ZXI6YWNrJywgdGhpcy5ydW5BdWRpb1ByZXZpZXcpO1xuICAgIHRoaXMucmVjZWl2ZSgncGxheWVyOnJlZnVzZWQnLCB0aGlzLnJlZnVzZUFwcGxpY2F0aW9uKTtcbiAgfVxuXG4gIHJlZnVzZUFwcGxpY2F0aW9uKCkge1xuICAgIHRoaXMudmlldy5tb2RlbC53YWl0ID0gZmFsc2U7XG4gICAgdGhpcy52aWV3Lm1vZGVsLnNvcnJ5ID0gdHJ1ZTtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCcuYmFja2dyb3VuZCcpO1xuICB9XG5cbiAgcnVuQXVkaW9QcmV2aWV3KHBsYXllcklkLCBwbGF5ZXJJZHMpIHtcbiAgICBjb25zdCBhdWRpb1NldHVwID0gdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIuZGF0YTtcbiAgICBjb25zdCBpbnN0cnVtZW50SWQgPSBpbnN0cnVtZW50TGlzdFtwbGF5ZXJJZF07XG4gICAgY29uc3QgaW5zdHJ1bWVudENvbmZpZyA9IGF1ZGlvU2V0dXAuaW5zdHJ1bWVudHNbaW5zdHJ1bWVudElkXTtcbiAgICBsZXQgbG9vcCA9IGluc3RydW1lbnRDb25maWcubG9vcDtcblxuICAgIGlmKEFycmF5LmlzQXJyYXkobG9vcCkpIHtcbiAgICAgIGNvbnN0IHByZXZpZXdTZWdtZW50SW5kZXggPSBpbnN0cnVtZW50Q29uZmlnLnByZXZpZXcgfHzCoDA7XG4gICAgICBsb29wID0gbG9vcFtwcmV2aWV3U2VnbWVudEluZGV4XTtcbiAgICB9XG5cbiAgICBjb25zdCB0aW1lID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IG1lYXN1cmVEdXJhdGlvbiA9IGF1ZGlvU2V0dXAuY29tbW9uLm1lYXN1cmVEdXJhdGlvbjtcbiAgICBjb25zdCBmYWRlVGltZSA9IDAuMDU7XG5cbiAgICBjb25zdCBlbnYgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIGVudi5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgZW52LmdhaW4udmFsdWUgPSAwO1xuICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgIGVudi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIHRpbWUgKyBmYWRlVGltZSk7XG5cbiAgICBjb25zdCBzcmMgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgc3JjLmNvbm5lY3QoZW52KTtcbiAgICBzcmMuYnVmZmVyID0gbG9vcC5hdWRpb0J1ZmZlcjtcbiAgICBzcmMuc3RhcnQodGltZSwgbG9vcC5zdGFydE9mZnNldCAtIGZhZGVUaW1lKTtcbiAgICBzcmMubG9vcFN0YXJ0ID0gbG9vcC5zdGFydE9mZnNldDtcbiAgICBzcmMubG9vcEVuZCA9IGxvb3Auc3RhcnRPZmZzZXQgKyBsb29wLmxlbmd0aCAqIG1lYXN1cmVEdXJhdGlvbjtcbiAgICBzcmMubG9vcCA9IHRydWU7XG5cbiAgICBjb25zdCBsZW5ndGggPSAyO1xuICAgIGNvbnN0IGVuZFRpbWUgPSB0aW1lICsgbGVuZ3RoICogbWVhc3VyZUR1cmF0aW9uO1xuICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDEsIGVuZFRpbWUpO1xuICAgIGVudi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGVuZFRpbWUgKyBmYWRlVGltZSk7XG4gICAgc3JjLnN0b3AoZW5kVGltZSArIGZhZGVUaW1lKTtcblxuICAgIHRoaXMudmlldy5tb2RlbC53YWl0ID0gZmFsc2U7XG4gICAgdGhpcy52aWV3Lm1vZGVsLnJ1biA9IHRydWU7XG4gICAgdGhpcy52aWV3LnJlbmRlcignLmJhY2tncm91bmQnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKGNsaWVudC5wbGF0Zm9ybSk7XG4gICAgY29uc3QgaW50ZXJhY3Rpb24gPSBjbGllbnQucGxhdGZvcm0uaW50ZXJhY3Rpb24gPT09ICd0b3VjaCcgP1xuICAgICAgJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bic7XG5cbiAgICB0aGlzLnZpZXcuaW5zdGFsbEV2ZW50cyh7XG4gICAgICBbaW50ZXJhY3Rpb25dOiAoKSA9PiB7XG4gICAgICAgIHRoaXMudmlldy5pbnN0YWxsRXZlbnRzKHt9LCB0cnVlKTtcbiAgICAgICAgdGhpcy52aWV3Lm1vZGVsLnJ1biA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpZXcucmVuZGVyKCcuYmFja2dyb3VuZCcpO1xuXG4gICAgICAgIC8vIGxhdW5jaCB0aGUgYWN0dWFsIGFwcGxpY2F0aW9uXG4gICAgICAgIHRoaXMucnVuQXBwbGljYXRpb24ocGxheWVySWQsIHBsYXllcklkcyk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcnVuQXBwbGljYXRpb24ocGxheWVySWQsIHBsYXllcklkcykge1xuICAgIHRoaXMucGxheWVySWQgPSBwbGF5ZXJJZDtcbiAgICB0aGlzLnBsYXllcklkcyA9IG5ldyBTZXQocGxheWVySWRzKTtcblxuICAgIGlmICh0aGlzLnBsYXllcklkID49IGluc3RydW1lbnRMaXN0Lmxlbmd0aClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCAob3V0IG9mIHJhbmdlKSBwbGF5ZXJJZCAtIHNvbWV0aGluZyBkb2Vzbid0IHdvcmsgcHJvcGVybHlgKTtcblxuICAgIGNvbnNvbGUubG9nKGluc3RydW1lbnRMaXN0KTtcbiAgICBjb25zb2xlLmxvZyhgPT4gUnVubmluZyBcIiR7aW5zdHJ1bWVudExpc3RbdGhpcy5wbGF5ZXJJZF19XCIgaW5zdHJ1bWVudCAoaWQ6ICR7dGhpcy5wbGF5ZXJJZH0pYCk7XG5cbiAgICAvLyBpbml0IGF1ZGlvXG4gICAgdGhpcy5sb29wUGxheWVyID0gbmV3IExvb3BQbGF5ZXIodGhpcy5tZXRyaWNTY2hlZHVsZXIsIDQgLyA0LCAxMjEsIDEgLyA0LCAwLjA1KTtcblxuICAgIHRoaXMubWl4ZXIgPSBuZXcgTWl4ZXIodGhpcy5tZXRyaWNTY2hlZHVsZXIpO1xuICAgIHRoaXMubWl4ZXIuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gICAgLy8gY3JlYXRlIGluc3RydW1lbnRzXG4gICAgY29uc3QgYXVkaW9TZXR1cCA9IHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyLmRhdGE7XG4gICAgY29uc3QgY29tbW9uQ29uZmlnID0gYXVkaW9TZXR1cC5jb21tb247XG4gICAgY29uc3QgbWV0cmljU2NoZWR1bGVyID0gdGhpcy5tZXRyaWNTY2hlZHVsZXI7XG4gICAgY29uc3QgcGxheWVySW5zdHJ1bWVudElkID0gaW5zdHJ1bWVudExpc3RbdGhpcy5wbGF5ZXJJZF07XG4gICAgY29uc3QgaXNTb2xvID0gYXVkaW9TZXR1cC5pbnN0cnVtZW50c1twbGF5ZXJJbnN0cnVtZW50SWRdLnNvbG87XG5cbiAgICAvLyBsb29wIHRyYWNrIHRlc3RcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbnVtSW5zdHJ1bWVudHM7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGluc3RydW1lbnRJZCA9IGluc3RydW1lbnRMaXN0W2luZGV4XTtcbiAgICAgIGNvbnN0IGluc3RydW1lbnRDb25maWcgPSBhdWRpb1NldHVwLmluc3RydW1lbnRzW2luc3RydW1lbnRJZF07XG4gICAgICAvLyBpbml0IGluc3RydW1lbnQgYXVkaW9cbiAgICAgIGNvbnN0IGxvb3AgPSBpbnN0cnVtZW50Q29uZmlnLmxvb3A7XG4gICAgICBjb25zdCBhdWRpb0J1ZmZlciA9IGxvb3AuYnVmZmVyO1xuXG4gICAgICBjb25zdCBsb29wVHJhY2sgPSB0aGlzLmxvb3BQbGF5ZXIuYWRkTG9vcFRyYWNrKGluZGV4LCBsb29wKTtcbiAgICAgIHRoaXMubWl4ZXIuY3JlYXRlQ2hhbm5lbChpbmRleCwgbG9vcFRyYWNrKTtcblxuICAgICAgLy8gQGRlYnVnOiBzdGFydCBhbGwgaW5zdHJ1bWVudHNcbiAgICAgIC8vIGNvbnN0IGdhaW4gPSAoaSA9PT0gdGhpcy5wbGF5ZXJJZCkgPyAxIDogMC4xO1xuICAgICAgLy8gdGhpcy5taXhlci5zZXRHYWluKGluc3RydW1lbnRJZCwgZ2Fpbik7XG4gICAgICAvLyBsb29wVHJhY2suYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgLy8gaW5pdCB2aWV3IGlmIGxvY2FsIGluc3RydW1lbnRcbiAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5wbGF5ZXJJZCkge1xuICAgICAgICB0aGlzLm1peGVyLnNldEdhaW4oaW5kZXgsIDEpO1xuICAgICAgICBsb29wVHJhY2suYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBkaXNwbGF5Q29uZmlnID0gaW5zdHJ1bWVudENvbmZpZy5kaXNwbGF5O1xuXG4gICAgICAgIGlmIChkaXNwbGF5Q29uZmlnKSB7XG4gICAgICAgICAgZGlzcGxheUNvbmZpZy5wbGF5ZXJJZCA9IHRoaXMucGxheWVySWQ7XG4gICAgICAgICAgY29uc3QgaW5zdHJ1bWVudFZpZXcgPSBuZXcgQ2lyY3VsYXJWaWV3KGNvbW1vbkNvbmZpZywgZGlzcGxheUNvbmZpZywgbWV0cmljU2NoZWR1bGVyKTtcbiAgICAgICAgICBpbnN0cnVtZW50Vmlldy5yZW5kZXIoKTtcbiAgICAgICAgICBpbnN0cnVtZW50Vmlldy5zaG93KCk7XG4gICAgICAgICAgaW5zdHJ1bWVudFZpZXcuYXBwZW5kVG8odGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjaW5zdHJ1bWVudC1jb250YWluZXInKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JywgdGhpcy5vbkFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkpO1xuXG4gICAgdGhpcy5yZWNlaXZlKCdjdXRvZmY6Y29udHJvbCcsIHRoaXMub25DdXRvZmZDb250cm9sKTtcbiAgICB0aGlzLnJlY2VpdmUoJ3BsYXllcjplbnRlcmVkJywgdGhpcy5vblBsYXllckVudGVyZWQpO1xuICAgIHRoaXMucmVjZWl2ZSgncGxheWVyOmV4aXQnLCB0aGlzLm9uUGxheWVyRXhpdCk7XG5cbiAgICB0aGlzLmJlYWNvbi5taW5vciA9IHRoaXMucGxheWVySWQ7XG4gICAgdGhpcy5iZWFjb24uYWRkTGlzdGVuZXIodGhpcy5vbkJlYWNvblJhbmdpbmcpO1xuICAgIHRoaXMuYmVhY29uLnN0YXJ0QWR2ZXJ0aXNpbmcoKTtcbiAgICB0aGlzLmJlYWNvbi5zdGFydFJhbmdpbmcoKTtcbiAgfVxuXG4gIG9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eShkYXRhKSB7XG4gICAgY29uc3QgYWNjWCA9IGRhdGFbMF07XG4gICAgY29uc3QgYWNjWSA9IGRhdGFbMV07XG4gICAgY29uc3QgYWNjWiA9IGRhdGFbMl07XG5cbiAgICBjb25zdCBwaXRjaCA9IDIgKiBNYXRoLmF0YW4yKGFjY1ksIE1hdGguc3FydChhY2NaICogYWNjWiArIGFjY1ggKiBhY2NYKSkgLyBNYXRoLlBJO1xuICAgIGNvbnN0IHJvbGwgPSAtMiAqIE1hdGguYXRhbjIoYWNjWCwgTWF0aC5zcXJ0KGFjY1kgKiBhY2NZICsgYWNjWiAqIGFjY1opKSAvIE1hdGguUEk7XG4gICAgY29uc3QgY3V0b2ZmID0gMC41ICsgTWF0aC5tYXgoLTAuOCwgTWF0aC5taW4oMC44LCAoYWNjWiAvIDkuODEpKSkgLyAxLjY7XG5cbiAgICBpZiAoTWF0aC5hYnMoY3V0b2ZmIC0gdGhpcy5sYXN0Q3V0b2ZmKSA+IDAuMDEpIHtcbiAgICAgIHRoaXMubGFzdEN1dG9mZiA9IGN1dG9mZjtcbiAgICAgIC8vIHVwZGF0ZSBsb2NhbCBhdWRpb1xuICAgICAgdGhpcy5sb29wUGxheWVyLnNldEN1dG9mZih0aGlzLnBsYXllcklkLCBjdXRvZmYpO1xuICAgICAgLy8gdXBkYXRlIHNlcnZlciAoaGVuY2UgbmVpZ2hib3JzKVxuICAgICAgdGhpcy5zZW5kKCdjdXRvZmY6Y29udHJvbCcsIHRoaXMucGxheWVySWQsIGN1dG9mZik7XG4gICAgfVxuICB9XG5cbiAgb25DdXRvZmZDb250cm9sKHBsYXllcklkLCB2YWx1ZSkge1xuICAgIHRoaXMubG9vcFBsYXllci5zZXRDdXRvZmYocGxheWVySWQsIHZhbHVlKTtcbiAgfVxuXG4gIG9uUGxheWVyRW50ZXJlZChwbGF5ZXJJZCkge1xuICAgIHRoaXMucGxheWVySWRzLmFkZChwbGF5ZXJJZCk7XG4gIH1cblxuICBvblBsYXllckV4aXQocGxheWVySWQpIHtcbiAgICAvLyByZXNldCBtaXhlciBhbmQgc3RvcCB0cmFja1xuICAgIHRoaXMubWl4ZXIuc2V0QXV0b21hdGlvbihwbGF5ZXJJZCwgMCwgMC4wNSk7XG4gICAgdGhpcy5sb29wUGxheWVyLmdldExvb3BUcmFjayhwbGF5ZXJJZCkuYWN0aXZlID0gZmFsc2U7XG5cbiAgICB0aGlzLnBsYXllcklkcy5kZWxldGUocGxheWVySWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEB3YXJuaW5nIC0gYSBwZWVyIHdobyBraWxsIGl0cyBhcHAgc3RpbGwgc2VuZCBiZWFjb24gaW5mb3JtYXRpb25zIGZvclxuICAgKiBhcm91bmQgMTAgc2Vjb25kcy4gVGhhdCdzIHdoeSB3ZSBtdXN0IGtlZXAgYSBib29raW5nIG9mIHRoZSBjb25uZWN0ZWRcbiAgICogY2xpZW50dHMgYWNjb3JkaW5nIHRvIHRoZSBzZXJ2ZXIgaW5mb3JtYXRpb25zLlxuICAgKi9cbiAgb25CZWFjb25SYW5naW5nKHBsdWdpblJlc3VsdHMpIHtcbiAgICBjb25zdCBvZmZUaHJlc2hvbGQgPSAtNjA7XG5cbiAgICBwbHVnaW5SZXN1bHRzLmJlYWNvbnMuZm9yRWFjaCgoYmVhY29uLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGJlYWNvbi5taW5vciA9PT0gdGhpcy5wbGF5ZXJJZClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBlZXIgYmVhY29uIG1pbm9yLCBpcyBlcXVhbCB0byB0aGlzLnBsYXllcklkJyk7XG5cbiAgICAgIGNvbnN0IHBsYXllcklkID0gYmVhY29uLm1pbm9yO1xuXG4gICAgICAvLyBwcmV2ZW50IGV4aXRlZCBwbGF5ZXJzIHRvIHRyaWdnZXIgYXV0b21hdGlvbiBhbmQgYWN0aXZhdGlvblxuICAgICAgaWYgKHRoaXMucGxheWVySWRzLmhhcyhwbGF5ZXJJZCkpIHtcbiAgICAgICAgY29uc3QgaW5zdHJ1bWVudElkID0gaW5zdHJ1bWVudExpc3RbcGxheWVySWRdO1xuICAgICAgICBjb25zdCBpbnN0cnVtZW50ID0gc2V0dXAuaW5zdHJ1bWVudHNbaW5zdHJ1bWVudElkXTtcbiAgICAgICAgY29uc3QgZXN0aW1hdGVkRGlzdGFuY2UgPSB0aGlzLmJlYWNvbi5yc3NpVG9EaXN0KGJlYWNvbi5yc3NpKTtcbiAgICAgICAgY29uc3QgY29uc3RSYWRpdXMgPSBpbnN0cnVtZW50LmNvbnN0UmFkaXVzICE9PSB1bmRlZmluZWQgPyBpbnN0cnVtZW50LmNvbnN0UmFkaXVzIDogMTtcbiAgICAgICAgY29uc3Qgb2ZmUmFkaXVzID0gaW5zdHJ1bWVudC5vZmZSYWRpdXMgIT09IHVuZGVmaW5lZCA/IGluc3RydW1lbnQub2ZmUmFkaXVzIDogMztcbiAgICAgICAgbGV0IGdhaW4gPSAwO1xuXG4gICAgICAgIGlmIChlc3RpbWF0ZWREaXN0YW5jZSA8IG9mZlJhZGl1cykge1xuICAgICAgICAgIGdhaW4gPSAxO1xuXG4gICAgICAgICAgaWYgKGVzdGltYXRlZERpc3RhbmNlID4gY29uc3RSYWRpdXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxldmVsID0gb2ZmVGhyZXNob2xkICogKGVzdGltYXRlZERpc3RhbmNlIC0gY29uc3RSYWRpdXMpIC8gKG9mZlJhZGl1cyAtIGNvbnN0UmFkaXVzKTtcbiAgICAgICAgICAgIGdhaW4gPSBkZWNpYmVsVG9MaW5lYXIobGV2ZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWl4ZXIuc2V0QXV0b21hdGlvbihwbGF5ZXJJZCwgZ2FpbiwgMC41KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXJFeHBlcmllbmNlO1xuIl19