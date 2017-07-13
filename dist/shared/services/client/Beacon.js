'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _client = require('soundworks/client');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* based on cordova-plugin-ibeacon: https://github.com/petermetz/cordova-plugin-ibeacon.git */
var SERVICE_ID = 'service:beacon';

var CORDOVA_PLUGIN_NAME = 'com.unarin.cordova.beacon';
var CORDOVA_PLUGIN_ASSERTED_VERSION = '3.3.0';
var CORDOVA_PLUGIN_REPOSITORY = 'https://github.com/petermetz/cordova-plugin-ibeacon.git';

var Beacon = function (_Service) {
  (0, _inherits3.default)(Beacon, _Service);

  /** _<span class='warning'>__WARNING__</span> This class should never be instanciated manually_ */
  function Beacon() {
    (0, _classCallCheck3.default)(this, Beacon);

    /**
     * - uuid represent the beacon region. a given ranging callback can obly monitor
     * beacons with the same uuid, hence uuid in the soundwork beacon service is hardcoded.
     * - identifier came with the cordova-plugin-ibeacon API, no real cues why it's there.
     * - major / minor: each encoded on 16 bits, these values are to be used to defined a
     * unique soundwork client.
     */
    var _this = (0, _possibleConstructorReturn3.default)(this, (Beacon.__proto__ || (0, _getPrototypeOf2.default)(Beacon)).call(this, SERVICE_ID, false));

    var defaults = {
      uuid: '74278BDA-B644-4520-8F0C-720EAF059935',
      major: Math.floor(Math.random() * 65500),
      minor: Math.floor(Math.random() * 65500),
      txPower: -55,
      debug: false,
      skipService: false,
      emulate: null
    };

    _this.configure(defaults);

    _this._identifier = 'advertisedBeacon';
    // local attributes
    _this._cordovaPluginInstalled = false;
    _this._hasBeenCalibrated = false;
    _this._callbacks = new _set2.default();

    _this._emulatedBeacons = [];
    // bind local methods
    _this._didRangeBeaconsInRegion = _this._didRangeBeaconsInRegion.bind(_this);
    // this._startAdvertising = this._startAdvertising.bind(this);
    // this._stopAdvertising = this._stopAdvertising.bind(this);
    // this._startRanging = this._startRanging.bind(this);
    // this._stopRanging = this._stopRanging.bind(this);
    // this._checkPlugin = this._checkPlugin.bind(this);
    // this.restartAdvertising = this.restartAdvertising.bind(this);
    // this.restartRanging = this.restartRanging.bind(this);
    return _this;
  }

  /**
   * Get advertising iBeacon region UUID
   */


  (0, _createClass3.default)(Beacon, [{
    key: 'start',


    /** @private */
    value: function start() {
      var _this2 = this;

      (0, _get3.default)(Beacon.prototype.__proto__ || (0, _getPrototypeOf2.default)(Beacon.prototype), 'start', this).call(this);

      if (this.options.skipService) {
        this.ready();
        this.restartAdvertising = function () {};
        this.restartRanging = function () {};
        return;
      }

      // service ready when plugin is checked
      if (this.options.emulate === null) {
        this._checkPlugin().then(function (isChecked) {
          if (isChecked) _this2.ready();

          if (_this2.options.debug === false) {
            cordova.plugins.locationManager.disableDebugNotifications();
            cordova.plugins.locationManager.disableDebugLogs();
          }
        });
      } else {
        this.ready();
        this.restartAdvertising = function () {};
        this._rangingIntervalId = null;

        this.restartRanging = function () {
          clearInterval(_this2._rangingIntervalId);

          _this2._emulatedBeacons.length = 0;
          var numPeers = _this2.options.emulate.numPeers;
          var minor = 0;

          for (var i = 0; i < numPeers; i++) {
            var peerResult = {
              major: _this2.options.major,
              minor: minor === _this2.options.minor ? minor += 1 : minor,
              rssi: -1 * (80 * Math.random() + 20), // [-20, -100]
              proximity: 'hi'
            };

            minor += 1;

            _this2._emulatedBeacons.push(peerResult);
          }

          _this2._rangingIntervalId = setInterval(function () {
            _this2._emulatedBeacons.forEach(function (res) {
              res.rssi += Math.random() * 6 - 3;
              res.rssi = Math.max(-100, Math.min(-20, res.rssi));
            });

            _this2._didRangeBeaconsInRegion({ beacons: _this2._emulatedBeacons });
          }, 1000);
        };

        this.restartRanging();
      }
    }

    /**
     * Register a function that will be invoked when neighboring ibeacon list is updated
     * (i.e. every nth millisec. once a single beacon is registered)
     * @param {Function} callback
     */

  }, {
    key: 'addListener',
    value: function addListener(callback) {
      this._callbacks.add(callback);
    }

    /**
     * remove registered callback from stack (see 'addCallback')
     */

  }, {
    key: 'removeListener',
    value: function removeListener(callback) {
      if (this._callbacks.has(callback)) this._callbacks.delete(callback);
    }
  }, {
    key: 'startAdvertising',
    value: function startAdvertising() {
      this._startAdvertising();
    }
  }, {
    key: 'startRanging',
    value: function startRanging() {
      this._startRanging();
    }

    /**
     * Restart advertising to take into acount uuid, major or minor change.
     */

  }, {
    key: 'restartAdvertising',
    value: function restartAdvertising() {
      this._stopAdvertising();
      this._startAdvertising();
    }

    /**
     * Restart ranging to take into acount uuid change.
     */

  }, {
    key: 'restartRanging',
    value: function restartRanging() {
      this._stopRanging();
      this._startRanging();
    }

    /**
     * remove registered callback from stack (see 'addCallback')
     */

  }, {
    key: 'rssiToDist',
    value: function rssiToDist(rssi) {
      if (!this._hasBeenCalibrated) {
        console.warn('rssiToDist called prior to txPower definition (calibration), using default value:', this.options.txPower, 'dB');
        this._hasBeenCalibrated = true;
      }

      return this._calculateAccuracy(this.txPower, rssi);
    }

    /** @private */

  }, {
    key: '_startAdvertising',
    value: function _startAdvertising() {
      if (this._cordovaPluginInstalled) {
        var identifier = this._identifier;
        var uuid = this.options.uuid;
        var minor = this.options.minor;
        var major = this.options.major;
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid, major, minor);

        // verify the platform supports transmitting as a beacon
        cordova.plugins.locationManager.isAdvertisingAvailable().then(function (isSupported) {
          if (isSupported) {
            // start advertising
            cordova.plugins.locationManager.startAdvertising(beaconRegion).fail(console.error).done();
          } else {
            console.log('Advertising not supported');
          }
        }).fail(function (e) {
          console.error(e);
        }).done();
      }
    }

    /** @private */

  }, {
    key: '_stopAdvertising',
    value: function _stopAdvertising() {
      if (this._cordovaPluginInstalled) {
        cordova.plugins.locationManager.stopAdvertising().fail(function (e) {
          console.error(e);
        }).done();
      }
    }

    /** @private */

  }, {
    key: '_startRanging',
    value: function _startRanging() {
      if (this._cordovaPluginInstalled) {
        var delegate = new cordova.plugins.locationManager.Delegate();
        delegate.didRangeBeaconsInRegion = this._didRangeBeaconsInRegion;
        cordova.plugins.locationManager.setDelegate(delegate);

        var uuid = this.options.uuid;
        var identifier = this._identifier;
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);

        // required in iOS 8+
        cordova.plugins.locationManager.requestWhenInUseAuthorization();
        // or cordova.plugins.locationManager.requestAlwaysAuthorization()

        cordova.plugins.locationManager.startRangingBeaconsInRegion(beaconRegion).fail(function (e) {
          console.error(e);
        }).done();
      }
    }

    /** @private */

  }, {
    key: '_stopRanging',
    value: function _stopRanging() {
      if (this._cordovaPluginInstalled) {
        var uuid = this.options.uuid;
        var identifier = this._identifier;
        var beaconRegion = new cordova.plugins.locationManager.BeaconRegion(identifier, uuid);

        cordova.plugins.locationManager.stopRangingBeaconsInRegion(beaconRegion).fail(function (e) {
          console.error(e);
        }).done();
      }
    }

    /** @private */

  }, {
    key: '_didRangeBeaconsInRegion',
    value: function _didRangeBeaconsInRegion(pluginResult) {
      // call user defined callbacks
      this._callbacks.forEach(function (callback) {
        callback(pluginResult);
      });
    }

    /** @private */

  }, {
    key: '_checkPlugin',
    value: function _checkPlugin() {
      var plugins = cordova.require('cordova/plugin_list').metadata;
      var displayInstallInstructions = false;

      if (plugins[CORDOVA_PLUGIN_NAME] === undefined) {
        var msg = 'Cordova plugin <cordova-plugin-ibeacon> not installed -> beacon service disabled';
        console.warn(msg);

        displayInstallInstructions = true;
      } else {
        if (plugins[CORDOVA_PLUGIN_NAME] !== CORDOVA_PLUGIN_ASSERTED_VERSION) {
          var _msg = 'Cordova plugin <cordova-plugin-ibeacon> version mismatch: installed:\n          ' + plugins[CORDOVA_PLUGIN_NAME] + ' required: ' + CORDOVA_PLUGIN_ASSERTED_VERSION + ' (version not tested, use at your own risk)';
          console.warn(_msg);

          displayInstallInstructions = true;
        }

        this._cordovaPluginInstalled = true;
      }

      if (displayInstallInstructions) {
        var _msg2 = '\n        -> to install ' + CORDOVA_PLUGIN_NAME + ' v' + CORDOVA_PLUGIN_ASSERTED_VERSION + ', use:\n        cordova plugin add ' + CORDOVA_PLUGIN_REPOSITORY + '#' + CORDOVA_PLUGIN_ASSERTED_VERSION;
        console.log(_msg2);
      }

      if (this._cordovaPluginInstalled) return _promise2.default.resolve(true);else return _promise2.default.resolve(false);
    }

    /**
     * @private
     * convert rssi to distance, naming (_calculateAccuracy rather than calculateDistance)
     * is intentional: USE WITH CAUTION, as explained @
     * http://stackoverflow.com/questions/20416218/understanding-ibeacon-distancing
     */

  }, {
    key: '_calculateAccuracy',
    value: function _calculateAccuracy(txPower, rssi) {
      if (rssi === 0) return 0.0;

      var ratio = rssi * 1.0 / txPower;

      if (ratio < 1.0) return Math.pow(ratio, 10);else return 0.89976 * Math.pow(ratio, 7.7095) + 0.111;
    }
  }, {
    key: 'uuid',
    get: function get() {
      return this.options.uuid;
    }

    /**
     * Set advertising iBeacon UUID
     * @param {String} val - new UUID
     */
    ,
    set: function set(val) {
      // USE AT YOUR OWN RISKS
      this.options.uuid = val;
    }

    /**
     * Get advertising iBeacon major ID
     */

  }, {
    key: 'major',
    get: function get() {
      return this.options.major;
    }

    /**
     * Set advertising iBeacon major ID
     * @param {Number} val - new major ID
     */
    ,
    set: function set(val) {
      if (val <= 65535 && val >= 0) this.options.major = val;else console.warn('WARNING: attempt to define invalid major value: ', val, ' (must be in range [0,65535]');
    }

    /**
    * Get advertising iBeacon minor ID
    */

  }, {
    key: 'minor',
    get: function get() {
      return this.options.minor;
    }

    /**
    * Set advertising iBeacon minor ID
    * @param {Number} val - new minor ID
    */
    ,
    set: function set(val) {
      if (val >= 0 && val <= 65535) this.options.minor = val;else console.warn('WARNING: attempt to define invalid minor value: ', val, ' (must be in range [0,65535]');
    }

    /**
    * Get reference signal strength, used for distance estimation.
    * txPower is the rssi (in dB) as mesured by another beacon
    * located at 1 meter away from this beacon.
    */

  }, {
    key: 'txPower',
    get: function get() {
      return this.options.txPower;
    }

    /**
    * Get reference signal strength, used for distance estimation.
    * txPower is the rssi (in dB) as mesured by another beacon
    * located at 1 meter away from this beacon.
    * @param {Number} val - new signal strength reference
    */
    ,
    set: function set(val) {
      if (val >= -200 && val <= 0) {
        this.options.txPower = val;
        this._hasBeenCalibrated = true;
      } else {
        console.warn('WARNING: a reference txPower value of: ', val, ' dB is unlikely (set has been rejected)');
      }
    }
  }]);
  return Beacon;
}(_client.Service);

