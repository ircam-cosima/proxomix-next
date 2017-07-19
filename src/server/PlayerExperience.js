import { Experience } from 'soundworks/server';
import setup from '../shared/setup';

const instrumentList = Object.keys(setup.instruments);
const numInstruments = instrumentList.length;
const tempo = setup.common.tempo;
const tempoUnit = setup.common.tempoUnit;

const playerOutTime = 10;

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    // services
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.checkin = this.require('checkin');
    this.sync = this.require('sync');
    this.metricScheduler = this.require('metric-scheduler', { tempo: tempo, tempoUnit: tempoUnit });

    this.availablePlayers = new Set();
    this.activePlayers = new Set();

    for (let i = 0; i < numInstruments; i++)
      this.availablePlayers.add(i);
  }

  start() {}

  enter(client) {
    super.enter(client);

    this.receive(client, 'player:request', this._onPlayerRequest(client));
    this.receive(client, 'player:enter', this._onPlayerEnter(client));
    this.receive(client, 'player:exit', this._onPlayerExit(client));
    this.receive(client, 'instrument:control', this._onInstrumentControl(client));
  }

  exit(client) {
    super.exit(client);
    this._onPlayerExit(client, client.activities[this.id].playerId);
  }

  _onPlayerRequest(client) {
    return () => {
      const availablePlayers = Array.from(this.availablePlayers);
      const activePlayers = Array.from(this.activePlayers);

      this.send(client, 'player:acknowledge', availablePlayers, activePlayers);
    };
  }

  _onPlayerEnter(client) {
    return (playerId) => {
      this.broadcast('player', client, 'player:enter', playerId);

      this.activePlayers.add(playerId);
      this.availablePlayers.delete(playerId);
    };
  }

  _onPlayerExit(client) {
    return (playerId) => {
      this.broadcast('player', client, 'player:exit', playerId);

      if (this.activePlayers.has(playerId)) {
        this.activePlayers.delete(playerId);

        setTimeout(() => {
          this.availablePlayers.add(playerId);
          this.broadcast('player', null, 'player:available', playerId);
        }, playerOutTime * 1000);
      }
    };
  }

  _onInstrumentControl(client) {
    return (playerId, name, value) => this.broadcast('player', client, 'instrument:control', playerId, name, value);
  }
}
