// import client side soundworks and player experience
import { client, ControllerExperience } from 'soundworks/client';
import serviceViews from '../shared/serviceViews';

// launch application when document is fully loaded
window.addEventListener('load', () => {
  // initialize the client with configuration received
  // from the server through the `index.html`
  // @see {~/src/server/index.js}
  // @see {~/html/default.ejs}
  const config = Object.assign({ appContainer: '#container' }, window.soundworksConfig);
  client.init(config.clientType, config);
  // configure views for the services
  client.setServiceInstanciationHook((id, instance) => {
    if (serviceViews.has(id))
      instance.view = serviceViews.get(id, config);
  });

  const controller = new ControllerExperience();

  controller.setGuiOptions('tuttiCutoff', {
    type: 'slider',
    size: 'large',
  });

  controller.setGuiOptions('tuttiGain', {
    type: 'slider',
    size: 'large',
  });

  client.start();
});
