'use strict';

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _client = require('soundworks/client');

var soundworks = _interopRequireWildcard(_client);

var _PlayerExperience = require('./PlayerExperience.js');

var _PlayerExperience2 = _interopRequireDefault(_PlayerExperience);

var _serviceViews = require('../shared/serviceViews');

var _serviceViews2 = _interopRequireDefault(_serviceViews);

var _LoopInstrument = require('./instruments/LoopInstrument');

var _LoopInstrument2 = _interopRequireDefault(_LoopInstrument);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbInNvdW5kd29ya3MiLCJpbml0IiwiY29uZmlnIiwiYXBwQ29udGFpbmVyIiwid2luZG93Iiwic291bmR3b3Jrc0NvbmZpZyIsImNsaWVudCIsImNsaWVudFR5cGUiLCJzZXRTZXJ2aWNlSW5zdGFuY2lhdGlvbkhvb2siLCJpZCIsImluc3RhbmNlIiwiaGFzIiwidmlldyIsImdldCIsImV4cGVyaWVuY2UiLCJhc3NldHNEb21haW4iLCJiZWFjb25VVUlEIiwic3RhcnQiLCJjb3Jkb3ZhIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7SUFBWUEsVTs7QUFDWjs7OztBQUNBOzs7O0FBRUE7Ozs7Ozs7O0FBRUEsSUFBTUMsT0FBTyxTQUFQQSxJQUFPLEdBQU07QUFDakIsTUFBTUMsU0FBUyxzQkFBYyxFQUFFQyxjQUFjLFlBQWhCLEVBQWQsRUFBOENDLE9BQU9DLGdCQUFyRCxDQUFmO0FBQ0FMLGFBQVdNLE1BQVgsQ0FBa0JMLElBQWxCLENBQXVCQyxPQUFPSyxVQUE5QixFQUEwQ0wsTUFBMUM7O0FBRUE7QUFDQUYsYUFBV00sTUFBWCxDQUFrQkUsMkJBQWxCLENBQThDLFVBQUNDLEVBQUQsRUFBS0MsUUFBTCxFQUFrQjtBQUM5RCxRQUFJLHVCQUFhQyxHQUFiLENBQWlCRixFQUFqQixDQUFKLEVBQ0VDLFNBQVNFLElBQVQsR0FBZ0IsdUJBQWFDLEdBQWIsQ0FBaUJKLEVBQWpCLEVBQXFCUCxNQUFyQixDQUFoQjtBQUNILEdBSEQ7O0FBS0EsTUFBTVksYUFBYSwrQkFBcUJaLE9BQU9hLFlBQTVCLEVBQTBDYixPQUFPYyxVQUFqRCxDQUFuQjs7QUFFQWhCLGFBQVdNLE1BQVgsQ0FBa0JXLEtBQWxCO0FBQ0QsQ0FiRDs7QUFnQkEsSUFBSSxDQUFDLENBQUNiLE9BQU9jLE9BQWIsRUFDRUMsU0FBU0MsZ0JBQVQsQ0FBMEIsYUFBMUIsRUFBeUNuQixJQUF6QyxFQURGLEtBR0VHLE9BQU9nQixnQkFBUCxDQUF3QixNQUF4QixFQUFnQ25CLElBQWhDIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgc291bmR3b3JrcyBmcm9tICdzb3VuZHdvcmtzL2NsaWVudCc7XG5pbXBvcnQgUGxheWVyRXhwZXJpZW5jZSBmcm9tICcuL1BsYXllckV4cGVyaWVuY2UuanMnO1xuaW1wb3J0IHNlcnZpY2VWaWV3cyBmcm9tICcuLi9zaGFyZWQvc2VydmljZVZpZXdzJztcblxuaW1wb3J0IExvb3BJbnN0cnVtZW50IGZyb20gJy4vaW5zdHJ1bWVudHMvTG9vcEluc3RydW1lbnQnO1xuXG5jb25zdCBpbml0ID0gKCkgPT4ge1xuICBjb25zdCBjb25maWcgPSBPYmplY3QuYXNzaWduKHsgYXBwQ29udGFpbmVyOiAnI2NvbnRhaW5lcicgfSwgd2luZG93LnNvdW5kd29ya3NDb25maWcpO1xuICBzb3VuZHdvcmtzLmNsaWVudC5pbml0KGNvbmZpZy5jbGllbnRUeXBlLCBjb25maWcpO1xuXG4gIC8vIGNvbmZpZ3VyZSB2aWV3cyBmb3IgdGhlIHNlcnZpY2VzXG4gIHNvdW5kd29ya3MuY2xpZW50LnNldFNlcnZpY2VJbnN0YW5jaWF0aW9uSG9vaygoaWQsIGluc3RhbmNlKSA9PiB7XG4gICAgaWYgKHNlcnZpY2VWaWV3cy5oYXMoaWQpKVxuICAgICAgaW5zdGFuY2UudmlldyA9IHNlcnZpY2VWaWV3cy5nZXQoaWQsIGNvbmZpZyk7XG4gIH0pO1xuXG4gIGNvbnN0IGV4cGVyaWVuY2UgPSBuZXcgUGxheWVyRXhwZXJpZW5jZShjb25maWcuYXNzZXRzRG9tYWluLCBjb25maWcuYmVhY29uVVVJRCk7XG5cbiAgc291bmR3b3Jrcy5jbGllbnQuc3RhcnQoKTtcbn07XG5cblxuaWYgKCEhd2luZG93LmNvcmRvdmEpXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2RldmljZXJlYWR5JywgaW5pdCk7XG5lbHNlXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgaW5pdCk7XG4iXX0=