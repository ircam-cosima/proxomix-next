import * as soundworks from 'soundworks/client';
import TuttiExperience from './TuttiExperience.js';
import serviceViews from '../shared/serviceViews';

const init = () => {
  document.addEventListener('touchmove', function(event) {
    event.preventDefault();
  });

  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  soundworks.client.init(config.clientType, config);

  // configure views for the services
  soundworks.client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const experience = new TuttiExperience(config.assetsDomain, config.beaconUUID);

  soundworks.client.start();
};


if (!!window.cordova)
  document.addEventListener('deviceready', init);
else
  window.addEventListener('load', init);

