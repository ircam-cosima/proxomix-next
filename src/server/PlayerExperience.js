import { Experience } from 'soundworks/server';
import setup from '../shared/setup';

const instrumentList = Object.keys(setup.instruments);
const numInstruments = instrumentList.length;
const tempo = setup.common.tempo;
const tempoUnit = setup.common.tempoUnit;

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);
    // services
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.sync = this.require('sync');
    this.metricScheduler = this.require('metric-scheduler', { tempo: tempo, tempoUnit: tempoUnit });

    this.availableIds = [];
    this.playerIds = new Set();

    for (let i = 0; i < numInstruments; i++)
      this.availableIds[i] = i;
  }

  start() {}

  enter(client) {
    super.enter(client);

    this.receive(client, 'player:enter', this._onPlayerEnter(client));
    this.receive(client, 'instrument:control', this._onInstrumentControl(client));
  }

  exit(client) {
    super.exit(client);

    this._onPlayerExit(client);
  }

  _getId() {
    if (this.availableIds.length === 0)
      return null;

    const index = Math.floor(Math.random() * this.availableIds.length);
    const id = this.availableIds[index];

    this.availableIds.splice(index, 1);
    this.playerIds.add(id);

    return id;
  }

  _releaseId(id) {
    if (this.playerIds.has(id)) {
      this.playerIds.delete(id);
      setTimeout(() => this.availableIds.push(id), 10 * 1000);
    }
  }

  _onPlayerEnter(client) {
    // if the client force its id through url params, only send it back (web clients only)
    return (forcedId) => {
      if (forcedId === null) {
        const playerId = this._getId();

        if (playerId !== null) {
          client.activities[this.id].playerId = playerId;
          // send id to other peers
          this.broadcast('player', null, 'player:entered', playerId);
          // send id back to the player along with the list of player ids
          this.send(client, 'player:ack', playerId, this.playerIds);
        } else {
          this.send(client, 'player:refused');
        }
      } else {
        this.send(client, 'player:ack', forcedId, this.playerIds);
      }
    };
  }

  _onPlayerExit(client) {
    const playerId = client.activities[this.id].playerId;

    if (playerId !== undefined) {
      this._releaseId(playerId);
      this.broadcast('player', client, 'player:exit', playerId);
    }
  }

  _onInstrumentControl(client) {
    return (playerId, name, value) => this.broadcast('player', client, 'instrument:control', playerId, name, value);
  }
}
