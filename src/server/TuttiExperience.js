import { Experience } from 'soundworks/server';

export default class TuttiExperience extends Experience {
  constructor(playerExperience) {
    super('tutti');

    this.playerExperience = playerExperience;

    // services
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.sync = this.require('sync');
    this.sharedParams = this.require('shared-params');
    this.metricScheduler = this.require('metric-scheduler');
  }

  start() {}

  enter(client) {
    super.enter(client);
    this.receive(client, 'request', this._onRequest(client));
  }

  _onRequest(client) {
    const playerExperience = this.playerExperience;
    const players = playerExperience.players;
    const activeIds = playerExperience.activeIds;

    return () => {
      const ids = [];
      const states = [];

      for (let id of activeIds) {
        const player = players[id];
        ids.push(id);
        states.push(player.state);
      }

      this.send(client, 'acknowledge', ids, states);
    };
  }
}