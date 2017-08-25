import { Experience } from 'soundworks/server';
import mixSetup from '../shared/setup';

const DEBUG = false;

const instrumentList = Object.keys(mixSetup.instruments);
const numInstruments = instrumentList.length;
const tempo = mixSetup.common.tempo;
const tempoUnit = mixSetup.common.tempoUnit;
const numGroups = numInstruments / 2;

const maxPlayersPerGroup = 8;
const houskeepingPeriod = 1;
const playerOutTime = 2;

const innerDistance = 1;
const outerDistance = 1.5;
const txPower = -57.5;
const minDistance = 0.011;
const K = 1.0998;
const X = 7.4095;

function rssiToDistance(rssi) {
  if (rssi < 0)
    return K * Math.pow(rssi / txPower, X) + minDistance;

  return 0;
}

function distanceToRssi(distance) {
  if (distance > minDistance)
    return txPower * Math.pow((distance - minDistance) / K, 1 / X);

  return 0;
}

const maxAge = 1000;

class Group {
  constructor(experience, id) {
    this.experience = experience;
    this.id = id;
    this.players = new Set();
    this.age = 0;
  }

  init(player, other) {
    this.players.clear();
    this.age = 0;

    player.addNeighbour(other);
    player.setGroup(this);
    this.players.add(player);

    other.addNeighbour(player);
    other.setGroup(this);
    this.players.add(other);

    const experience = this.experience;
    experience.activeGroups.add(this);
    experience.availableGroups.delete(this);
  }

  reset() {
    this.players.clear();
    this.age = 0;

    const experience = this.experience;
    experience.activeGroups.delete(this);
    experience.availableGroups.add(this);
  }

  canAdd(player) {
    const innerCircle = player.innerCircle;

    for (let p of this.players) {
      if (!innerCircle.has(p))
        return false;
    }

    return true;
  }

  add(player) {
    const players = this.players;

    if (players.size < maxPlayersPerGroup) {
      // add player as neighbour of players of the group
      for (let p of players)
        p.addNeighbour(player);

      // add all players of the group as neighbours of the added player
      player.addNeighbours(players);
      player.setGroup(this);

      this.players.add(player);
    } else {
      player.pendingGroup = this;
    }
  }

  remove(player) {
    if (this.players.size > 2) {
      this.players.delete(player);

      // remove player as neighbour of players of the group
      for (let p of this.players)
        p.removeNeighbour(player);

      // add all players of the group as neighbours of the added player
      const players = Array.from(this.players);
      player.removeNeighbours(players);
      player.resetGroup();
    } else {
      const iter = this.players.values();
      const p = iter.next().value;
      const q = iter.next().value;

      p.removeNeighbour(q);
      p.resetGroup();

      q.removeNeighbour(p);
      q.resetGroup();

      this.reset();
    }
  }

  canMerge(other) {
    for (let p of this.players) {
      const innerCircle = p.innerCircle;

      for (let o of other.players) {
        if (!innerCircle.has(o))
          return false;
      }
    }

    return true;
  }

  merge(merge) {
    let keep = this;

    if (this.players.size < merge.players.size) {
      keep = merge;
      merge = this;
    }

    const availablePlaces = (maxPlayersPerGroup - keep.players.size);
    const numCandidates = merge.players.size;
    const numMigrants = Math.min(availablePlaces, numCandidates);
    const cadidates = merge.players;
    const residents = keep.players;
    const migrants = new Set();
    const iter = cadidates.values();

    for (let i = 0; i < numMigrants; i++) {
      const p = iter.next().value;

      // add to ephemeral set of migrants
      migrants.add(p);

      // add residents as new neighbours and change group of migrant
      p.addNeighbours(residents);
      p.setGroup(keep);
    }

    // add migrants as new neighbours of all residents
    for (let p of residents)
      p.addNeighbours(migrants);

    // add migrants to residents
    for (let p of migrants)
      residents.add(p);

    // refuse non-accepted migrant cadidates
    for (let i = numMigrants; i < numCandidates; i++) {
      const p = iter.next().value;

      p.removeNeighbours(cadidates);
      p.resetGroup();
      p.pendingGroup = keep;
    }

    // reset and free group quietly
    merge.reset();
  }

  reduce() {
    // sort group members by number of others in outer circle and age
    const sortedPlayers = Array.from(this.players);
    sortedPlayers.sort(groupCircleSort);

    const rootPlayer = sortedPlayers[0];

    for (let i = 1; i < sortedPlayers.length; i++) {
      const player = sortedPlayers[i];

      if (!rootPlayer.outerGroupCircle.has(player))
        this.remove(player);
    }
  }

