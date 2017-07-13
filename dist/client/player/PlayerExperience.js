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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBsYXllckV4cGVyaWVuY2UuanMiXSwibmFtZXMiOlsic291bmR3b3JrcyIsImNsaWVudCIsImF1ZGlvIiwiYXVkaW9Db250ZXh0IiwiYXVkaW9TY2hlZHVsZXIiLCJnZXRTY2hlZHVsZXIiLCJsb29rYWhlYWQiLCJwZXJpb2QiLCJpbnN0cnVtZW50TGlzdCIsImluc3RydW1lbnRzIiwibnVtSW5zdHJ1bWVudHMiLCJsZW5ndGgiLCJ0ZW1wbyIsImJlYXREdXJhdGlvbiIsIm1lYXN1cmVEdXJhdGlvbiIsInZpZXdUZW1wbGF0ZSIsIlBsYXllckV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJiZWFjb25VVUlEIiwicGxhdGZvcm0iLCJyZXF1aXJlIiwiZmVhdHVyZXMiLCJtZXRyaWNTY2hlZHVsZXIiLCJhdWRpb0J1ZmZlck1hbmFnZXIiLCJmaWxlcyIsIm1vdGlvbklucHV0IiwiZGVzY3JpcHRvcnMiLCJiZWFjb25Db25maWciLCJ1dWlkIiwidHhQb3dlciIsIm1ham9yIiwic2tpcFNlcnZpY2UiLCJkZWJ1ZyIsImVtdWxhdGUiLCJ3aW5kb3ciLCJjb3Jkb3ZhIiwibnVtUGVlcnMiLCJiZWFjb24iLCJwbGF5ZXJJZCIsImludHJ1bWVudENvbmZpZyIsInBsYXllcklkcyIsIm9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSIsImJpbmQiLCJvbkJlYWNvblJhbmdpbmciLCJvbkN1dG9mZkNvbnRyb2wiLCJvblBsYXllckVudGVyZWQiLCJvblBsYXllckV4aXQiLCJydW5BdWRpb1ByZXZpZXciLCJydW5BcHBsaWNhdGlvbiIsInJlZnVzZUFwcGxpY2F0aW9uIiwidmlld01vZGVsIiwid2FpdCIsInJ1biIsInNvcnJ5IiwidmlldyIsIlNlZ21lbnRlZFZpZXciLCJzaG93IiwidXJsUGFyYW1zIiwiaW50cnVtZW50TmFtZSIsImpvaW4iLCJpbmRleCIsImluZGV4T2YiLCJsYXN0Q3V0b2ZmIiwiSW5maW5pdHkiLCJzZW5kIiwicmVjZWl2ZSIsIm1vZGVsIiwicmVuZGVyIiwiYXVkaW9TZXR1cCIsImRhdGEiLCJpbnN0cnVtZW50SWQiLCJpbnN0cnVtZW50Q29uZmlnIiwibG9vcCIsIkFycmF5IiwiaXNBcnJheSIsInByZXZpZXdTZWdtZW50SW5kZXgiLCJwcmV2aWV3IiwidGltZSIsImN1cnJlbnRUaW1lIiwiY29tbW9uIiwiZmFkZVRpbWUiLCJlbnYiLCJjcmVhdGVHYWluIiwiY29ubmVjdCIsImRlc3RpbmF0aW9uIiwiZ2FpbiIsInZhbHVlIiwic2V0VmFsdWVBdFRpbWUiLCJsaW5lYXJSYW1wVG9WYWx1ZUF0VGltZSIsInNyYyIsImNyZWF0ZUJ1ZmZlclNvdXJjZSIsImJ1ZmZlciIsImF1ZGlvQnVmZmVyIiwic3RhcnQiLCJzdGFydE9mZnNldCIsImxvb3BTdGFydCIsImxvb3BFbmQiLCJlbmRUaW1lIiwic3RvcCIsImludGVyYWN0aW9uIiwiaW5zdGFsbEV2ZW50cyIsIkVycm9yIiwiY29uc29sZSIsImxvZyIsImxvb3BQbGF5ZXIiLCJtaXhlciIsImNvbW1vbkNvbmZpZyIsInBsYXllckluc3RydW1lbnRJZCIsImlzU29sbyIsInNvbG8iLCJsb29wVHJhY2siLCJhZGRMb29wVHJhY2siLCJjcmVhdGVDaGFubmVsIiwic2V0R2FpbiIsImFjdGl2ZSIsImRpc3BsYXlDb25maWciLCJkaXNwbGF5IiwiaW5zdHJ1bWVudFZpZXciLCJhcHBlbmRUbyIsIiRlbCIsInF1ZXJ5U2VsZWN0b3IiLCJhZGRMaXN0ZW5lciIsIm1pbm9yIiwic3RhcnRBZHZlcnRpc2luZyIsInN0YXJ0UmFuZ2luZyIsImFjY1giLCJhY2NZIiwiYWNjWiIsInBpdGNoIiwiTWF0aCIsImF0YW4yIiwic3FydCIsIlBJIiwicm9sbCIsImN1dG9mZiIsIm1heCIsIm1pbiIsImFicyIsInNldEN1dG9mZiIsImFkZCIsInNldEF1dG9tYXRpb24iLCJnZXRMb29wVHJhY2siLCJkZWxldGUiLCJwbHVnaW5SZXN1bHRzIiwib2ZmVGhyZXNob2xkIiwiYmVhY29ucyIsImZvckVhY2giLCJoYXMiLCJpbnN0cnVtZW50IiwiZXN0aW1hdGVkRGlzdGFuY2UiLCJyc3NpVG9EaXN0IiwicnNzaSIsImNvbnN0UmFkaXVzIiwidW5kZWZpbmVkIiwib2ZmUmFkaXVzIiwibGV2ZWwiLCJFeHBlcmllbmNlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU1DLFNBQVNELFdBQVdDLE1BQTFCO0FBQ0EsSUFBTUMsUUFBUUYsV0FBV0UsS0FBekI7QUFDQSxJQUFNQyxlQUFlSCxXQUFXRyxZQUFoQztBQUNBLElBQU1DLGlCQUFpQkosV0FBV0UsS0FBWCxDQUFpQkcsWUFBakIsRUFBdkI7O0FBRUFELGVBQWVFLFNBQWYsR0FBMkIsR0FBM0I7QUFDQUYsZUFBZUcsTUFBZixHQUF3QixJQUF4Qjs7QUFFQSxJQUFNQyxpQkFBaUIsb0JBQVksZ0JBQU1DLFdBQWxCLENBQXZCO0FBQ0EsSUFBTUMsaUJBQWlCRixlQUFlRyxNQUF0Qzs7QUFFQSxJQUFNQyxRQUFRLEdBQWQ7QUFDQSxJQUFNQyxlQUFlLEtBQUtELEtBQTFCO0FBQ0EsSUFBTUUsa0JBQWtCLElBQUlELFlBQTVCOztBQUVBLElBQU1FLDZzQkFBTjs7SUF3Qk1DLGdCOzs7QUFDSiw0QkFBWUMsWUFBWixFQUEwQkMsVUFBMUIsRUFBc0M7QUFBQTs7QUFBQTs7QUFHcEMsVUFBS0MsUUFBTCxHQUFnQixNQUFLQyxPQUFMLENBQWEsVUFBYixFQUF5QixFQUFFQyxVQUFVLENBQUMsV0FBRCxDQUFaLEVBQXpCLENBQWhCO0FBQ0EsVUFBS0MsZUFBTCxHQUF1QixNQUFLRixPQUFMLENBQWEsa0JBQWIsQ0FBdkI7O0FBRUEsVUFBS0csa0JBQUwsR0FBMEIsTUFBS0gsT0FBTCxDQUFhLHNCQUFiLEVBQXFDO0FBQzdESCxvQkFBY0EsZUFBZSxTQURnQztBQUU3RE87QUFGNkQsS0FBckMsQ0FBMUI7O0FBS0EsVUFBS0MsV0FBTCxHQUFtQixNQUFLTCxPQUFMLENBQWEsY0FBYixFQUE2QjtBQUM5Q00sbUJBQWEsQ0FBQyw4QkFBRDtBQURpQyxLQUE3QixDQUFuQjs7QUFJQSxRQUFNQyxlQUFlO0FBQ25CQyxZQUFNVixVQURhO0FBRW5CVyxlQUFTLENBQUMsRUFGUyxFQUVMO0FBQ2RDLGFBQU8sQ0FIWTtBQUluQkMsbUJBQWEsS0FKTTtBQUtuQkMsYUFBTztBQUxZLEtBQXJCOztBQVFBTCxpQkFBYU0sT0FBYixHQUF3QixDQUFDLENBQUNDLE9BQU9DLE9BQVYsR0FBcUIsSUFBckIsR0FBNEIsRUFBRUMsVUFBVSxDQUFaLEVBQW5EO0FBQ0EsVUFBS0MsTUFBTCxHQUFjLE1BQUtqQixPQUFMLENBQWEsUUFBYixFQUF1Qk8sWUFBdkIsQ0FBZDs7QUFFQSxVQUFLVyxRQUFMLEdBQWdCLElBQWhCO0FBQ0EsVUFBS0MsZUFBTCxHQUF1QixJQUF2QjtBQUNBLFVBQUtDLFNBQUwsR0FBaUIsSUFBakI7O0FBRUEsVUFBS0MsOEJBQUwsR0FBc0MsTUFBS0EsOEJBQUwsQ0FBb0NDLElBQXBDLE9BQXRDO0FBQ0EsVUFBS0MsZUFBTCxHQUF1QixNQUFLQSxlQUFMLENBQXFCRCxJQUFyQixPQUF2QjtBQUNBLFVBQUtFLGVBQUwsR0FBdUIsTUFBS0EsZUFBTCxDQUFxQkYsSUFBckIsT0FBdkI7QUFDQSxVQUFLRyxlQUFMLEdBQXVCLE1BQUtBLGVBQUwsQ0FBcUJILElBQXJCLE9BQXZCO0FBQ0EsVUFBS0ksWUFBTCxHQUFvQixNQUFLQSxZQUFMLENBQWtCSixJQUFsQixPQUFwQjtBQUNBLFVBQUtLLGVBQUwsR0FBdUIsTUFBS0EsZUFBTCxDQUFxQkwsSUFBckIsT0FBdkI7QUFDQSxVQUFLTSxjQUFMLEdBQXNCLE1BQUtBLGNBQUwsQ0FBb0JOLElBQXBCLE9BQXRCO0FBQ0EsVUFBS08saUJBQUwsR0FBeUIsTUFBS0EsaUJBQUwsQ0FBdUJQLElBQXZCLE9BQXpCO0FBckNvQztBQXNDckM7Ozs7NEJBRU87QUFDTjs7QUFFQSxVQUFNUSxZQUFZO0FBQ2hCQyxjQUFNLElBRFU7QUFFaEJDLGFBQUssS0FGVztBQUdoQkMsZUFBTztBQUhTLE9BQWxCO0FBS0EsV0FBS0MsSUFBTCxHQUFZLElBQUl0RCxXQUFXdUQsYUFBZixDQUE2QnhDLFlBQTdCLEVBQTJDbUMsU0FBM0MsRUFBc0QsRUFBdEQsRUFBMEQsRUFBMUQsQ0FBWjtBQUNBLFdBQUtNLElBQUw7O0FBRUEsVUFBSXZELE9BQU93RCxTQUFQLEtBQXFCLElBQXpCLEVBQStCO0FBQzdCLFlBQU1DLGdCQUFnQnpELE9BQU93RCxTQUFQLENBQWlCRSxJQUFqQixDQUFzQixHQUF0QixDQUF0QjtBQUNBLFlBQU1DLFFBQVFwRCxlQUFlcUQsT0FBZixDQUF1QkgsYUFBdkIsQ0FBZDs7QUFFQSxZQUFJRSxVQUFVLENBQUMsQ0FBZixFQUNFLEtBQUt0QixRQUFMLEdBQWdCc0IsS0FBaEI7QUFDSDs7QUFFRCxXQUFLRSxVQUFMLEdBQWtCLENBQUNDLFFBQW5COztBQUVBLFdBQUtDLElBQUwsQ0FBVSxjQUFWLEVBQTBCLEtBQUsxQixRQUEvQjtBQUNBLFdBQUsyQixPQUFMLENBQWEsWUFBYixFQUEyQixLQUFLbEIsZUFBaEM7QUFDQSxXQUFLa0IsT0FBTCxDQUFhLGdCQUFiLEVBQStCLEtBQUtoQixpQkFBcEM7QUFDRDs7O3dDQUVtQjtBQUNsQixXQUFLSyxJQUFMLENBQVVZLEtBQVYsQ0FBZ0JmLElBQWhCLEdBQXVCLEtBQXZCO0FBQ0EsV0FBS0csSUFBTCxDQUFVWSxLQUFWLENBQWdCYixLQUFoQixHQUF3QixJQUF4QjtBQUNBLFdBQUtDLElBQUwsQ0FBVWEsTUFBVixDQUFpQixhQUFqQjtBQUNEOzs7b0NBRWU3QixRLEVBQVVFLFMsRUFBVztBQUFBOztBQUNuQyxVQUFNNEIsYUFBYSxLQUFLN0Msa0JBQUwsQ0FBd0I4QyxJQUEzQztBQUNBLFVBQU1DLGVBQWU5RCxlQUFlOEIsUUFBZixDQUFyQjtBQUNBLFVBQU1pQyxtQkFBbUJILFdBQVczRCxXQUFYLENBQXVCNkQsWUFBdkIsQ0FBekI7QUFDQSxVQUFJRSxPQUFPRCxpQkFBaUJDLElBQTVCOztBQUVBLFVBQUdDLE1BQU1DLE9BQU4sQ0FBY0YsSUFBZCxDQUFILEVBQXdCO0FBQ3RCLFlBQU1HLHNCQUFzQkosaUJBQWlCSyxPQUFqQixJQUE0QixDQUF4RDtBQUNBSixlQUFPQSxLQUFLRyxtQkFBTCxDQUFQO0FBQ0Q7O0FBRUQsVUFBTUUsT0FBTzFFLGFBQWEyRSxXQUExQjtBQUNBLFVBQU1oRSxrQkFBa0JzRCxXQUFXVyxNQUFYLENBQWtCakUsZUFBMUM7QUFDQSxVQUFNa0UsV0FBVyxJQUFqQjs7QUFFQSxVQUFNQyxNQUFNOUUsYUFBYStFLFVBQWIsRUFBWjtBQUNBRCxVQUFJRSxPQUFKLENBQVloRixhQUFhaUYsV0FBekI7QUFDQUgsVUFBSUksSUFBSixDQUFTQyxLQUFULEdBQWlCLENBQWpCO0FBQ0FMLFVBQUlJLElBQUosQ0FBU0UsY0FBVCxDQUF3QixDQUF4QixFQUEyQlYsSUFBM0I7QUFDQUksVUFBSUksSUFBSixDQUFTRyx1QkFBVCxDQUFpQyxDQUFqQyxFQUFvQ1gsT0FBT0csUUFBM0M7O0FBRUEsVUFBTVMsTUFBTXRGLGFBQWF1RixrQkFBYixFQUFaO0FBQ0FELFVBQUlOLE9BQUosQ0FBWUYsR0FBWjtBQUNBUSxVQUFJRSxNQUFKLEdBQWFuQixLQUFLb0IsV0FBbEI7QUFDQUgsVUFBSUksS0FBSixDQUFVaEIsSUFBVixFQUFnQkwsS0FBS3NCLFdBQUwsR0FBbUJkLFFBQW5DO0FBQ0FTLFVBQUlNLFNBQUosR0FBZ0J2QixLQUFLc0IsV0FBckI7QUFDQUwsVUFBSU8sT0FBSixHQUFjeEIsS0FBS3NCLFdBQUwsR0FBbUJ0QixLQUFLN0QsTUFBTCxHQUFjRyxlQUEvQztBQUNBMkUsVUFBSWpCLElBQUosR0FBVyxJQUFYOztBQUVBLFVBQU03RCxTQUFTLENBQWY7QUFDQSxVQUFNc0YsVUFBVXBCLE9BQU9sRSxTQUFTRyxlQUFoQztBQUNBbUUsVUFBSUksSUFBSixDQUFTRSxjQUFULENBQXdCLENBQXhCLEVBQTJCVSxPQUEzQjtBQUNBaEIsVUFBSUksSUFBSixDQUFTRyx1QkFBVCxDQUFpQyxDQUFqQyxFQUFvQ1MsVUFBVWpCLFFBQTlDO0FBQ0FTLFVBQUlTLElBQUosQ0FBU0QsVUFBVWpCLFFBQW5COztBQUVBLFdBQUsxQixJQUFMLENBQVVZLEtBQVYsQ0FBZ0JmLElBQWhCLEdBQXVCLEtBQXZCO0FBQ0EsV0FBS0csSUFBTCxDQUFVWSxLQUFWLENBQWdCZCxHQUFoQixHQUFzQixJQUF0QjtBQUNBLFdBQUtFLElBQUwsQ0FBVWEsTUFBVixDQUFpQixhQUFqQjs7QUFFQTtBQUNBLFVBQU1nQyxjQUFjbEcsT0FBT2tCLFFBQVAsQ0FBZ0JnRixXQUFoQixLQUFnQyxPQUFoQyxHQUNsQixZQURrQixHQUNILFdBRGpCOztBQUdBLFdBQUs3QyxJQUFMLENBQVU4QyxhQUFWLG1DQUNHRCxXQURILEVBQ2lCLFlBQU07QUFDbkIsZUFBSzdDLElBQUwsQ0FBVThDLGFBQVYsQ0FBd0IsRUFBeEIsRUFBNEIsSUFBNUI7QUFDQSxlQUFLOUMsSUFBTCxDQUFVWSxLQUFWLENBQWdCZCxHQUFoQixHQUFzQixLQUF0QjtBQUNBLGVBQUtFLElBQUwsQ0FBVWEsTUFBVixDQUFpQixhQUFqQjs7QUFFQTtBQUNBLGVBQUtuQixjQUFMLENBQW9CVixRQUFwQixFQUE4QkUsU0FBOUI7QUFDRCxPQVJIO0FBVUQ7OzttQ0FFY0YsUSxFQUFVRSxTLEVBQVc7QUFDbEMsV0FBS0YsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxXQUFLRSxTQUFMLEdBQWlCLGtCQUFRQSxTQUFSLENBQWpCOztBQUVBLFVBQUksS0FBS0YsUUFBTCxJQUFpQjlCLGVBQWVHLE1BQXBDLEVBQ0UsTUFBTSxJQUFJMEYsS0FBSixzRUFBTjs7QUFFRkMsY0FBUUMsR0FBUixDQUFZL0YsY0FBWjtBQUNBOEYsY0FBUUMsR0FBUixrQkFBMkIvRixlQUFlLEtBQUs4QixRQUFwQixDQUEzQiwwQkFBNkUsS0FBS0EsUUFBbEY7O0FBRUE7QUFDQSxXQUFLa0UsVUFBTCxHQUFrQix5QkFBZSxLQUFLbEYsZUFBcEIsRUFBcUMsSUFBSSxDQUF6QyxFQUE0QyxHQUE1QyxFQUFpRCxJQUFJLENBQXJELEVBQXdELElBQXhELENBQWxCOztBQUVBLFdBQUttRixLQUFMLEdBQWEsb0JBQVUsS0FBS25GLGVBQWYsQ0FBYjtBQUNBLFdBQUttRixLQUFMLENBQVd0QixPQUFYLENBQW1CaEYsYUFBYWlGLFdBQWhDOztBQUVBO0FBQ0EsVUFBTWhCLGFBQWEsS0FBSzdDLGtCQUFMLENBQXdCOEMsSUFBM0M7QUFDQSxVQUFNcUMsZUFBZXRDLFdBQVdXLE1BQWhDO0FBQ0EsVUFBTXpELGtCQUFrQixLQUFLQSxlQUE3QjtBQUNBLFVBQU1xRixxQkFBcUJuRyxlQUFlLEtBQUs4QixRQUFwQixDQUEzQjtBQUNBLFVBQU1zRSxTQUFTeEMsV0FBVzNELFdBQVgsQ0FBdUJrRyxrQkFBdkIsRUFBMkNFLElBQTFEOztBQUVBO0FBQ0EsV0FBSyxJQUFJakQsUUFBUSxDQUFqQixFQUFvQkEsUUFBUWxELGNBQTVCLEVBQTRDa0QsT0FBNUMsRUFBcUQ7QUFDbkQsWUFBTVUsZUFBZTlELGVBQWVvRCxLQUFmLENBQXJCO0FBQ0EsWUFBTVcsbUJBQW1CSCxXQUFXM0QsV0FBWCxDQUF1QjZELFlBQXZCLENBQXpCO0FBQ0E7QUFDQSxZQUFNRSxPQUFPRCxpQkFBaUJDLElBQTlCO0FBQ0EsWUFBTW9CLGNBQWNwQixLQUFLbUIsTUFBekI7O0FBRUEsWUFBTW1CLFlBQVksS0FBS04sVUFBTCxDQUFnQk8sWUFBaEIsQ0FBNkJuRCxLQUE3QixFQUFvQ1ksSUFBcEMsQ0FBbEI7QUFDQSxhQUFLaUMsS0FBTCxDQUFXTyxhQUFYLENBQXlCcEQsS0FBekIsRUFBZ0NrRCxTQUFoQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFlBQUlsRCxVQUFVLEtBQUt0QixRQUFuQixFQUE2QjtBQUMzQixlQUFLbUUsS0FBTCxDQUFXUSxPQUFYLENBQW1CckQsS0FBbkIsRUFBMEIsQ0FBMUI7QUFDQWtELG9CQUFVSSxNQUFWLEdBQW1CLElBQW5COztBQUVBLGNBQU1DLGdCQUFnQjVDLGlCQUFpQjZDLE9BQXZDOztBQUVBLGNBQUlELGFBQUosRUFBbUI7QUFDakJBLDBCQUFjN0UsUUFBZCxHQUF5QixLQUFLQSxRQUE5QjtBQUNBLGdCQUFNK0UsaUJBQWlCLDJCQUFpQlgsWUFBakIsRUFBK0JTLGFBQS9CLEVBQThDN0YsZUFBOUMsQ0FBdkI7QUFDQStGLDJCQUFlbEQsTUFBZjtBQUNBa0QsMkJBQWU3RCxJQUFmO0FBQ0E2RCwyQkFBZUMsUUFBZixDQUF3QixLQUFLaEUsSUFBTCxDQUFVaUUsR0FBVixDQUFjQyxhQUFkLENBQTRCLHVCQUE1QixDQUF4QjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRCxXQUFLL0YsV0FBTCxDQUFpQmdHLFdBQWpCLENBQTZCLDhCQUE3QixFQUE2RCxLQUFLaEYsOEJBQWxFOztBQUVBLFdBQUt3QixPQUFMLENBQWEsZ0JBQWIsRUFBK0IsS0FBS3JCLGVBQXBDO0FBQ0EsV0FBS3FCLE9BQUwsQ0FBYSxnQkFBYixFQUErQixLQUFLcEIsZUFBcEM7QUFDQSxXQUFLb0IsT0FBTCxDQUFhLGFBQWIsRUFBNEIsS0FBS25CLFlBQWpDOztBQUVBLFdBQUtULE1BQUwsQ0FBWXFGLEtBQVosR0FBb0IsS0FBS3BGLFFBQXpCO0FBQ0EsV0FBS0QsTUFBTCxDQUFZb0YsV0FBWixDQUF3QixLQUFLOUUsZUFBN0I7QUFDQSxXQUFLTixNQUFMLENBQVlzRixnQkFBWjtBQUNBLFdBQUt0RixNQUFMLENBQVl1RixZQUFaO0FBQ0Q7OzttREFFOEJ2RCxJLEVBQU07QUFDbkMsVUFBTXdELE9BQU94RCxLQUFLLENBQUwsQ0FBYjtBQUNBLFVBQU15RCxPQUFPekQsS0FBSyxDQUFMLENBQWI7QUFDQSxVQUFNMEQsT0FBTzFELEtBQUssQ0FBTCxDQUFiOztBQUVBLFVBQU0yRCxRQUFRLElBQUlDLEtBQUtDLEtBQUwsQ0FBV0osSUFBWCxFQUFpQkcsS0FBS0UsSUFBTCxDQUFVSixPQUFPQSxJQUFQLEdBQWNGLE9BQU9BLElBQS9CLENBQWpCLENBQUosR0FBNkRJLEtBQUtHLEVBQWhGO0FBQ0EsVUFBTUMsT0FBTyxDQUFDLENBQUQsR0FBS0osS0FBS0MsS0FBTCxDQUFXTCxJQUFYLEVBQWlCSSxLQUFLRSxJQUFMLENBQVVMLE9BQU9BLElBQVAsR0FBY0MsT0FBT0EsSUFBL0IsQ0FBakIsQ0FBTCxHQUE4REUsS0FBS0csRUFBaEY7QUFDQSxVQUFNRSxTQUFTLE1BQU1MLEtBQUtNLEdBQUwsQ0FBUyxDQUFDLEdBQVYsRUFBZU4sS0FBS08sR0FBTCxDQUFTLEdBQVQsRUFBZVQsT0FBTyxJQUF0QixDQUFmLElBQStDLEdBQXBFOztBQUVBLFVBQUlFLEtBQUtRLEdBQUwsQ0FBU0gsU0FBUyxLQUFLeEUsVUFBdkIsSUFBcUMsSUFBekMsRUFBK0M7QUFDN0MsYUFBS0EsVUFBTCxHQUFrQndFLE1BQWxCO0FBQ0E7QUFDQSxhQUFLOUIsVUFBTCxDQUFnQmtDLFNBQWhCLENBQTBCLEtBQUtwRyxRQUEvQixFQUF5Q2dHLE1BQXpDO0FBQ0E7QUFDQSxhQUFLdEUsSUFBTCxDQUFVLGdCQUFWLEVBQTRCLEtBQUsxQixRQUFqQyxFQUEyQ2dHLE1BQTNDO0FBQ0Q7QUFDRjs7O29DQUVlaEcsUSxFQUFVZ0QsSyxFQUFPO0FBQy9CLFdBQUtrQixVQUFMLENBQWdCa0MsU0FBaEIsQ0FBMEJwRyxRQUExQixFQUFvQ2dELEtBQXBDO0FBQ0Q7OztvQ0FFZWhELFEsRUFBVTtBQUN4QixXQUFLRSxTQUFMLENBQWVtRyxHQUFmLENBQW1CckcsUUFBbkI7QUFDRDs7O2lDQUVZQSxRLEVBQVU7QUFDckI7QUFDQSxXQUFLbUUsS0FBTCxDQUFXbUMsYUFBWCxDQUF5QnRHLFFBQXpCLEVBQW1DLENBQW5DLEVBQXNDLElBQXRDO0FBQ0EsV0FBS2tFLFVBQUwsQ0FBZ0JxQyxZQUFoQixDQUE2QnZHLFFBQTdCLEVBQXVDNEUsTUFBdkMsR0FBZ0QsS0FBaEQ7O0FBRUEsV0FBSzFFLFNBQUwsQ0FBZXNHLE1BQWYsQ0FBc0J4RyxRQUF0QjtBQUNEOztBQUVEOzs7Ozs7OztvQ0FLZ0J5RyxhLEVBQWU7QUFBQTs7QUFDN0IsVUFBTUMsZUFBZSxDQUFDLEVBQXRCOztBQUVBRCxvQkFBY0UsT0FBZCxDQUFzQkMsT0FBdEIsQ0FBOEIsVUFBQzdHLE1BQUQsRUFBU3VCLEtBQVQsRUFBbUI7QUFDL0MsWUFBSXZCLE9BQU9xRixLQUFQLEtBQWlCLE9BQUtwRixRQUExQixFQUNFLE1BQU0sSUFBSStELEtBQUosQ0FBVSxzREFBVixDQUFOOztBQUVGLFlBQU0vRCxXQUFXRCxPQUFPcUYsS0FBeEI7O0FBRUE7QUFDQSxZQUFJLE9BQUtsRixTQUFMLENBQWUyRyxHQUFmLENBQW1CN0csUUFBbkIsQ0FBSixFQUFrQztBQUNoQyxjQUFNZ0MsZUFBZTlELGVBQWU4QixRQUFmLENBQXJCO0FBQ0EsY0FBTThHLGFBQWEsZ0JBQU0zSSxXQUFOLENBQWtCNkQsWUFBbEIsQ0FBbkI7QUFDQSxjQUFNK0Usb0JBQW9CLE9BQUtoSCxNQUFMLENBQVlpSCxVQUFaLENBQXVCakgsT0FBT2tILElBQTlCLENBQTFCO0FBQ0EsY0FBTUMsY0FBY0osV0FBV0ksV0FBWCxLQUEyQkMsU0FBM0IsR0FBdUNMLFdBQVdJLFdBQWxELEdBQWdFLENBQXBGO0FBQ0EsY0FBTUUsWUFBWU4sV0FBV00sU0FBWCxLQUF5QkQsU0FBekIsR0FBcUNMLFdBQVdNLFNBQWhELEdBQTRELENBQTlFO0FBQ0EsY0FBSXJFLE9BQU8sQ0FBWDs7QUFFQSxjQUFJZ0Usb0JBQW9CSyxTQUF4QixFQUFtQztBQUNqQ3JFLG1CQUFPLENBQVA7O0FBRUEsZ0JBQUlnRSxvQkFBb0JHLFdBQXhCLEVBQXFDO0FBQ25DLGtCQUFNRyxRQUFRWCxnQkFBZ0JLLG9CQUFvQkcsV0FBcEMsS0FBb0RFLFlBQVlGLFdBQWhFLENBQWQ7QUFDQW5FLHFCQUFPLDJCQUFnQnNFLEtBQWhCLENBQVA7QUFDRDtBQUNGOztBQUVELGlCQUFLbEQsS0FBTCxDQUFXbUMsYUFBWCxDQUF5QnRHLFFBQXpCLEVBQW1DK0MsSUFBbkMsRUFBeUMsR0FBekM7QUFDRDtBQUNGLE9BMUJEO0FBMkJEOzs7RUF6UTRCckYsV0FBVzRKLFU7O2tCQTRRM0I1SSxnQiIsImZpbGUiOiJQbGF5ZXJFeHBlcmllbmNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgeyBkZWNpYmVsVG9MaW5lYXIgfSBmcm9tICdzb3VuZHdvcmtzL3V0aWxzL21hdGgnO1xuaW1wb3J0IEJlYWNvbiBmcm9tICcuLi8uLi9zaGFyZWQvc2VydmljZXMvY2xpZW50L0JlYWNvbic7XG5pbXBvcnQgTWl4ZXIgZnJvbSAnLi9NaXhlcic7XG5pbXBvcnQgTG9vcFBsYXllciBmcm9tICcuL0xvb3BQbGF5ZXInO1xuaW1wb3J0IENpcmN1bGFyVmlldyBmcm9tICcuL2luc3RydW1lbnQvQ2lyY3VsYXJWaWV3JztcbmltcG9ydCBzZXR1cCBmcm9tICcuLi8uLi9zaGFyZWQvc2V0dXAnO1xuXG5jb25zdCBjbGllbnQgPSBzb3VuZHdvcmtzLmNsaWVudDtcbmNvbnN0IGF1ZGlvID0gc291bmR3b3Jrcy5hdWRpbztcbmNvbnN0IGF1ZGlvQ29udGV4dCA9IHNvdW5kd29ya3MuYXVkaW9Db250ZXh0O1xuY29uc3QgYXVkaW9TY2hlZHVsZXIgPSBzb3VuZHdvcmtzLmF1ZGlvLmdldFNjaGVkdWxlcigpO1xuXG5hdWRpb1NjaGVkdWxlci5sb29rYWhlYWQgPSAwLjE7XG5hdWRpb1NjaGVkdWxlci5wZXJpb2QgPSAwLjA1O1xuXG5jb25zdCBpbnN0cnVtZW50TGlzdCA9IE9iamVjdC5rZXlzKHNldHVwLmluc3RydW1lbnRzKTtcbmNvbnN0IG51bUluc3RydW1lbnRzID0gaW5zdHJ1bWVudExpc3QubGVuZ3RoO1xuXG5jb25zdCB0ZW1wbyA9IDEyMTtcbmNvbnN0IGJlYXREdXJhdGlvbiA9IDYwIC8gdGVtcG87XG5jb25zdCBtZWFzdXJlRHVyYXRpb24gPSA0ICogYmVhdER1cmF0aW9uO1xuXG5jb25zdCB2aWV3VGVtcGxhdGUgPSBgXG4gIDxkaXYgY2xhc3M9XCJiYWNrZ3JvdW5kIGZpdC1jb250YWluZXJcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3AgZmxleC1taWRkbGVcIj5cbiAgICAgIDwlIGlmIChydW4pIHsgJT48cCBjbGFzcz1cImJpZyBib2xkXCI+UHJvWG9NaXg8L3A+PCUgfSAlPlxuICAgIDwvZGl2PlxuXG4gICAgPCUgaWYgKHJ1bikgeyAlPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlciBydW5cIj5cbiAgICA8JSB9IGVsc2UgeyAlPlxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgIDwlIH0gJT5cbiAgICAgIDwlIGlmICh3YWl0KSB7ICU+PHA+UGxlYXNlIHdhaXQuLi48L3A+PCUgfSAlPlxuICAgICAgPCUgaWYgKHNvcnJ5KSB7ICU+PHA+U29ycnksPGJyIC8+bm8gcGxhY2UgYXZhaWxhYmxlPC9wPjwlIH0gJT5cbiAgICA8L2Rpdj5cblxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPlxuICAgICAgPCUgaWYgKHJ1bikgeyAlPlxuICAgICAgICA8cCBjbGFzcz1cInNtYWxsIHNvZnQtYmxpbmtcIj5Ub3VjaCB0aGUgc2NyZWVuIHRvIGpvaW4hPC9wPlxuICAgICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZvcmVncm91bmQgZml0LWNvbnRhaW5lclwiIGlkPVwiaW5zdHJ1bWVudC1jb250YWluZXJcIj48L2Rpdj5cbmA7XG5cbmNsYXNzIFBsYXllckV4cGVyaWVuY2UgZXh0ZW5kcyBzb3VuZHdvcmtzLkV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3Rvcihhc3NldHNEb21haW4sIGJlYWNvblVVSUQpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5wbGF0Zm9ybSA9IHRoaXMucmVxdWlyZSgncGxhdGZvcm0nLCB7IGZlYXR1cmVzOiBbJ3dlYi1hdWRpbyddIH0pO1xuICAgIHRoaXMubWV0cmljU2NoZWR1bGVyID0gdGhpcy5yZXF1aXJlKCdtZXRyaWMtc2NoZWR1bGVyJyk7XG5cbiAgICB0aGlzLmF1ZGlvQnVmZmVyTWFuYWdlciA9IHRoaXMucmVxdWlyZSgnYXVkaW8tYnVmZmVyLW1hbmFnZXInLCB7XG4gICAgICBhc3NldHNEb21haW46IGFzc2V0c0RvbWFpbiArICdzb3VuZHMvJyxcbiAgICAgIGZpbGVzOiBzZXR1cFxuICAgIH0pO1xuXG4gICAgdGhpcy5tb3Rpb25JbnB1dCA9IHRoaXMucmVxdWlyZSgnbW90aW9uLWlucHV0Jywge1xuICAgICAgZGVzY3JpcHRvcnM6IFsnYWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSddLFxuICAgIH0pO1xuXG4gICAgY29uc3QgYmVhY29uQ29uZmlnID0ge1xuICAgICAgdXVpZDogYmVhY29uVVVJRCxcbiAgICAgIHR4UG93ZXI6IC01NSwgLy8gaW4gZEIgKHNlZSBiZWFjb24gc2VydmljZSBmb3IgZGV0YWlsKVxuICAgICAgbWFqb3I6IDAsXG4gICAgICBza2lwU2VydmljZTogZmFsc2UsXG4gICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgfTtcblxuICAgIGJlYWNvbkNvbmZpZy5lbXVsYXRlID0gKCEhd2luZG93LmNvcmRvdmEpID8gbnVsbCA6IHsgbnVtUGVlcnM6IDAgfTtcbiAgICB0aGlzLmJlYWNvbiA9IHRoaXMucmVxdWlyZSgnYmVhY29uJywgYmVhY29uQ29uZmlnKTtcblxuICAgIHRoaXMucGxheWVySWQgPSBudWxsO1xuICAgIHRoaXMuaW50cnVtZW50Q29uZmlnID0gbnVsbDtcbiAgICB0aGlzLnBsYXllcklkcyA9IG51bGw7XG5cbiAgICB0aGlzLm9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eSA9IHRoaXMub25BY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5LmJpbmQodGhpcyk7XG4gICAgdGhpcy5vbkJlYWNvblJhbmdpbmcgPSB0aGlzLm9uQmVhY29uUmFuZ2luZy5iaW5kKHRoaXMpO1xuICAgIHRoaXMub25DdXRvZmZDb250cm9sID0gdGhpcy5vbkN1dG9mZkNvbnRyb2wuYmluZCh0aGlzKTtcbiAgICB0aGlzLm9uUGxheWVyRW50ZXJlZCA9IHRoaXMub25QbGF5ZXJFbnRlcmVkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5vblBsYXllckV4aXQgPSB0aGlzLm9uUGxheWVyRXhpdC5iaW5kKHRoaXMpO1xuICAgIHRoaXMucnVuQXVkaW9QcmV2aWV3ID0gdGhpcy5ydW5BdWRpb1ByZXZpZXcuYmluZCh0aGlzKTtcbiAgICB0aGlzLnJ1bkFwcGxpY2F0aW9uID0gdGhpcy5ydW5BcHBsaWNhdGlvbi5iaW5kKHRoaXMpO1xuICAgIHRoaXMucmVmdXNlQXBwbGljYXRpb24gPSB0aGlzLnJlZnVzZUFwcGxpY2F0aW9uLmJpbmQodGhpcyk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICBzdXBlci5zdGFydCgpO1xuXG4gICAgY29uc3Qgdmlld01vZGVsID0ge1xuICAgICAgd2FpdDogdHJ1ZSxcbiAgICAgIHJ1bjogZmFsc2UsXG4gICAgICBzb3JyeTogZmFsc2UsXG4gICAgfTtcbiAgICB0aGlzLnZpZXcgPSBuZXcgc291bmR3b3Jrcy5TZWdtZW50ZWRWaWV3KHZpZXdUZW1wbGF0ZSwgdmlld01vZGVsLCB7fSwge30pO1xuICAgIHRoaXMuc2hvdygpO1xuXG4gICAgaWYgKGNsaWVudC51cmxQYXJhbXMgIT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludHJ1bWVudE5hbWUgPSBjbGllbnQudXJsUGFyYW1zLmpvaW4oJy0nKTtcbiAgICAgIGNvbnN0IGluZGV4ID0gaW5zdHJ1bWVudExpc3QuaW5kZXhPZihpbnRydW1lbnROYW1lKTtcblxuICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgdGhpcy5wbGF5ZXJJZCA9IGluZGV4O1xuICAgIH1cblxuICAgIHRoaXMubGFzdEN1dG9mZiA9IC1JbmZpbml0eTtcblxuICAgIHRoaXMuc2VuZCgncGxheWVyOmVudGVyJywgdGhpcy5wbGF5ZXJJZCk7XG4gICAgdGhpcy5yZWNlaXZlKCdwbGF5ZXI6YWNrJywgdGhpcy5ydW5BdWRpb1ByZXZpZXcpO1xuICAgIHRoaXMucmVjZWl2ZSgncGxheWVyOnJlZnVzZWQnLCB0aGlzLnJlZnVzZUFwcGxpY2F0aW9uKTtcbiAgfVxuXG4gIHJlZnVzZUFwcGxpY2F0aW9uKCkge1xuICAgIHRoaXMudmlldy5tb2RlbC53YWl0ID0gZmFsc2U7XG4gICAgdGhpcy52aWV3Lm1vZGVsLnNvcnJ5ID0gdHJ1ZTtcbiAgICB0aGlzLnZpZXcucmVuZGVyKCcuYmFja2dyb3VuZCcpO1xuICB9XG5cbiAgcnVuQXVkaW9QcmV2aWV3KHBsYXllcklkLCBwbGF5ZXJJZHMpIHtcbiAgICBjb25zdCBhdWRpb1NldHVwID0gdGhpcy5hdWRpb0J1ZmZlck1hbmFnZXIuZGF0YTtcbiAgICBjb25zdCBpbnN0cnVtZW50SWQgPSBpbnN0cnVtZW50TGlzdFtwbGF5ZXJJZF07XG4gICAgY29uc3QgaW5zdHJ1bWVudENvbmZpZyA9IGF1ZGlvU2V0dXAuaW5zdHJ1bWVudHNbaW5zdHJ1bWVudElkXTtcbiAgICBsZXQgbG9vcCA9IGluc3RydW1lbnRDb25maWcubG9vcDtcblxuICAgIGlmKEFycmF5LmlzQXJyYXkobG9vcCkpIHtcbiAgICAgIGNvbnN0IHByZXZpZXdTZWdtZW50SW5kZXggPSBpbnN0cnVtZW50Q29uZmlnLnByZXZpZXcgfHzCoDA7XG4gICAgICBsb29wID0gbG9vcFtwcmV2aWV3U2VnbWVudEluZGV4XTtcbiAgICB9XG5cbiAgICBjb25zdCB0aW1lID0gYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lO1xuICAgIGNvbnN0IG1lYXN1cmVEdXJhdGlvbiA9IGF1ZGlvU2V0dXAuY29tbW9uLm1lYXN1cmVEdXJhdGlvbjtcbiAgICBjb25zdCBmYWRlVGltZSA9IDAuMDU7XG5cbiAgICBjb25zdCBlbnYgPSBhdWRpb0NvbnRleHQuY3JlYXRlR2FpbigpO1xuICAgIGVudi5jb25uZWN0KGF1ZGlvQ29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgZW52LmdhaW4udmFsdWUgPSAwO1xuICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDAsIHRpbWUpO1xuICAgIGVudi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDEsIHRpbWUgKyBmYWRlVGltZSk7XG5cbiAgICBjb25zdCBzcmMgPSBhdWRpb0NvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgc3JjLmNvbm5lY3QoZW52KTtcbiAgICBzcmMuYnVmZmVyID0gbG9vcC5hdWRpb0J1ZmZlcjtcbiAgICBzcmMuc3RhcnQodGltZSwgbG9vcC5zdGFydE9mZnNldCAtIGZhZGVUaW1lKTtcbiAgICBzcmMubG9vcFN0YXJ0ID0gbG9vcC5zdGFydE9mZnNldDtcbiAgICBzcmMubG9vcEVuZCA9IGxvb3Auc3RhcnRPZmZzZXQgKyBsb29wLmxlbmd0aCAqIG1lYXN1cmVEdXJhdGlvbjtcbiAgICBzcmMubG9vcCA9IHRydWU7XG5cbiAgICBjb25zdCBsZW5ndGggPSAyO1xuICAgIGNvbnN0IGVuZFRpbWUgPSB0aW1lICsgbGVuZ3RoICogbWVhc3VyZUR1cmF0aW9uO1xuICAgIGVudi5nYWluLnNldFZhbHVlQXRUaW1lKDEsIGVuZFRpbWUpO1xuICAgIGVudi5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKDAsIGVuZFRpbWUgKyBmYWRlVGltZSk7XG4gICAgc3JjLnN0b3AoZW5kVGltZSArIGZhZGVUaW1lKTtcblxuICAgIHRoaXMudmlldy5tb2RlbC53YWl0ID0gZmFsc2U7XG4gICAgdGhpcy52aWV3Lm1vZGVsLnJ1biA9IHRydWU7XG4gICAgdGhpcy52aWV3LnJlbmRlcignLmJhY2tncm91bmQnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKGNsaWVudC5wbGF0Zm9ybSk7XG4gICAgY29uc3QgaW50ZXJhY3Rpb24gPSBjbGllbnQucGxhdGZvcm0uaW50ZXJhY3Rpb24gPT09ICd0b3VjaCcgP1xuICAgICAgJ3RvdWNoc3RhcnQnIDogJ21vdXNlZG93bic7XG5cbiAgICB0aGlzLnZpZXcuaW5zdGFsbEV2ZW50cyh7XG4gICAgICBbaW50ZXJhY3Rpb25dOiAoKSA9PiB7XG4gICAgICAgIHRoaXMudmlldy5pbnN0YWxsRXZlbnRzKHt9LCB0cnVlKTtcbiAgICAgICAgdGhpcy52aWV3Lm1vZGVsLnJ1biA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZpZXcucmVuZGVyKCcuYmFja2dyb3VuZCcpO1xuXG4gICAgICAgIC8vIGxhdW5jaCB0aGUgYWN0dWFsIGFwcGxpY2F0aW9uXG4gICAgICAgIHRoaXMucnVuQXBwbGljYXRpb24ocGxheWVySWQsIHBsYXllcklkcyk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgcnVuQXBwbGljYXRpb24ocGxheWVySWQsIHBsYXllcklkcykge1xuICAgIHRoaXMucGxheWVySWQgPSBwbGF5ZXJJZDtcbiAgICB0aGlzLnBsYXllcklkcyA9IG5ldyBTZXQocGxheWVySWRzKTtcblxuICAgIGlmICh0aGlzLnBsYXllcklkID49IGluc3RydW1lbnRMaXN0Lmxlbmd0aClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCAob3V0IG9mIHJhbmdlKSBwbGF5ZXJJZCAtIHNvbWV0aGluZyBkb2Vzbid0IHdvcmsgcHJvcGVybHlgKTtcblxuICAgIGNvbnNvbGUubG9nKGluc3RydW1lbnRMaXN0KTtcbiAgICBjb25zb2xlLmxvZyhgPT4gUnVubmluZyBcIiR7aW5zdHJ1bWVudExpc3RbdGhpcy5wbGF5ZXJJZF19XCIgaW5zdHJ1bWVudCAoaWQ6ICR7dGhpcy5wbGF5ZXJJZH0pYCk7XG5cbiAgICAvLyBpbml0IGF1ZGlvXG4gICAgdGhpcy5sb29wUGxheWVyID0gbmV3IExvb3BQbGF5ZXIodGhpcy5tZXRyaWNTY2hlZHVsZXIsIDQgLyA0LCAxMjEsIDEgLyA0LCAwLjA1KTtcblxuICAgIHRoaXMubWl4ZXIgPSBuZXcgTWl4ZXIodGhpcy5tZXRyaWNTY2hlZHVsZXIpO1xuICAgIHRoaXMubWl4ZXIuY29ubmVjdChhdWRpb0NvbnRleHQuZGVzdGluYXRpb24pO1xuXG4gICAgLy8gY3JlYXRlIGluc3RydW1lbnRzXG4gICAgY29uc3QgYXVkaW9TZXR1cCA9IHRoaXMuYXVkaW9CdWZmZXJNYW5hZ2VyLmRhdGE7XG4gICAgY29uc3QgY29tbW9uQ29uZmlnID0gYXVkaW9TZXR1cC5jb21tb247XG4gICAgY29uc3QgbWV0cmljU2NoZWR1bGVyID0gdGhpcy5tZXRyaWNTY2hlZHVsZXI7XG4gICAgY29uc3QgcGxheWVySW5zdHJ1bWVudElkID0gaW5zdHJ1bWVudExpc3RbdGhpcy5wbGF5ZXJJZF07XG4gICAgY29uc3QgaXNTb2xvID0gYXVkaW9TZXR1cC5pbnN0cnVtZW50c1twbGF5ZXJJbnN0cnVtZW50SWRdLnNvbG87XG5cbiAgICAvLyBsb29wIHRyYWNrIHRlc3RcbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgbnVtSW5zdHJ1bWVudHM7IGluZGV4KyspIHtcbiAgICAgIGNvbnN0IGluc3RydW1lbnRJZCA9IGluc3RydW1lbnRMaXN0W2luZGV4XTtcbiAgICAgIGNvbnN0IGluc3RydW1lbnRDb25maWcgPSBhdWRpb1NldHVwLmluc3RydW1lbnRzW2luc3RydW1lbnRJZF07XG4gICAgICAvLyBpbml0IGluc3RydW1lbnQgYXVkaW9cbiAgICAgIGNvbnN0IGxvb3AgPSBpbnN0cnVtZW50Q29uZmlnLmxvb3A7XG4gICAgICBjb25zdCBhdWRpb0J1ZmZlciA9IGxvb3AuYnVmZmVyO1xuXG4gICAgICBjb25zdCBsb29wVHJhY2sgPSB0aGlzLmxvb3BQbGF5ZXIuYWRkTG9vcFRyYWNrKGluZGV4LCBsb29wKTtcbiAgICAgIHRoaXMubWl4ZXIuY3JlYXRlQ2hhbm5lbChpbmRleCwgbG9vcFRyYWNrKTtcblxuICAgICAgLy8gQGRlYnVnOiBzdGFydCBhbGwgaW5zdHJ1bWVudHNcbiAgICAgIC8vIGNvbnN0IGdhaW4gPSAoaSA9PT0gdGhpcy5wbGF5ZXJJZCkgPyAxIDogMC4xO1xuICAgICAgLy8gdGhpcy5taXhlci5zZXRHYWluKGluc3RydW1lbnRJZCwgZ2Fpbik7XG4gICAgICAvLyBsb29wVHJhY2suYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgLy8gaW5pdCB2aWV3IGlmIGxvY2FsIGluc3RydW1lbnRcbiAgICAgIGlmIChpbmRleCA9PT0gdGhpcy5wbGF5ZXJJZCkge1xuICAgICAgICB0aGlzLm1peGVyLnNldEdhaW4oaW5kZXgsIDEpO1xuICAgICAgICBsb29wVHJhY2suYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICBjb25zdCBkaXNwbGF5Q29uZmlnID0gaW5zdHJ1bWVudENvbmZpZy5kaXNwbGF5O1xuXG4gICAgICAgIGlmIChkaXNwbGF5Q29uZmlnKSB7XG4gICAgICAgICAgZGlzcGxheUNvbmZpZy5wbGF5ZXJJZCA9IHRoaXMucGxheWVySWQ7XG4gICAgICAgICAgY29uc3QgaW5zdHJ1bWVudFZpZXcgPSBuZXcgQ2lyY3VsYXJWaWV3KGNvbW1vbkNvbmZpZywgZGlzcGxheUNvbmZpZywgbWV0cmljU2NoZWR1bGVyKTtcbiAgICAgICAgICBpbnN0cnVtZW50Vmlldy5yZW5kZXIoKTtcbiAgICAgICAgICBpbnN0cnVtZW50Vmlldy5zaG93KCk7XG4gICAgICAgICAgaW5zdHJ1bWVudFZpZXcuYXBwZW5kVG8odGhpcy52aWV3LiRlbC5xdWVyeVNlbGVjdG9yKCcjaW5zdHJ1bWVudC1jb250YWluZXInKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb25JbmNsdWRpbmdHcmF2aXR5JywgdGhpcy5vbkFjY2VsZXJhdGlvbkluY2x1ZGluZ0dyYXZpdHkpO1xuXG4gICAgdGhpcy5yZWNlaXZlKCdjdXRvZmY6Y29udHJvbCcsIHRoaXMub25DdXRvZmZDb250cm9sKTtcbiAgICB0aGlzLnJlY2VpdmUoJ3BsYXllcjplbnRlcmVkJywgdGhpcy5vblBsYXllckVudGVyZWQpO1xuICAgIHRoaXMucmVjZWl2ZSgncGxheWVyOmV4aXQnLCB0aGlzLm9uUGxheWVyRXhpdCk7XG5cbiAgICB0aGlzLmJlYWNvbi5taW5vciA9IHRoaXMucGxheWVySWQ7XG4gICAgdGhpcy5iZWFjb24uYWRkTGlzdGVuZXIodGhpcy5vbkJlYWNvblJhbmdpbmcpO1xuICAgIHRoaXMuYmVhY29uLnN0YXJ0QWR2ZXJ0aXNpbmcoKTtcbiAgICB0aGlzLmJlYWNvbi5zdGFydFJhbmdpbmcoKTtcbiAgfVxuXG4gIG9uQWNjZWxlcmF0aW9uSW5jbHVkaW5nR3Jhdml0eShkYXRhKSB7XG4gICAgY29uc3QgYWNjWCA9IGRhdGFbMF07XG4gICAgY29uc3QgYWNjWSA9IGRhdGFbMV07XG4gICAgY29uc3QgYWNjWiA9IGRhdGFbMl07XG5cbiAgICBjb25zdCBwaXRjaCA9IDIgKiBNYXRoLmF0YW4yKGFjY1ksIE1hdGguc3FydChhY2NaICogYWNjWiArIGFjY1ggKiBhY2NYKSkgLyBNYXRoLlBJO1xuICAgIGNvbnN0IHJvbGwgPSAtMiAqIE1hdGguYXRhbjIoYWNjWCwgTWF0aC5zcXJ0KGFjY1kgKiBhY2NZICsgYWNjWiAqIGFjY1opKSAvIE1hdGguUEk7XG4gICAgY29uc3QgY3V0b2ZmID0gMC41ICsgTWF0aC5tYXgoLTAuOCwgTWF0aC5taW4oMC44LCAoYWNjWiAvIDkuODEpKSkgLyAxLjY7XG5cbiAgICBpZiAoTWF0aC5hYnMoY3V0b2ZmIC0gdGhpcy5sYXN0Q3V0b2ZmKSA+IDAuMDEpIHtcbiAgICAgIHRoaXMubGFzdEN1dG9mZiA9IGN1dG9mZjtcbiAgICAgIC8vIHVwZGF0ZSBsb2NhbCBhdWRpb1xuICAgICAgdGhpcy5sb29wUGxheWVyLnNldEN1dG9mZih0aGlzLnBsYXllcklkLCBjdXRvZmYpO1xuICAgICAgLy8gdXBkYXRlIHNlcnZlciAoaGVuY2UgbmVpZ2hib3JzKVxuICAgICAgdGhpcy5zZW5kKCdjdXRvZmY6Y29udHJvbCcsIHRoaXMucGxheWVySWQsIGN1dG9mZik7XG4gICAgfVxuICB9XG5cbiAgb25DdXRvZmZDb250cm9sKHBsYXllcklkLCB2YWx1ZSkge1xuICAgIHRoaXMubG9vcFBsYXllci5zZXRDdXRvZmYocGxheWVySWQsIHZhbHVlKTtcbiAgfVxuXG4gIG9uUGxheWVyRW50ZXJlZChwbGF5ZXJJZCkge1xuICAgIHRoaXMucGxheWVySWRzLmFkZChwbGF5ZXJJZCk7XG4gIH1cblxuICBvblBsYXllckV4aXQocGxheWVySWQpIHtcbiAgICAvLyByZXNldCBtaXhlciBhbmQgc3RvcCB0cmFja1xuICAgIHRoaXMubWl4ZXIuc2V0QXV0b21hdGlvbihwbGF5ZXJJZCwgMCwgMC4wNSk7XG4gICAgdGhpcy5sb29wUGxheWVyLmdldExvb3BUcmFjayhwbGF5ZXJJZCkuYWN0aXZlID0gZmFsc2U7XG5cbiAgICB0aGlzLnBsYXllcklkcy5kZWxldGUocGxheWVySWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIEB3YXJuaW5nIC0gYSBwZWVyIHdobyBraWxsIGl0cyBhcHAgc3RpbGwgc2VuZCBiZWFjb24gaW5mb3JtYXRpb25zIGZvclxuICAgKiBhcm91bmQgMTAgc2Vjb25kcy4gVGhhdCdzIHdoeSB3ZSBtdXN0IGtlZXAgYSBib29raW5nIG9mIHRoZSBjb25uZWN0ZWRcbiAgICogY2xpZW50dHMgYWNjb3JkaW5nIHRvIHRoZSBzZXJ2ZXIgaW5mb3JtYXRpb25zLlxuICAgKi9cbiAgb25CZWFjb25SYW5naW5nKHBsdWdpblJlc3VsdHMpIHtcbiAgICBjb25zdCBvZmZUaHJlc2hvbGQgPSAtNjA7XG5cbiAgICBwbHVnaW5SZXN1bHRzLmJlYWNvbnMuZm9yRWFjaCgoYmVhY29uLCBpbmRleCkgPT4ge1xuICAgICAgaWYgKGJlYWNvbi5taW5vciA9PT0gdGhpcy5wbGF5ZXJJZClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHBlZXIgYmVhY29uIG1pbm9yLCBpcyBlcXVhbCB0byB0aGlzLnBsYXllcklkJyk7XG5cbiAgICAgIGNvbnN0IHBsYXllcklkID0gYmVhY29uLm1pbm9yO1xuXG4gICAgICAvLyBwcmV2ZW50IGV4aXRlZCBwbGF5ZXJzIHRvIHRyaWdnZXIgYXV0b21hdGlvbiBhbmQgYWN0aXZhdGlvblxuICAgICAgaWYgKHRoaXMucGxheWVySWRzLmhhcyhwbGF5ZXJJZCkpIHtcbiAgICAgICAgY29uc3QgaW5zdHJ1bWVudElkID0gaW5zdHJ1bWVudExpc3RbcGxheWVySWRdO1xuICAgICAgICBjb25zdCBpbnN0cnVtZW50ID0gc2V0dXAuaW5zdHJ1bWVudHNbaW5zdHJ1bWVudElkXTtcbiAgICAgICAgY29uc3QgZXN0aW1hdGVkRGlzdGFuY2UgPSB0aGlzLmJlYWNvbi5yc3NpVG9EaXN0KGJlYWNvbi5yc3NpKTtcbiAgICAgICAgY29uc3QgY29uc3RSYWRpdXMgPSBpbnN0cnVtZW50LmNvbnN0UmFkaXVzICE9PSB1bmRlZmluZWQgPyBpbnN0cnVtZW50LmNvbnN0UmFkaXVzIDogMTtcbiAgICAgICAgY29uc3Qgb2ZmUmFkaXVzID0gaW5zdHJ1bWVudC5vZmZSYWRpdXMgIT09IHVuZGVmaW5lZCA/IGluc3RydW1lbnQub2ZmUmFkaXVzIDogMztcbiAgICAgICAgbGV0IGdhaW4gPSAwO1xuXG4gICAgICAgIGlmIChlc3RpbWF0ZWREaXN0YW5jZSA8IG9mZlJhZGl1cykge1xuICAgICAgICAgIGdhaW4gPSAxO1xuXG4gICAgICAgICAgaWYgKGVzdGltYXRlZERpc3RhbmNlID4gY29uc3RSYWRpdXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGxldmVsID0gb2ZmVGhyZXNob2xkICogKGVzdGltYXRlZERpc3RhbmNlIC0gY29uc3RSYWRpdXMpIC8gKG9mZlJhZGl1cyAtIGNvbnN0UmFkaXVzKTtcbiAgICAgICAgICAgIGdhaW4gPSBkZWNpYmVsVG9MaW5lYXIobGV2ZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWl4ZXIuc2V0QXV0b21hdGlvbihwbGF5ZXJJZCwgZ2FpbiwgMC41KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQbGF5ZXJFeHBlcmllbmNlO1xuIl19