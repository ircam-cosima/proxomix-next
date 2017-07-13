'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _PlayerExperience = require('./PlayerExperience.js');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

var _serviceViews = require('../shared/serviceViews');

var _serviceViews2 = _interopRequireDefault(_serviceViews);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var init = function init() {
  var config = (0, _assign2.default)({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  // configure views for the services
  soundworks.client.setServiceInstanciationHook(function (id, instance) {
    if (_serviceViews2.default.has(id)) instance.view = _serviceViews2.default.get(id, config);
  });

  var experience = new _PlayerExperience2.default(config.assetsDomain, config.beaconUUID);

  soundworks.client.start();
};

if (!!window.cordova) document.addEventListener('deviceready', init);else window.addEventListener('load', init);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJpbml0IiwiY29uZmlnIiwiYXBwQ29udGFpbmVyIiwid2luZG93Iiwic291bmR3b3Jrc0NvbmZpZyIsImNsaWVudCIsImNsaWVudFR5cGUiLCJzZXRTZXJ2aWNlSW5zdGFuY2lhdGlvbkhvb2siLCJpZCIsImluc3RhbmNlIiwiaGFzIiwidmlldyIsImdldCIsImV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJiZWFjb25VVUlEIiwic3RhcnQiLCJjb3Jkb3ZhIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNBOzs7Ozs7OztBQUVBLElBQU1DLE9BQU8sU0FBUEEsSUFBTyxHQUFNO0FBQ2pCLE1BQU1DLFNBQVMsc0JBQWMsRUFBRUMsY0FBYyxZQUFoQixFQUFkLEVBQThDQyxPQUFPQyxnQkFBckQsQ0FBZjtBQUNBTCxhQUFXTSxNQUFYLENBQWtCTCxJQUFsQixDQUF1QkMsT0FBT0ssVUFBOUIsRUFBMENMLE1BQTFDOztBQUVBO0FBQ0FGLGFBQVdNLE1BQVgsQ0FBa0JFLDJCQUFsQixDQUE4QyxVQUFDQyxFQUFELEVBQUtDLFFBQUwsRUFBa0I7QUFDOUQsUUFBSSx1QkFBYUMsR0FBYixDQUFpQkYsRUFBakIsQ0FBSixFQUNFQyxTQUFTRSxJQUFULEdBQWdCLHVCQUFhQyxHQUFiLENBQWlCSixFQUFqQixFQUFxQlAsTUFBckIsQ0FBaEI7QUFDSCxHQUhEOztBQUtBLE1BQU1ZLGFBQWEsK0JBQXFCWixPQUFPYSxZQUE1QixFQUEwQ2IsT0FBT2MsVUFBakQsQ0FBbkI7O0FBRUFoQixhQUFXTSxNQUFYLENBQWtCVyxLQUFsQjtBQUNELENBYkQ7O0FBZ0JBLElBQUksQ0FBQyxDQUFDYixPQUFPYyxPQUFiLEVBQ0VDLFNBQVNDLGdCQUFULENBQTBCLGFBQTFCLEVBQXlDbkIsSUFBekMsRUFERixLQUdFRyxPQUFPZ0IsZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0NuQixJQUFoQyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNvdW5kd29ya3MgZnJvbSAnc291bmR3b3Jrcy9jbGllbnQnO1xuaW1wb3J0IFBsYXllckV4cGVyaWVuY2UgZnJvbSAnLi9QbGF5ZXJFeHBlcmllbmNlLmpzJztcbmltcG9ydCBzZXJ2aWNlVmlld3MgZnJvbSAnLi4vc2hhcmVkL3NlcnZpY2VWaWV3cyc7XG5cbmNvbnN0IGluaXQgPSAoKSA9PiB7XG4gIGNvbnN0IGNvbmZpZyA9IE9iamVjdC5hc3NpZ24oeyBhcHBDb250YWluZXI6ICcjY29udGFpbmVyJyB9LCB3aW5kb3cuc291bmR3b3Jrc0NvbmZpZyk7XG4gIHNvdW5kd29ya3MuY2xpZW50LmluaXQoY29uZmlnLmNsaWVudFR5cGUsIGNvbmZpZyk7XG5cbiAgLy8gY29uZmlndXJlIHZpZXdzIGZvciB0aGUgc2VydmljZXNcbiAgc291bmR3b3Jrcy5jbGllbnQuc2V0U2VydmljZUluc3RhbmNpYXRpb25Ib29rKChpZCwgaW5zdGFuY2UpID0+IHtcbiAgICBpZiAoc2VydmljZVZpZXdzLmhhcyhpZCkpXG4gICAgICBpbnN0YW5jZS52aWV3ID0gc2VydmljZVZpZXdzLmdldChpZCwgY29uZmlnKTtcbiAgfSk7XG5cbiAgY29uc3QgZXhwZXJpZW5jZSA9IG5ldyBQbGF5ZXJFeHBlcmllbmNlKGNvbmZpZy5hc3NldHNEb21haW4sIGNvbmZpZy5iZWFjb25VVUlEKTtcblxuICBzb3VuZHdvcmtzLmNsaWVudC5zdGFydCgpO1xufTtcblxuXG5pZiAoISF3aW5kb3cuY29yZG92YSlcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZGV2aWNlcmVhZHknLCBpbml0KTtcbmVsc2VcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBpbml0KTtcbiJdfQ==