  incrAge() {
    if (this.age < maxAge - 1)
      this.age++;
  }
}

class Player {
  constructor(experience, id) {
    this.experience = experience;
    this.id = id;
    this.client = null;
    this.beacons = [];

    this.group = null;
    this.age = 0;

    this.state = {};

    this.innerCircle = new Set();
    this.outerGroupCircle = new Set();
    this.pendingGroup = null;

    for (let i = 0; i < numInstruments; i++)
      this.beacons.push(-Infinity);
  }

  init(client) {
    this.client = client;
    this.age = 0;

    for (let i = 0; i < numInstruments; i++)
      this.beacons[i] = -Infinity;

    const experience = this.experience;
    experience.activeIds.add(this.id);
    experience.availableIds.delete(this.id);
    experience.broadcast('player', client, 'unavailable', this.id);
  }

  reset() {
    const group = this.group;

    if (group)
      group.remove(this);

    this.innerCircle.clear();
    this.outerGroupCircle.clear();
    this.pendingGroup = null;

    this.client = null;
    this.state = {};

    const experience = this.experience;
    experience.activeIds.delete(this.id);

    setTimeout(() => {
      experience.availableIds.add(this.id);
      experience.broadcast('player', null, 'available', this.id);
    }, playerOutTime * 1000);
  }

  addNeighbour(neighbour) {
    const experience = this.experience;
    experience.send(this.client, 'activate', [neighbour.id], [neighbour.state]);
  }

  removeNeighbour(neighbour) {
    const experience = this.experience;
    experience.send(this.client, 'deactivate', [neighbour.id]);
  }

  addNeighbours(neighbours) {
    const ids = [];
    const states = [];

    for (let n of neighbours) {
      if (n.id !== this.id) {
        ids.push(n.id);
        states.push(n.state);
      }
    }

    const experience = this.experience;
    experience.send(this.client, 'activate', ids, states);
  }

  removeNeighbours(neighbours) {
    const ids = [];
    const states = [];

    for (let n of neighbours) {
      if (n.id !== this.id) {
        ids.push(n.id);
      }
    }

    const experience = this.experience;
    experience.send(this.client, 'deactivate', ids);
  }

  clearBeacons() {
    const beacons = this.beacons;

    for (let i = 0; i < beacons.length; i++)
      beacons[i] = -Infinity;
  }

  clearCircles() {
    this.innerCircle.clear();
    this.outerGroupCircle.clear();
    this.pendingGroup = null;
  }

  setGroup(group) {
    this.group = group;
    this.age = 0;

    this.experience.send(this.client, 'group', group.id);
  }

  resetGroup(group) {
    this.group = null;
    this.experience.send(this.client, 'group');
  }

  incrAge() {
    if (this.age < maxAge - 1)
      this.age++;
  }
}

