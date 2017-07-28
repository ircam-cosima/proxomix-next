import * as soundworks from 'soundworks/client';
import PlayerExperience from './PlayerExperience.js';
import LoopInstrument from '../shared/instruments/LoopInstrument';
import StepSeqInstrument from '../shared/instruments/StepSeqInstrument';
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

  const experience = new PlayerExperience(config.assetsDomain, config.beaconUUID);

  soundworks.client.start();
};


if (!!window.cordova)
  document.addEventListener('deviceready', init);
else
  window.addEventListener('load', init);