_client.serviceManager.register(SERVICE_ID, Beacon);

exports.default = Beacon;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJlYWNvbi5qcyJdLCJuYW1lcyI6WyJTRVJWSUNFX0lEIiwiQ09SRE9WQV9QTFVHSU5fTkFNRSIsIkNPUkRPVkFfUExVR0lOX0FTU0VSVEVEX1ZFUlNJT04iLCJDT1JET1ZBX1BMVUdJTl9SRVBPU0lUT1JZIiwiQmVhY29uIiwiZGVmYXVsdHMiLCJ1dWlkIiwibWFqb3IiLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJtaW5vciIsInR4UG93ZXIiLCJkZWJ1ZyIsInNraXBTZXJ2aWNlIiwiZW11bGF0ZSIsImNvbmZpZ3VyZSIsIl9pZGVudGlmaWVyIiwiX2NvcmRvdmFQbHVnaW5JbnN0YWxsZWQiLCJfaGFzQmVlbkNhbGlicmF0ZWQiLCJfY2FsbGJhY2tzIiwiX2VtdWxhdGVkQmVhY29ucyIsIl9kaWRSYW5nZUJlYWNvbnNJblJlZ2lvbiIsImJpbmQiLCJvcHRpb25zIiwicmVhZHkiLCJyZXN0YXJ0QWR2ZXJ0aXNpbmciLCJyZXN0YXJ0UmFuZ2luZyIsIl9jaGVja1BsdWdpbiIsInRoZW4iLCJpc0NoZWNrZWQiLCJjb3Jkb3ZhIiwicGx1Z2lucyIsImxvY2F0aW9uTWFuYWdlciIsImRpc2FibGVEZWJ1Z05vdGlmaWNhdGlvbnMiLCJkaXNhYmxlRGVidWdMb2dzIiwiX3JhbmdpbmdJbnRlcnZhbElkIiwiY2xlYXJJbnRlcnZhbCIsImxlbmd0aCIsIm51bVBlZXJzIiwiaSIsInBlZXJSZXN1bHQiLCJyc3NpIiwicHJveGltaXR5IiwicHVzaCIsInNldEludGVydmFsIiwiZm9yRWFjaCIsInJlcyIsIm1heCIsIm1pbiIsImJlYWNvbnMiLCJjYWxsYmFjayIsImFkZCIsImhhcyIsImRlbGV0ZSIsIl9zdGFydEFkdmVydGlzaW5nIiwiX3N0YXJ0UmFuZ2luZyIsIl9zdG9wQWR2ZXJ0aXNpbmciLCJfc3RvcFJhbmdpbmciLCJjb25zb2xlIiwid2FybiIsIl9jYWxjdWxhdGVBY2N1cmFjeSIsImlkZW50aWZpZXIiLCJiZWFjb25SZWdpb24iLCJCZWFjb25SZWdpb24iLCJpc0FkdmVydGlzaW5nQXZhaWxhYmxlIiwiaXNTdXBwb3J0ZWQiLCJzdGFydEFkdmVydGlzaW5nIiwiZmFpbCIsImVycm9yIiwiZG9uZSIsImxvZyIsImUiLCJzdG9wQWR2ZXJ0aXNpbmciLCJkZWxlZ2F0ZSIsIkRlbGVnYXRlIiwiZGlkUmFuZ2VCZWFjb25zSW5SZWdpb24iLCJzZXREZWxlZ2F0ZSIsInJlcXVlc3RXaGVuSW5Vc2VBdXRob3JpemF0aW9uIiwic3RhcnRSYW5naW5nQmVhY29uc0luUmVnaW9uIiwic3RvcFJhbmdpbmdCZWFjb25zSW5SZWdpb24iLCJwbHVnaW5SZXN1bHQiLCJyZXF1aXJlIiwibWV0YWRhdGEiLCJkaXNwbGF5SW5zdGFsbEluc3RydWN0aW9ucyIsInVuZGVmaW5lZCIsIm1zZyIsInJlc29sdmUiLCJyYXRpbyIsInBvdyIsInZhbCIsInJlZ2lzdGVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBOzs7O0FBRUE7QUFDQSxJQUFNQSxhQUFhLGdCQUFuQjs7QUFFQSxJQUFNQyxzQkFBc0IsMkJBQTVCO0FBQ0EsSUFBTUMsa0NBQWtDLE9BQXhDO0FBQ0EsSUFBTUMsNEJBQTRCLHlEQUFsQzs7SUFFTUMsTTs7O0FBQ0o7QUFDQSxvQkFBYztBQUFBOztBQUdaOzs7Ozs7O0FBSFksc0lBQ05KLFVBRE0sRUFDTSxLQUROOztBQVVaLFFBQU1LLFdBQVc7QUFDZkMsWUFBTSxzQ0FEUztBQUVmQyxhQUFPQyxLQUFLQyxLQUFMLENBQVdELEtBQUtFLE1BQUwsS0FBZ0IsS0FBM0IsQ0FGUTtBQUdmQyxhQUFPSCxLQUFLQyxLQUFMLENBQVdELEtBQUtFLE1BQUwsS0FBZ0IsS0FBM0IsQ0FIUTtBQUlmRSxlQUFTLENBQUMsRUFKSztBQUtmQyxhQUFPLEtBTFE7QUFNZkMsbUJBQWEsS0FORTtBQU9mQyxlQUFTO0FBUE0sS0FBakI7O0FBVUEsVUFBS0MsU0FBTCxDQUFlWCxRQUFmOztBQUVBLFVBQUtZLFdBQUwsR0FBbUIsa0JBQW5CO0FBQ0E7QUFDQSxVQUFLQyx1QkFBTCxHQUErQixLQUEvQjtBQUNBLFVBQUtDLGtCQUFMLEdBQTBCLEtBQTFCO0FBQ0EsVUFBS0MsVUFBTCxHQUFrQixtQkFBbEI7O0FBRUEsVUFBS0MsZ0JBQUwsR0FBd0IsRUFBeEI7QUFDQTtBQUNBLFVBQUtDLHdCQUFMLEdBQWdDLE1BQUtBLHdCQUFMLENBQThCQyxJQUE5QixPQUFoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBckNZO0FBc0NiOztBQUVEOzs7Ozs7Ozs7QUEyRUE7NEJBQ1E7QUFBQTs7QUFDTjs7QUFFQSxVQUFJLEtBQUtDLE9BQUwsQ0FBYVYsV0FBakIsRUFBOEI7QUFDNUIsYUFBS1csS0FBTDtBQUNBLGFBQUtDLGtCQUFMLEdBQTBCLFlBQU0sQ0FBRSxDQUFsQztBQUNBLGFBQUtDLGNBQUwsR0FBc0IsWUFBTSxDQUFFLENBQTlCO0FBQ0E7QUFDRDs7QUFFRDtBQUNBLFVBQUksS0FBS0gsT0FBTCxDQUFhVCxPQUFiLEtBQXlCLElBQTdCLEVBQW1DO0FBQ2pDLGFBQUthLFlBQUwsR0FBb0JDLElBQXBCLENBQXlCLHFCQUFhO0FBQ3BDLGNBQUlDLFNBQUosRUFDRSxPQUFLTCxLQUFMOztBQUVGLGNBQUksT0FBS0QsT0FBTCxDQUFhWCxLQUFiLEtBQXVCLEtBQTNCLEVBQWtDO0FBQ2hDa0Isb0JBQVFDLE9BQVIsQ0FBZ0JDLGVBQWhCLENBQWdDQyx5QkFBaEM7QUFDQUgsb0JBQVFDLE9BQVIsQ0FBZ0JDLGVBQWhCLENBQWdDRSxnQkFBaEM7QUFDRDtBQUNGLFNBUkQ7QUFTRCxPQVZELE1BVU87QUFDTCxhQUFLVixLQUFMO0FBQ0EsYUFBS0Msa0JBQUwsR0FBMEIsWUFBTSxDQUFFLENBQWxDO0FBQ0EsYUFBS1Usa0JBQUwsR0FBMEIsSUFBMUI7O0FBRUEsYUFBS1QsY0FBTCxHQUFzQixZQUFNO0FBQzFCVSx3QkFBYyxPQUFLRCxrQkFBbkI7O0FBRUEsaUJBQUtmLGdCQUFMLENBQXNCaUIsTUFBdEIsR0FBK0IsQ0FBL0I7QUFDQSxjQUFNQyxXQUFXLE9BQUtmLE9BQUwsQ0FBYVQsT0FBYixDQUFxQndCLFFBQXRDO0FBQ0EsY0FBSTVCLFFBQVEsQ0FBWjs7QUFFQSxlQUFLLElBQUk2QixJQUFJLENBQWIsRUFBZ0JBLElBQUlELFFBQXBCLEVBQThCQyxHQUE5QixFQUFtQztBQUNqQyxnQkFBTUMsYUFBYTtBQUNqQmxDLHFCQUFPLE9BQUtpQixPQUFMLENBQWFqQixLQURIO0FBRWpCSSxxQkFBT0EsVUFBVSxPQUFLYSxPQUFMLENBQWFiLEtBQXZCLEdBQStCQSxTQUFTLENBQXhDLEdBQTRDQSxLQUZsQztBQUdqQitCLG9CQUFNLENBQUMsQ0FBRCxJQUFNLEtBQUtsQyxLQUFLRSxNQUFMLEVBQUwsR0FBcUIsRUFBM0IsQ0FIVyxFQUd1QjtBQUN4Q2lDLHlCQUFXO0FBSk0sYUFBbkI7O0FBT0FoQyxxQkFBUyxDQUFUOztBQUVBLG1CQUFLVSxnQkFBTCxDQUFzQnVCLElBQXRCLENBQTJCSCxVQUEzQjtBQUNEOztBQUVELGlCQUFLTCxrQkFBTCxHQUEwQlMsWUFBWSxZQUFNO0FBQzFDLG1CQUFLeEIsZ0JBQUwsQ0FBc0J5QixPQUF0QixDQUE4QixVQUFDQyxHQUFELEVBQVM7QUFDckNBLGtCQUFJTCxJQUFKLElBQVlsQyxLQUFLRSxNQUFMLEtBQWdCLENBQWhCLEdBQW9CLENBQWhDO0FBQ0FxQyxrQkFBSUwsSUFBSixHQUFXbEMsS0FBS3dDLEdBQUwsQ0FBUyxDQUFDLEdBQVYsRUFBZXhDLEtBQUt5QyxHQUFMLENBQVMsQ0FBQyxFQUFWLEVBQWNGLElBQUlMLElBQWxCLENBQWYsQ0FBWDtBQUNELGFBSEQ7O0FBS0EsbUJBQUtwQix3QkFBTCxDQUE4QixFQUFFNEIsU0FBUyxPQUFLN0IsZ0JBQWhCLEVBQTlCO0FBQ0QsV0FQeUIsRUFPdkIsSUFQdUIsQ0FBMUI7QUFRRCxTQTVCRDs7QUE4QkEsYUFBS00sY0FBTDtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7O2dDQUtZd0IsUSxFQUFVO0FBQ3BCLFdBQUsvQixVQUFMLENBQWdCZ0MsR0FBaEIsQ0FBb0JELFFBQXBCO0FBQ0Q7O0FBRUQ7Ozs7OzttQ0FHZUEsUSxFQUFVO0FBQ3ZCLFVBQUksS0FBSy9CLFVBQUwsQ0FBZ0JpQyxHQUFoQixDQUFvQkYsUUFBcEIsQ0FBSixFQUNFLEtBQUsvQixVQUFMLENBQWdCa0MsTUFBaEIsQ0FBdUJILFFBQXZCO0FBQ0g7Ozt1Q0FFa0I7QUFDakIsV0FBS0ksaUJBQUw7QUFDRDs7O21DQUVjO0FBQ2IsV0FBS0MsYUFBTDtBQUNEOztBQUVEOzs7Ozs7eUNBR3FCO0FBQ25CLFdBQUtDLGdCQUFMO0FBQ0EsV0FBS0YsaUJBQUw7QUFDRDs7QUFFRDs7Ozs7O3FDQUdpQjtBQUNmLFdBQUtHLFlBQUw7QUFDQSxXQUFLRixhQUFMO0FBQ0Q7O0FBRUQ7Ozs7OzsrQkFHV2QsSSxFQUFNO0FBQ2YsVUFBSSxDQUFDLEtBQUt2QixrQkFBVixFQUE4QjtBQUM1QndDLGdCQUFRQyxJQUFSLENBQWEsbUZBQWIsRUFBa0csS0FBS3BDLE9BQUwsQ0FBYVosT0FBL0csRUFBd0gsSUFBeEg7QUFDQSxhQUFLTyxrQkFBTCxHQUEwQixJQUExQjtBQUNEOztBQUVELGFBQU8sS0FBSzBDLGtCQUFMLENBQXdCLEtBQUtqRCxPQUE3QixFQUFzQzhCLElBQXRDLENBQVA7QUFDRDs7QUFFRDs7Ozt3Q0FDb0I7QUFDbEIsVUFBSSxLQUFLeEIsdUJBQVQsRUFBa0M7QUFDaEMsWUFBTTRDLGFBQWEsS0FBSzdDLFdBQXhCO0FBQ0EsWUFBTVgsT0FBTyxLQUFLa0IsT0FBTCxDQUFhbEIsSUFBMUI7QUFDQSxZQUFNSyxRQUFRLEtBQUthLE9BQUwsQ0FBYWIsS0FBM0I7QUFDQSxZQUFNSixRQUFRLEtBQUtpQixPQUFMLENBQWFqQixLQUEzQjtBQUNBLFlBQU13RCxlQUFlLElBQUloQyxRQUFRQyxPQUFSLENBQWdCQyxlQUFoQixDQUFnQytCLFlBQXBDLENBQWlERixVQUFqRCxFQUE2RHhELElBQTdELEVBQW1FQyxLQUFuRSxFQUEwRUksS0FBMUUsQ0FBckI7O0FBRUE7QUFDQW9CLGdCQUFRQyxPQUFSLENBQWdCQyxlQUFoQixDQUNHZ0Msc0JBREgsR0FFR3BDLElBRkgsQ0FFUSxVQUFTcUMsV0FBVCxFQUFzQjtBQUMxQixjQUFJQSxXQUFKLEVBQWlCO0FBQ2Y7QUFDQW5DLG9CQUFRQyxPQUFSLENBQWdCQyxlQUFoQixDQUNHa0MsZ0JBREgsQ0FDb0JKLFlBRHBCLEVBRUdLLElBRkgsQ0FFUVQsUUFBUVUsS0FGaEIsRUFHR0MsSUFISDtBQUlELFdBTkQsTUFNTztBQUNMWCxvQkFBUVksR0FBUixDQUFZLDJCQUFaO0FBQ0Q7QUFDRixTQVpILEVBYUdILElBYkgsQ0FhUSxVQUFTSSxDQUFULEVBQVk7QUFBRWIsa0JBQVFVLEtBQVIsQ0FBY0csQ0FBZDtBQUFtQixTQWJ6QyxFQWNHRixJQWRIO0FBZUQ7QUFDRjs7QUFFRDs7Ozt1Q0FDbUI7QUFDakIsVUFBSSxLQUFLcEQsdUJBQVQsRUFBa0M7QUFDaENhLGdCQUFRQyxPQUFSLENBQWdCQyxlQUFoQixDQUNHd0MsZUFESCxHQUVHTCxJQUZILENBRVEsVUFBU0ksQ0FBVCxFQUFZO0FBQUViLGtCQUFRVSxLQUFSLENBQWNHLENBQWQ7QUFBbUIsU0FGekMsRUFHR0YsSUFISDtBQUlEO0FBQ0Y7O0FBRUQ7Ozs7b0NBQ2dCO0FBQ2QsVUFBSSxLQUFLcEQsdUJBQVQsRUFBa0M7QUFDaEMsWUFBTXdELFdBQVcsSUFBSTNDLFFBQVFDLE9BQVIsQ0FBZ0JDLGVBQWhCLENBQWdDMEMsUUFBcEMsRUFBakI7QUFDQUQsaUJBQVNFLHVCQUFULEdBQW1DLEtBQUt0RCx3QkFBeEM7QUFDQVMsZ0JBQVFDLE9BQVIsQ0FBZ0JDLGVBQWhCLENBQWdDNEMsV0FBaEMsQ0FBNENILFFBQTVDOztBQUVBLFlBQU1wRSxPQUFPLEtBQUtrQixPQUFMLENBQWFsQixJQUExQjtBQUNBLFlBQU13RCxhQUFhLEtBQUs3QyxXQUF4QjtBQUNBLFlBQU04QyxlQUFlLElBQUloQyxRQUFRQyxPQUFSLENBQWdCQyxlQUFoQixDQUFnQytCLFlBQXBDLENBQWlERixVQUFqRCxFQUE2RHhELElBQTdELENBQXJCOztBQUVBO0FBQ0F5QixnQkFBUUMsT0FBUixDQUFnQkMsZUFBaEIsQ0FBZ0M2Qyw2QkFBaEM7QUFDQTs7QUFFQS9DLGdCQUFRQyxPQUFSLENBQWdCQyxlQUFoQixDQUNHOEMsMkJBREgsQ0FDK0JoQixZQUQvQixFQUVHSyxJQUZILENBRVEsVUFBU0ksQ0FBVCxFQUFZO0FBQUViLGtCQUFRVSxLQUFSLENBQWNHLENBQWQ7QUFBbUIsU0FGekMsRUFHR0YsSUFISDtBQUlEO0FBQ0Y7O0FBRUQ7Ozs7bUNBQ2U7QUFDYixVQUFJLEtBQUtwRCx1QkFBVCxFQUFrQztBQUNoQyxZQUFNWixPQUFPLEtBQUtrQixPQUFMLENBQWFsQixJQUExQjtBQUNBLFlBQU13RCxhQUFhLEtBQUs3QyxXQUF4QjtBQUNBLFlBQU04QyxlQUFlLElBQUloQyxRQUFRQyxPQUFSLENBQWdCQyxlQUFoQixDQUFnQytCLFlBQXBDLENBQWlERixVQUFqRCxFQUE2RHhELElBQTdELENBQXJCOztBQUVBeUIsZ0JBQVFDLE9BQVIsQ0FBZ0JDLGVBQWhCLENBQ0crQywwQkFESCxDQUM4QmpCLFlBRDlCLEVBRUdLLElBRkgsQ0FFUSxVQUFTSSxDQUFULEVBQVk7QUFBRWIsa0JBQVFVLEtBQVIsQ0FBY0csQ0FBZDtBQUFtQixTQUZ6QyxFQUdHRixJQUhIO0FBSUQ7QUFDRjs7QUFFRDs7Ozs2Q0FDeUJXLFksRUFBYztBQUNyQztBQUNBLFdBQUs3RCxVQUFMLENBQWdCMEIsT0FBaEIsQ0FBd0IsVUFBU0ssUUFBVCxFQUFtQjtBQUN6Q0EsaUJBQVM4QixZQUFUO0FBQ0QsT0FGRDtBQUdEOztBQUVEOzs7O21DQUNlO0FBQ2IsVUFBTWpELFVBQVVELFFBQVFtRCxPQUFSLENBQWdCLHFCQUFoQixFQUF1Q0MsUUFBdkQ7QUFDQSxVQUFJQyw2QkFBNkIsS0FBakM7O0FBRUEsVUFBSXBELFFBQVEvQixtQkFBUixNQUFpQ29GLFNBQXJDLEVBQWdEO0FBQzlDLFlBQU1DLE1BQU0sa0ZBQVo7QUFDQTNCLGdCQUFRQyxJQUFSLENBQWEwQixHQUFiOztBQUVBRixxQ0FBNkIsSUFBN0I7QUFDRCxPQUxELE1BS087QUFDTCxZQUFJcEQsUUFBUS9CLG1CQUFSLE1BQWlDQywrQkFBckMsRUFBc0U7QUFDcEUsY0FBTW9GLDRGQUNGdEQsUUFBUS9CLG1CQUFSLENBREUsbUJBQ3dDQywrQkFEeEMsZ0RBQU47QUFFQXlELGtCQUFRQyxJQUFSLENBQWEwQixJQUFiOztBQUVBRix1Q0FBNkIsSUFBN0I7QUFDRDs7QUFFRCxhQUFLbEUsdUJBQUwsR0FBK0IsSUFBL0I7QUFDRDs7QUFFRCxVQUFJa0UsMEJBQUosRUFBZ0M7QUFDOUIsWUFBTUUscUNBQ1lyRixtQkFEWixVQUNvQ0MsK0JBRHBDLDJDQUVpQkMseUJBRmpCLFNBRThDRCwrQkFGcEQ7QUFHQXlELGdCQUFRWSxHQUFSLENBQVllLEtBQVo7QUFDRDs7QUFFRCxVQUFJLEtBQUtwRSx1QkFBVCxFQUNFLE9BQU8sa0JBQVFxRSxPQUFSLENBQWdCLElBQWhCLENBQVAsQ0FERixLQUdFLE9BQU8sa0JBQVFBLE9BQVIsQ0FBZ0IsS0FBaEIsQ0FBUDtBQUNIOztBQUVEOzs7Ozs7Ozs7dUNBTW1CM0UsTyxFQUFTOEIsSSxFQUFNO0FBQ2hDLFVBQUlBLFNBQVMsQ0FBYixFQUNFLE9BQU8sR0FBUDs7QUFFRixVQUFJOEMsUUFBUTlDLE9BQU8sR0FBUCxHQUFhOUIsT0FBekI7O0FBRUEsVUFBSTRFLFFBQVEsR0FBWixFQUNFLE9BQU9oRixLQUFLaUYsR0FBTCxDQUFTRCxLQUFULEVBQWdCLEVBQWhCLENBQVAsQ0FERixLQUdFLE9BQVEsVUFBVWhGLEtBQUtpRixHQUFMLENBQVNELEtBQVQsRUFBZ0IsTUFBaEIsQ0FBVixHQUFvQyxLQUE1QztBQUNIOzs7d0JBL1RVO0FBQ1QsYUFBTyxLQUFLaEUsT0FBTCxDQUFhbEIsSUFBcEI7QUFDRDs7QUFFRDs7Ozs7c0JBSVNvRixHLEVBQUs7QUFBRTtBQUNkLFdBQUtsRSxPQUFMLENBQWFsQixJQUFiLEdBQW9Cb0YsR0FBcEI7QUFDRDs7QUFFRDs7Ozs7O3dCQUdZO0FBQ1YsYUFBTyxLQUFLbEUsT0FBTCxDQUFhakIsS0FBcEI7QUFDRDs7QUFFRDs7Ozs7c0JBSVVtRixHLEVBQUs7QUFDYixVQUFLQSxPQUFPLEtBQVIsSUFBbUJBLE9BQU8sQ0FBOUIsRUFDRSxLQUFLbEUsT0FBTCxDQUFhakIsS0FBYixHQUFxQm1GLEdBQXJCLENBREYsS0FHRS9CLFFBQVFDLElBQVIsQ0FBYSxrREFBYixFQUFpRThCLEdBQWpFLEVBQXNFLDhCQUF0RTtBQUNIOztBQUVEOzs7Ozs7d0JBR1k7QUFDVixhQUFPLEtBQUtsRSxPQUFMLENBQWFiLEtBQXBCO0FBQ0Q7O0FBRUQ7Ozs7O3NCQUlVK0UsRyxFQUFLO0FBQ2IsVUFBSUEsT0FBTyxDQUFQLElBQVlBLE9BQU8sS0FBdkIsRUFDRSxLQUFLbEUsT0FBTCxDQUFhYixLQUFiLEdBQXFCK0UsR0FBckIsQ0FERixLQUdFL0IsUUFBUUMsSUFBUixDQUFhLGtEQUFiLEVBQWlFOEIsR0FBakUsRUFBc0UsOEJBQXRFO0FBQ0g7O0FBRUQ7Ozs7Ozs7O3dCQUtjO0FBQ1osYUFBTyxLQUFLbEUsT0FBTCxDQUFhWixPQUFwQjtBQUNEOztBQUVEOzs7Ozs7O3NCQU1ZOEUsRyxFQUFLO0FBQ2YsVUFBSUEsT0FBTyxDQUFDLEdBQVIsSUFBZUEsT0FBTyxDQUExQixFQUE2QjtBQUMzQixhQUFLbEUsT0FBTCxDQUFhWixPQUFiLEdBQXVCOEUsR0FBdkI7QUFDQSxhQUFLdkUsa0JBQUwsR0FBMEIsSUFBMUI7QUFDRCxPQUhELE1BR087QUFDTHdDLGdCQUFRQyxJQUFSLENBQWEseUNBQWIsRUFBd0Q4QixHQUF4RCxFQUE2RCx5Q0FBN0Q7QUFDRDtBQUNGOzs7OztBQTRQSCx1QkFBZUMsUUFBZixDQUF3QjNGLFVBQXhCLEVBQW9DSSxNQUFwQzs7a0JBRWVBLE0iLCJmaWxlIjoiQmVhY29uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU2VydmljZSwgc2VydmljZU1hbmFnZXIgfSBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5cbi8qIGJhc2VkIG9uIGNvcmRvdmEtcGx1Z2luLWliZWFjb246IGh0dHBzOi8vZ2l0aHViLmNvbS9wZXRlcm1ldHovY29yZG92YS1wbHVnaW4taWJlYWNvbi5naXQgKi9cbmNvbnN0IFNFUlZJQ0VfSUQgPSAnc2VydmljZTpiZWFjb24nO1xuXG5jb25zdCBDT1JET1ZBX1BMVUdJTl9OQU1FID0gJ2NvbS51bmFyaW4uY29yZG92YS5iZWFjb24nO1xuY29uc3QgQ09SRE9WQV9QTFVHSU5fQVNTRVJURURfVkVSU0lPTiA9ICczLjMuMCc7XG5jb25zdCBDT1JET1ZBX1BMVUdJTl9SRVBPU0lUT1JZID0gJ2h0dHBzOi8vZ2l0aHViLmNvbS9wZXRlcm1ldHovY29yZG92YS1wbHVnaW4taWJlYWNvbi5naXQnO1xuXG5jbGFzcyBCZWFjb24gZXh0ZW5kcyBTZXJ2aWNlIHtcbiAgLyoqIF88c3BhbiBjbGFzcz0nd2FybmluZyc+X19XQVJOSU5HX188L3NwYW4+IFRoaXMgY2xhc3Mgc2hvdWxkIG5ldmVyIGJlIGluc3RhbmNpYXRlZCBtYW51YWxseV8gKi9cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoU0VSVklDRV9JRCwgZmFsc2UpO1xuXG4gICAgLyoqXG4gICAgICogLSB1dWlkIHJlcHJlc2VudCB0aGUgYmVhY29uIHJlZ2lvbi4gYSBnaXZlbiByYW5naW5nIGNhbGxiYWNrIGNhbiBvYmx5IG1vbml0b3JcbiAgICAgKiBiZWFjb25zIHdpdGggdGhlIHNhbWUgdXVpZCwgaGVuY2UgdXVpZCBpbiB0aGUgc291bmR3b3JrIGJlYWNvbiBzZXJ2aWNlIGlzIGhhcmRjb2RlZC5cbiAgICAgKiAtIGlkZW50aWZpZXIgY2FtZSB3aXRoIHRoZSBjb3Jkb3ZhLXBsdWdpbi1pYmVhY29uIEFQSSwgbm8gcmVhbCBjdWVzIHdoeSBpdCdzIHRoZXJlLlxuICAgICAqIC0gbWFqb3IgLyBtaW5vcjogZWFjaCBlbmNvZGVkIG9uIDE2IGJpdHMsIHRoZXNlIHZhbHVlcyBhcmUgdG8gYmUgdXNlZCB0byBkZWZpbmVkIGFcbiAgICAgKiB1bmlxdWUgc291bmR3b3JrIGNsaWVudC5cbiAgICAgKi9cbiAgICBjb25zdCBkZWZhdWx0cyA9IHtcbiAgICAgIHV1aWQ6ICc3NDI3OEJEQS1CNjQ0LTQ1MjAtOEYwQy03MjBFQUYwNTk5MzUnLFxuICAgICAgbWFqb3I6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDY1NTAwKSxcbiAgICAgIG1pbm9yOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA2NTUwMCksXG4gICAgICB0eFBvd2VyOiAtNTUsXG4gICAgICBkZWJ1ZzogZmFsc2UsXG4gICAgICBza2lwU2VydmljZTogZmFsc2UsXG4gICAgICBlbXVsYXRlOiBudWxsLFxuICAgIH07XG5cbiAgICB0aGlzLmNvbmZpZ3VyZShkZWZhdWx0cyk7XG5cbiAgICB0aGlzLl9pZGVudGlmaWVyID0gJ2FkdmVydGlzZWRCZWFjb24nO1xuICAgIC8vIGxvY2FsIGF0dHJpYnV0ZXNcbiAgICB0aGlzLl9jb3Jkb3ZhUGx1Z2luSW5zdGFsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5faGFzQmVlbkNhbGlicmF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSBuZXcgU2V0KCk7XG5cbiAgICB0aGlzLl9lbXVsYXRlZEJlYWNvbnMgPSBbXTtcbiAgICAvLyBiaW5kIGxvY2FsIG1ldGhvZHNcbiAgICB0aGlzLl9kaWRSYW5nZUJlYWNvbnNJblJlZ2lvbiA9IHRoaXMuX2RpZFJhbmdlQmVhY29uc0luUmVnaW9uLmJpbmQodGhpcyk7XG4gICAgLy8gdGhpcy5fc3RhcnRBZHZlcnRpc2luZyA9IHRoaXMuX3N0YXJ0QWR2ZXJ0aXNpbmcuYmluZCh0aGlzKTtcbiAgICAvLyB0aGlzLl9zdG9wQWR2ZXJ0aXNpbmcgPSB0aGlzLl9zdG9wQWR2ZXJ0aXNpbmcuYmluZCh0aGlzKTtcbiAgICAvLyB0aGlzLl9zdGFydFJhbmdpbmcgPSB0aGlzLl9zdGFydFJhbmdpbmcuYmluZCh0aGlzKTtcbiAgICAvLyB0aGlzLl9zdG9wUmFuZ2luZyA9IHRoaXMuX3N0b3BSYW5naW5nLmJpbmQodGhpcyk7XG4gICAgLy8gdGhpcy5fY2hlY2tQbHVnaW4gPSB0aGlzLl9jaGVja1BsdWdpbi5iaW5kKHRoaXMpO1xuICAgIC8vIHRoaXMucmVzdGFydEFkdmVydGlzaW5nID0gdGhpcy5yZXN0YXJ0QWR2ZXJ0aXNpbmcuYmluZCh0aGlzKTtcbiAgICAvLyB0aGlzLnJlc3RhcnRSYW5naW5nID0gdGhpcy5yZXN0YXJ0UmFuZ2luZy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhZHZlcnRpc2luZyBpQmVhY29uIHJlZ2lvbiBVVUlEXG4gICAqL1xuICBnZXQgdXVpZCgpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnV1aWQ7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGFkdmVydGlzaW5nIGlCZWFjb24gVVVJRFxuICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsIC0gbmV3IFVVSURcbiAgICovXG4gIHNldCB1dWlkKHZhbCkgeyAvLyBVU0UgQVQgWU9VUiBPV04gUklTS1NcbiAgICB0aGlzLm9wdGlvbnMudXVpZCA9IHZhbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWR2ZXJ0aXNpbmcgaUJlYWNvbiBtYWpvciBJRFxuICAgKi9cbiAgZ2V0IG1ham9yKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubWFqb3I7XG4gIH1cblxuICAvKipcbiAgICogU2V0IGFkdmVydGlzaW5nIGlCZWFjb24gbWFqb3IgSURcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbCAtIG5ldyBtYWpvciBJRFxuICAgKi9cbiAgc2V0IG1ham9yKHZhbCkge1xuICAgIGlmICgodmFsIDw9IDY1NTM1KSAmJiAodmFsID49IDApKVxuICAgICAgdGhpcy5vcHRpb25zLm1ham9yID0gdmFsO1xuICAgIGVsc2VcbiAgICAgIGNvbnNvbGUud2FybignV0FSTklORzogYXR0ZW1wdCB0byBkZWZpbmUgaW52YWxpZCBtYWpvciB2YWx1ZTogJywgdmFsLCAnIChtdXN0IGJlIGluIHJhbmdlIFswLDY1NTM1XScpO1xuICB9XG5cbiAgLyoqXG4gICogR2V0IGFkdmVydGlzaW5nIGlCZWFjb24gbWlub3IgSURcbiAgKi9cbiAgZ2V0IG1pbm9yKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMubWlub3I7XG4gIH1cblxuICAvKipcbiAgKiBTZXQgYWR2ZXJ0aXNpbmcgaUJlYWNvbiBtaW5vciBJRFxuICAqIEBwYXJhbSB7TnVtYmVyfSB2YWwgLSBuZXcgbWlub3IgSURcbiAgKi9cbiAgc2V0IG1pbm9yKHZhbCkge1xuICAgIGlmICh2YWwgPj0gMCAmJiB2YWwgPD0gNjU1MzUpXG4gICAgICB0aGlzLm9wdGlvbnMubWlub3IgPSB2YWw7XG4gICAgZWxzZVxuICAgICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBhdHRlbXB0IHRvIGRlZmluZSBpbnZhbGlkIG1pbm9yIHZhbHVlOiAnLCB2YWwsICcgKG11c3QgYmUgaW4gcmFuZ2UgWzAsNjU1MzVdJyk7XG4gIH1cblxuICAvKipcbiAgKiBHZXQgcmVmZXJlbmNlIHNpZ25hbCBzdHJlbmd0aCwgdXNlZCBmb3IgZGlzdGFuY2UgZXN0aW1hdGlvbi5cbiAgKiB0eFBvd2VyIGlzIHRoZSByc3NpIChpbiBkQikgYXMgbWVzdXJlZCBieSBhbm90aGVyIGJlYWNvblxuICAqIGxvY2F0ZWQgYXQgMSBtZXRlciBhd2F5IGZyb20gdGhpcyBiZWFjb24uXG4gICovXG4gIGdldCB0eFBvd2VyKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMudHhQb3dlcjtcbiAgfVxuXG4gIC8qKlxuICAqIEdldCByZWZlcmVuY2Ugc2lnbmFsIHN0cmVuZ3RoLCB1c2VkIGZvciBkaXN0YW5jZSBlc3RpbWF0aW9uLlxuICAqIHR4UG93ZXIgaXMgdGhlIHJzc2kgKGluIGRCKSBhcyBtZXN1cmVkIGJ5IGFub3RoZXIgYmVhY29uXG4gICogbG9jYXRlZCBhdCAxIG1ldGVyIGF3YXkgZnJvbSB0aGlzIGJlYWNvbi5cbiAgKiBAcGFyYW0ge051bWJlcn0gdmFsIC0gbmV3IHNpZ25hbCBzdHJlbmd0aCByZWZlcmVuY2VcbiAgKi9cbiAgc2V0IHR4UG93ZXIodmFsKSB7XG4gICAgaWYgKHZhbCA+PSAtMjAwICYmIHZhbCA8PSAwKSB7XG4gICAgICB0aGlzLm9wdGlvbnMudHhQb3dlciA9IHZhbDtcbiAgICAgIHRoaXMuX2hhc0JlZW5DYWxpYnJhdGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKCdXQVJOSU5HOiBhIHJlZmVyZW5jZSB0eFBvd2VyIHZhbHVlIG9mOiAnLCB2YWwsICcgZEIgaXMgdW5saWtlbHkgKHNldCBoYXMgYmVlbiByZWplY3RlZCknKTtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgc3RhcnQoKSB7XG4gICAgc3VwZXIuc3RhcnQoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuc2tpcFNlcnZpY2UpIHtcbiAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgIHRoaXMucmVzdGFydEFkdmVydGlzaW5nID0gKCkgPT4ge307XG4gICAgICB0aGlzLnJlc3RhcnRSYW5naW5nID0gKCkgPT4ge307XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gc2VydmljZSByZWFkeSB3aGVuIHBsdWdpbiBpcyBjaGVja2VkXG4gICAgaWYgKHRoaXMub3B0aW9ucy5lbXVsYXRlID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9jaGVja1BsdWdpbigpLnRoZW4oaXNDaGVja2VkID0+IHtcbiAgICAgICAgaWYgKGlzQ2hlY2tlZClcbiAgICAgICAgICB0aGlzLnJlYWR5KCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWJ1ZyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBjb3Jkb3ZhLnBsdWdpbnMubG9jYXRpb25NYW5hZ2VyLmRpc2FibGVEZWJ1Z05vdGlmaWNhdGlvbnMoKTtcbiAgICAgICAgICBjb3Jkb3ZhLnBsdWdpbnMubG9jYXRpb25NYW5hZ2VyLmRpc2FibGVEZWJ1Z0xvZ3MoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVhZHkoKTtcbiAgICAgIHRoaXMucmVzdGFydEFkdmVydGlzaW5nID0gKCkgPT4ge307XG4gICAgICB0aGlzLl9yYW5naW5nSW50ZXJ2YWxJZCA9IG51bGw7XG5cbiAgICAgIHRoaXMucmVzdGFydFJhbmdpbmcgPSAoKSA9PiB7XG4gICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fcmFuZ2luZ0ludGVydmFsSWQpO1xuXG4gICAgICAgIHRoaXMuX2VtdWxhdGVkQmVhY29ucy5sZW5ndGggPSAwO1xuICAgICAgICBjb25zdCBudW1QZWVycyA9IHRoaXMub3B0aW9ucy5lbXVsYXRlLm51bVBlZXJzO1xuICAgICAgICBsZXQgbWlub3IgPSAwO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtUGVlcnM7IGkrKykge1xuICAgICAgICAgIGNvbnN0IHBlZXJSZXN1bHQgPSB7XG4gICAgICAgICAgICBtYWpvcjogdGhpcy5vcHRpb25zLm1ham9yLFxuICAgICAgICAgICAgbWlub3I6IG1pbm9yID09PSB0aGlzLm9wdGlvbnMubWlub3IgPyBtaW5vciArPSAxIDogbWlub3IsXG4gICAgICAgICAgICByc3NpOiAtMSAqICg4MCAqIE1hdGgucmFuZG9tKCkgKyAyMCksICAgLy8gWy0yMCwgLTEwMF1cbiAgICAgICAgICAgIHByb3hpbWl0eTogJ2hpJyxcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBtaW5vciArPSAxO1xuXG4gICAgICAgICAgdGhpcy5fZW11bGF0ZWRCZWFjb25zLnB1c2gocGVlclJlc3VsdCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9yYW5naW5nSW50ZXJ2YWxJZCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICB0aGlzLl9lbXVsYXRlZEJlYWNvbnMuZm9yRWFjaCgocmVzKSA9PiB7XG4gICAgICAgICAgICByZXMucnNzaSArPSBNYXRoLnJhbmRvbSgpICogNiAtIDM7XG4gICAgICAgICAgICByZXMucnNzaSA9IE1hdGgubWF4KC0xMDAsIE1hdGgubWluKC0yMCwgcmVzLnJzc2kpKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHRoaXMuX2RpZFJhbmdlQmVhY29uc0luUmVnaW9uKHsgYmVhY29uczogdGhpcy5fZW11bGF0ZWRCZWFjb25zIH0pO1xuICAgICAgICB9LCAxMDAwKTtcbiAgICAgIH07XG5cbiAgICAgIHRoaXMucmVzdGFydFJhbmdpbmcoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgaW52b2tlZCB3aGVuIG5laWdoYm9yaW5nIGliZWFjb24gbGlzdCBpcyB1cGRhdGVkXG4gICAqIChpLmUuIGV2ZXJ5IG50aCBtaWxsaXNlYy4gb25jZSBhIHNpbmdsZSBiZWFjb24gaXMgcmVnaXN0ZXJlZClcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICovXG4gIGFkZExpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzLmFkZChjYWxsYmFjayk7XG4gIH1cblxuICAvKipcbiAgICogcmVtb3ZlIHJlZ2lzdGVyZWQgY2FsbGJhY2sgZnJvbSBzdGFjayAoc2VlICdhZGRDYWxsYmFjaycpXG4gICAqL1xuICByZW1vdmVMaXN0ZW5lcihjYWxsYmFjaykge1xuICAgIGlmICh0aGlzLl9jYWxsYmFja3MuaGFzKGNhbGxiYWNrKSlcbiAgICAgIHRoaXMuX2NhbGxiYWNrcy5kZWxldGUoY2FsbGJhY2spO1xuICB9XG5cbiAgc3RhcnRBZHZlcnRpc2luZygpIHtcbiAgICB0aGlzLl9zdGFydEFkdmVydGlzaW5nKCk7XG4gIH1cblxuICBzdGFydFJhbmdpbmcoKSB7XG4gICAgdGhpcy5fc3RhcnRSYW5naW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzdGFydCBhZHZlcnRpc2luZyB0byB0YWtlIGludG8gYWNvdW50IHV1aWQsIG1ham9yIG9yIG1pbm9yIGNoYW5nZS5cbiAgICovXG4gIHJlc3RhcnRBZHZlcnRpc2luZygpIHtcbiAgICB0aGlzLl9zdG9wQWR2ZXJ0aXNpbmcoKTtcbiAgICB0aGlzLl9zdGFydEFkdmVydGlzaW5nKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVzdGFydCByYW5naW5nIHRvIHRha2UgaW50byBhY291bnQgdXVpZCBjaGFuZ2UuXG4gICAqL1xuICByZXN0YXJ0UmFuZ2luZygpIHtcbiAgICB0aGlzLl9zdG9wUmFuZ2luZygpO1xuICAgIHRoaXMuX3N0YXJ0UmFuZ2luZygpO1xuICB9XG5cbiAgLyoqXG4gICAqIHJlbW92ZSByZWdpc3RlcmVkIGNhbGxiYWNrIGZyb20gc3RhY2sgKHNlZSAnYWRkQ2FsbGJhY2snKVxuICAgKi9cbiAgcnNzaVRvRGlzdChyc3NpKSB7XG4gICAgaWYgKCF0aGlzLl9oYXNCZWVuQ2FsaWJyYXRlZCkge1xuICAgICAgY29uc29sZS53YXJuKCdyc3NpVG9EaXN0IGNhbGxlZCBwcmlvciB0byB0eFBvd2VyIGRlZmluaXRpb24gKGNhbGlicmF0aW9uKSwgdXNpbmcgZGVmYXVsdCB2YWx1ZTonLCB0aGlzLm9wdGlvbnMudHhQb3dlciwgJ2RCJyk7XG4gICAgICB0aGlzLl9oYXNCZWVuQ2FsaWJyYXRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX2NhbGN1bGF0ZUFjY3VyYWN5KHRoaXMudHhQb3dlciwgcnNzaSk7XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX3N0YXJ0QWR2ZXJ0aXNpbmcoKSB7XG4gICAgaWYgKHRoaXMuX2NvcmRvdmFQbHVnaW5JbnN0YWxsZWQpIHtcbiAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSB0aGlzLl9pZGVudGlmaWVyO1xuICAgICAgY29uc3QgdXVpZCA9IHRoaXMub3B0aW9ucy51dWlkO1xuICAgICAgY29uc3QgbWlub3IgPSB0aGlzLm9wdGlvbnMubWlub3I7XG4gICAgICBjb25zdCBtYWpvciA9IHRoaXMub3B0aW9ucy5tYWpvcjtcbiAgICAgIGNvbnN0IGJlYWNvblJlZ2lvbiA9IG5ldyBjb3Jkb3ZhLnBsdWdpbnMubG9jYXRpb25NYW5hZ2VyLkJlYWNvblJlZ2lvbihpZGVudGlmaWVyLCB1dWlkLCBtYWpvciwgbWlub3IpO1xuXG4gICAgICAvLyB2ZXJpZnkgdGhlIHBsYXRmb3JtIHN1cHBvcnRzIHRyYW5zbWl0dGluZyBhcyBhIGJlYWNvblxuICAgICAgY29yZG92YS5wbHVnaW5zLmxvY2F0aW9uTWFuYWdlclxuICAgICAgICAuaXNBZHZlcnRpc2luZ0F2YWlsYWJsZSgpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKGlzU3VwcG9ydGVkKSB7XG4gICAgICAgICAgaWYgKGlzU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAvLyBzdGFydCBhZHZlcnRpc2luZ1xuICAgICAgICAgICAgY29yZG92YS5wbHVnaW5zLmxvY2F0aW9uTWFuYWdlclxuICAgICAgICAgICAgICAuc3RhcnRBZHZlcnRpc2luZyhiZWFjb25SZWdpb24pXG4gICAgICAgICAgICAgIC5mYWlsKGNvbnNvbGUuZXJyb3IpXG4gICAgICAgICAgICAgIC5kb25lKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBZHZlcnRpc2luZyBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuZmFpbChmdW5jdGlvbihlKSB7IGNvbnNvbGUuZXJyb3IoZSk7IH0pXG4gICAgICAgIC5kb25lKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9zdG9wQWR2ZXJ0aXNpbmcoKSB7XG4gICAgaWYgKHRoaXMuX2NvcmRvdmFQbHVnaW5JbnN0YWxsZWQpIHtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5sb2NhdGlvbk1hbmFnZXJcbiAgICAgICAgLnN0b3BBZHZlcnRpc2luZygpXG4gICAgICAgIC5mYWlsKGZ1bmN0aW9uKGUpIHsgY29uc29sZS5lcnJvcihlKTsgfSlcbiAgICAgICAgLmRvbmUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX3N0YXJ0UmFuZ2luZygpIHtcbiAgICBpZiAodGhpcy5fY29yZG92YVBsdWdpbkluc3RhbGxlZCkge1xuICAgICAgY29uc3QgZGVsZWdhdGUgPSBuZXcgY29yZG92YS5wbHVnaW5zLmxvY2F0aW9uTWFuYWdlci5EZWxlZ2F0ZSgpO1xuICAgICAgZGVsZWdhdGUuZGlkUmFuZ2VCZWFjb25zSW5SZWdpb24gPSB0aGlzLl9kaWRSYW5nZUJlYWNvbnNJblJlZ2lvbjtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5sb2NhdGlvbk1hbmFnZXIuc2V0RGVsZWdhdGUoZGVsZWdhdGUpO1xuXG4gICAgICBjb25zdCB1dWlkID0gdGhpcy5vcHRpb25zLnV1aWQ7XG4gICAgICBjb25zdCBpZGVudGlmaWVyID0gdGhpcy5faWRlbnRpZmllcjtcbiAgICAgIGNvbnN0IGJlYWNvblJlZ2lvbiA9IG5ldyBjb3Jkb3ZhLnBsdWdpbnMubG9jYXRpb25NYW5hZ2VyLkJlYWNvblJlZ2lvbihpZGVudGlmaWVyLCB1dWlkKTtcblxuICAgICAgLy8gcmVxdWlyZWQgaW4gaU9TIDgrXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMubG9jYXRpb25NYW5hZ2VyLnJlcXVlc3RXaGVuSW5Vc2VBdXRob3JpemF0aW9uKCk7XG4gICAgICAvLyBvciBjb3Jkb3ZhLnBsdWdpbnMubG9jYXRpb25NYW5hZ2VyLnJlcXVlc3RBbHdheXNBdXRob3JpemF0aW9uKClcblxuICAgICAgY29yZG92YS5wbHVnaW5zLmxvY2F0aW9uTWFuYWdlclxuICAgICAgICAuc3RhcnRSYW5naW5nQmVhY29uc0luUmVnaW9uKGJlYWNvblJlZ2lvbilcbiAgICAgICAgLmZhaWwoZnVuY3Rpb24oZSkgeyBjb25zb2xlLmVycm9yKGUpOyB9KVxuICAgICAgICAuZG9uZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAcHJpdmF0ZSAqL1xuICBfc3RvcFJhbmdpbmcoKSB7XG4gICAgaWYgKHRoaXMuX2NvcmRvdmFQbHVnaW5JbnN0YWxsZWQpIHtcbiAgICAgIGNvbnN0IHV1aWQgPSB0aGlzLm9wdGlvbnMudXVpZDtcbiAgICAgIGNvbnN0IGlkZW50aWZpZXIgPSB0aGlzLl9pZGVudGlmaWVyO1xuICAgICAgY29uc3QgYmVhY29uUmVnaW9uID0gbmV3IGNvcmRvdmEucGx1Z2lucy5sb2NhdGlvbk1hbmFnZXIuQmVhY29uUmVnaW9uKGlkZW50aWZpZXIsIHV1aWQpO1xuXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMubG9jYXRpb25NYW5hZ2VyXG4gICAgICAgIC5zdG9wUmFuZ2luZ0JlYWNvbnNJblJlZ2lvbihiZWFjb25SZWdpb24pXG4gICAgICAgIC5mYWlsKGZ1bmN0aW9uKGUpIHsgY29uc29sZS5lcnJvcihlKTsgfSlcbiAgICAgICAgLmRvbmUoKTtcbiAgICB9XG4gIH1cblxuICAvKiogQHByaXZhdGUgKi9cbiAgX2RpZFJhbmdlQmVhY29uc0luUmVnaW9uKHBsdWdpblJlc3VsdCkge1xuICAgIC8vIGNhbGwgdXNlciBkZWZpbmVkIGNhbGxiYWNrc1xuICAgIHRoaXMuX2NhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayhwbHVnaW5SZXN1bHQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqIEBwcml2YXRlICovXG4gIF9jaGVja1BsdWdpbigpIHtcbiAgICBjb25zdCBwbHVnaW5zID0gY29yZG92YS5yZXF1aXJlKCdjb3Jkb3ZhL3BsdWdpbl9saXN0JykubWV0YWRhdGE7XG4gICAgbGV0IGRpc3BsYXlJbnN0YWxsSW5zdHJ1Y3Rpb25zID0gZmFsc2U7XG5cbiAgICBpZiAocGx1Z2luc1tDT1JET1ZBX1BMVUdJTl9OQU1FXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBtc2cgPSAnQ29yZG92YSBwbHVnaW4gPGNvcmRvdmEtcGx1Z2luLWliZWFjb24+IG5vdCBpbnN0YWxsZWQgLT4gYmVhY29uIHNlcnZpY2UgZGlzYWJsZWQnO1xuICAgICAgY29uc29sZS53YXJuKG1zZyk7XG5cbiAgICAgIGRpc3BsYXlJbnN0YWxsSW5zdHJ1Y3Rpb25zID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHBsdWdpbnNbQ09SRE9WQV9QTFVHSU5fTkFNRV0gIT09IENPUkRPVkFfUExVR0lOX0FTU0VSVEVEX1ZFUlNJT04pIHtcbiAgICAgICAgY29uc3QgbXNnID0gYENvcmRvdmEgcGx1Z2luIDxjb3Jkb3ZhLXBsdWdpbi1pYmVhY29uPiB2ZXJzaW9uIG1pc21hdGNoOiBpbnN0YWxsZWQ6XG4gICAgICAgICAgJHtwbHVnaW5zW0NPUkRPVkFfUExVR0lOX05BTUVdfSByZXF1aXJlZDogJHtDT1JET1ZBX1BMVUdJTl9BU1NFUlRFRF9WRVJTSU9OfSAodmVyc2lvbiBub3QgdGVzdGVkLCB1c2UgYXQgeW91ciBvd24gcmlzaylgO1xuICAgICAgICBjb25zb2xlLndhcm4obXNnKTtcblxuICAgICAgICBkaXNwbGF5SW5zdGFsbEluc3RydWN0aW9ucyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2NvcmRvdmFQbHVnaW5JbnN0YWxsZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChkaXNwbGF5SW5zdGFsbEluc3RydWN0aW9ucykge1xuICAgICAgY29uc3QgbXNnID0gYFxuICAgICAgICAtPiB0byBpbnN0YWxsICR7Q09SRE9WQV9QTFVHSU5fTkFNRX0gdiR7Q09SRE9WQV9QTFVHSU5fQVNTRVJURURfVkVSU0lPTn0sIHVzZTpcbiAgICAgICAgY29yZG92YSBwbHVnaW4gYWRkICR7Q09SRE9WQV9QTFVHSU5fUkVQT1NJVE9SWX0jJHtDT1JET1ZBX1BMVUdJTl9BU1NFUlRFRF9WRVJTSU9OfWA7XG4gICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9jb3Jkb3ZhUGx1Z2luSW5zdGFsbGVkKVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcHJpdmF0ZVxuICAgKiBjb252ZXJ0IHJzc2kgdG8gZGlzdGFuY2UsIG5hbWluZyAoX2NhbGN1bGF0ZUFjY3VyYWN5IHJhdGhlciB0aGFuIGNhbGN1bGF0ZURpc3RhbmNlKVxuICAgKiBpcyBpbnRlbnRpb25hbDogVVNFIFdJVEggQ0FVVElPTiwgYXMgZXhwbGFpbmVkIEBcbiAgICogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yMDQxNjIxOC91bmRlcnN0YW5kaW5nLWliZWFjb24tZGlzdGFuY2luZ1xuICAgKi9cbiAgX2NhbGN1bGF0ZUFjY3VyYWN5KHR4UG93ZXIsIHJzc2kpIHtcbiAgICBpZiAocnNzaSA9PT0gMClcbiAgICAgIHJldHVybiAwLjA7XG5cbiAgICBsZXQgcmF0aW8gPSByc3NpICogMS4wIC8gdHhQb3dlcjtcblxuICAgIGlmIChyYXRpbyA8IDEuMClcbiAgICAgIHJldHVybiBNYXRoLnBvdyhyYXRpbywgMTApO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiAoMC44OTk3NiAqIE1hdGgucG93KHJhdGlvLCA3LjcwOTUpICsgMC4xMTEpO1xuICB9XG59XG5cbnNlcnZpY2VNYW5hZ2VyLnJlZ2lzdGVyKFNFUlZJQ0VfSUQsIEJlYWNvbik7XG5cbmV4cG9ydCBkZWZhdWx0IEJlYWNvbjtcbiJdfQ==