function groupCircleSort(player, other) {
  const playerValue = player.outerGroupCircle.size + player.age / maxAge;
  const otherValue = other.outerGroupCircle.size + other.age / maxAge;
  return otherValue - playerValue;
}

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor() {
    super('player');

    // services
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.sync = this.require('sync');
    this.sharedParams = this.require('shared-params');
    this.metricScheduler = this.require('metric-scheduler', { tempo: tempo, tempoUnit: tempoUnit });

    this.innerRssi = distanceToRssi(innerDistance);
    this.outerRssi = distanceToRssi(outerDistance);

    this.availableGroups = new Set();
    this.activeGroups = new Set();

    this.availableIds = new Set();
    this.activeIds = new Set();

    this.players = [];

    for (let i = 0; i < numInstruments; i++) {
      this.availableIds.add(i);

      const player = new Player(this, i);
      this.players.push(player);
    }

    for (let i = 0; i < numGroups; i++) {
      const group = new Group(this, i);
      this.availableGroups.add(group);
    }

    this._onGroupHouskeeping = this._onGroupHouskeeping.bind(this);
  }

  start() {
    if (!DEBUG)
      this._onGroupHouskeeping();
  }

  enter(client) {
    super.enter(client);

    this.receive(client, 'request', this._onRequest(client));
    this.receive(client, 'request-id', this._onRequestId(client));
    this.receive(client, 'abort', this._onAbort(client));
    this.receive(client, 'beacons', this._onBeacons(client));
    this.receive(client, 'control', this._onControl(client));
  }

  exit(client) {
    super.exit(client);

    const id = client.activities[this.id].id;

    if (id !== undefined)
      this.deactivatePlayer(client, id);
  }

  activatePlayer(client, id) {
    const player = this.players[id];
    player.init(client);

    client.activities[this.id].id = id;
    this.send(client, 'acknowledge-id', id);
    this.broadcast('tutti', null, 'activate', player.id, player.state);

    // debug: add all players to the same group
    if (DEBUG) {
      const activePlayerIds = Array.from(this.activeIds);
      const activeGroups = Array.from(this.activeGroups);
      const numPlayers = activePlayerIds.length;
      if (numPlayers === 2) {
        const iter = this.activeIds.values();
        this.createGroup(this.players[iter.next().value], this.players[iter.next().value]);
      } else if (numPlayers > 2) {
        const iter = this.activeGroups.values();
        iter.next().value.add(player);
      }
    }
  }

  deactivatePlayer(client, id) {
    if (this.activeIds.has(id)) {
      const player = this.players[id];

      this.broadcast('tutti', null, 'deactivate', player.id);
      player.reset();

      client.activities[this.id].id = undefined;
    }
  }

  createGroup(player, other) {
    const iter = this.availableGroups.values();
    const group = iter.next().value;

    if (!group)
      throw new Error("Cannot find available group (this shouldn't happan)");

    group.init(player, other);

    return group;
  }

  _initCircles() {
    // clear player's circles
    for (let id of this.activeIds) {
      const player = this.players[id];
      player.clearCircles();
    }

    // fill player circles
    for (let id of this.activeIds) {
      const player = this.players[id];
      const playerBeacons = player.beacons;

      for (let otherId of this.activeIds) {
        if (id < otherId) {
          const other = this.players[otherId];
          const otherBeacons = other.beacons;
          const meanRssi = 0.5 * (playerBeacons[otherId] + otherBeacons[id]); // TODO: check if min or max is better

          if (meanRssi >= this.outerRssi) {
            if (player.group && player.group === other.group) {
              player.outerGroupCircle.add(other);
              other.outerGroupCircle.add(player);
            }

            if (meanRssi >= this.innerRssi) {
              player.innerCircle.add(other);
              other.innerCircle.add(player);
            }
          }
        }
      }
    }
  }

  _reduceGroups() {
    for (let group of this.activeGroups)
      group.reduce();
  }

  _mergeGroups() {
    for (let group of this.activeGroups) {
      for (let other of this.activeGroups) {
        if (group.id < other.id) {
          if (group.canMerge(other)) {
            group.merge(other);
          }
        }
      }
    }
  }

  _extendGroups() {
    for (let id of this.activeIds) {
      const player = this.players[id];

      if (!player.group && !player.pendingGroup) {
        for (let neighbour of player.innerCircle) {
          let group = neighbour.group;

          if (group && group.canAdd(player)) {
            group.add(player);
            break;
          }
        }
      }
    }
  }

  _createGroups() {
    for (let id of this.activeIds) {
      const player = this.players[id];

      if (!player.group && !player.pendingGroup) {
        for (let neighbour of player.innerCircle) {
          let group = neighbour.group;

          if (!group) {
            this.createGroup(player, neighbour);
            break;
          }
        }
      }
    }
  }

  _onGroupHouskeeping() {
    this._initCircles();
    this._reduceGroups();
    this._mergeGroups();
    this._extendGroups();
    this._createGroups();

    setTimeout(this._onGroupHouskeeping, houskeepingPeriod * 1000);
  }

  _onRequest(client) {
    return () => this.send(client, 'acknowledge', Array.from(this.availableIds));
  }

  _onRequestId(client) {
    return (id) => {
      if (this.availableIds.has(id))
        this.activatePlayer(client, id);
    };
  }

  _onAbort(client) {
    return (id) => this.deactivatePlayer(client, id);
  }

  _onBeacons(client) {
    return (id, data) => {
      const player = this.players[id];
      const beacons = player.beacons;
      player.clearBeacons();

      //console.log(id, data);

      for (let i = 0; i < data.length; i += 2) {
        const otherId = data[i];
        let beaconRssi = -Infinity;

        if (this.activeIds.has(otherId))
          beaconRssi = data[i + 1];

        beacons[otherId] = beaconRssi;
      }
    };
  }

  _onControl(client) {
    return (id, name, value) => {
      const player = this.players[id];

      player.state[name] = value;

      if (player.group) {
        for (let p of player.group.players) {
          if (p !== player)
            this.send(p.client, 'control', id, name, value);
        }
      }

      this.broadcast('tutti', null, 'control', id, name, value);
    };
  }
}
