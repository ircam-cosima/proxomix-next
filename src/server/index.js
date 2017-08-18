import 'source-map-support/register'; // enable sourcemaps in node
import path from 'path';
import { server, ControllerExperience, audioContext } from 'soundworks/server';
import PlayerExperience from './PlayerExperience';
import TuttiExperience from './TuttiExperience';

const configName = process.env.ENV || 'default';
const configPath = path.join(__dirname, 'config', configName);
let config = null;

// rely on node `require` for synchronicity
try {
  config = require(configPath).default;
} catch(err) {
  console.error(`Invalid ENV "${configName}", file "${configPath}.js" not found`);
  process.exit(1);
}

// configure express environment ('production' enables cache systems)
process.env.NODE_ENV = config.env;

server.init(config);
server.setClientConfigDefinition((clientType, config, httpRequest) => {
  let includeCordovaTags = false;

  if (httpRequest.query.cordova) {
    includeCordovaTags = true;

    config.assetsDomain = '';
  }

  const data = {
    standalone: config.standalone,
    clientType: clientType,
    env: config.env,
    appName: config.appName,
    websockets: config.websockets,
    version: config.version,
    defaultType: config.defaultClient,
    assetsDomain: config.assetsDomain,
    beaconUUID: config.beaconUUID,

    includeCordovaTags: includeCordovaTags,
    // environment
    gaId: config.gaId,
  };

  return data;
});

const sharedParams = server.require('shared-params');
sharedParams.addEnum('tuttiLowpass', 'tutti lowpass', ['off', '12dB', '24dB'], '24dB', ['controller', 'tutti']);
sharedParams.addNumber('tuttiCutoff', 'tutti cutoff', 50, 500, 10, 160, ['controller', 'tutti']);
sharedParams.addNumber('tuttiGain', 'tutti gain', -40, 20, 1, 0, ['controller', 'tutti']);
sharedParams.addBoolean('mutePlayers', 'mute players', false, ['controller', 'player']);

const controllerExperience = new ControllerExperience('controller');
const playerExperience = new PlayerExperience();
const tuttiExperience = new TuttiExperience(playerExperience);

server.start();
