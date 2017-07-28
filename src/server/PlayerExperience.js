import { Experience } from 'soundworks/server';
import mixSetup from '../shared/setup';

const instrumentList = Object.keys(mixSetup.instruments);
const numInstruments = instrumentList.length;
const tempo = mixSetup.common.tempo;
const tempoUnit = mixSetup.common.tempoUnit;
const numGroups = numInstruments / 2;

const maxPlayersPerGroup = 8;
const houskeepingPeriod = 1;
const playerOutTime = 3;

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

function getIdArray(s) {
  const a = [];

  for (let e of s)
    a.push(e.id);

  return a;
}

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
    experience.activePlayerIds.add(this.id);
    experience.availablePlayerIds.delete(this.id);
    experience.broadcast('player', client, 'player:unavailable', this.id);
  }

  reset() {
    const group = this.group;

    if (group)
      group.remove(this);

    this.innerCircle.clear();
    this.outerGroupCircle.clear();
    this.pendingGroup = null;

    this.client = null;

    const experience = this.experience;
    experience.activePlayerIds.delete(this.id);
    experience.availablePlayerIds.add(this.id);
    experience.broadcast('player', null, 'player:available', this.id);

    // setTimeout(() => {
    //   experience.availablePlayerIds.add(this.id);
    //   experience.broadcast('player', null, 'player:available', this.id);
    // }, playerOutTime * 1000);
  }

  addNeighbour(neighbour) {
    const experience = this.experience;
    experience.send(this.client, 'player:activate', [neighbour.id]);
  }

  removeNeighbour(neighbour) {
    const experience = this.experience;
    experience.send(this.client, 'player:deactivate', [neighbour.id]);
  }

  addNeighbours(neighbours) {
    const array = [];

    for (let n of neighbours) {
      if (n.id !== this.id)
        array.push(n.id);
    }

    const experience = this.experience;
    experience.send(this.client, 'player:activate', array);
  }

  removeNeighbours(neighbours) {
    const array = [];

    for (let n of neighbours) {
      if (n.id !== this.id)
        array.push(n.id);
    }

    const experience = this.experience;
    experience.send(this.client, 'player:deactivate', array);
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

    this.experience.send(this.client, 'player:group', group.id);
  }

  resetGroup(group) {
    this.group = null;
    this.experience.send(this.client, 'player:group');
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

let groupA = null;
let groupB = null;
let players = [];

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    // services
    this.audioBufferManager = this.require('audio-buffer-manager');
    this.checkin = this.require('checkin');
    this.sync = this.require('sync');
    this.metricScheduler = this.require('metric-scheduler', { tempo: tempo, tempoUnit: tempoUnit });

    this.innerRssi = distanceToRssi(innerDistance);
    this.outerRssi = distanceToRssi(outerDistance);

    this.players = [];
    this.activePlayerIds = new Set();
    this.availablePlayerIds = new Set();

    this.activeGroups = new Set();
    this.availableGroups = new Set();

    for (let i = 0; i < numInstruments; i++) {
      this.availablePlayerIds.add(i);

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
    this._onGroupHouskeeping();
  }

  fakeGroups(playerId) {
    const player = this.players[playerId];
    players.push(player);

    if (this.activePlayerIds.size === 2) {
      const p = players[0];
      const q = players[1];
      groupA = this.createGroup(p, q);
    } else if (this.activePlayerIds.size === 3) {
      const p = players[2];
      groupA.add(p);
    } else if (this.activePlayerIds.size === 5) {
      const p = players[3];
      const q = players[4];
      groupB = this.createGroup(p, q);

      setTimeout(() => {
        groupB.merge(groupA);
      }, 5000);

      setTimeout(() => {
        groupA.remove(players[1]);
      }, 8000);
    }
  }

  /*
   * request --> acknowledge(availablePlayerIds, activePlayerIds)
   * id(playerId) --> confirm(playerId) ->> enter(playerId)
   * exit(plaeryerId) ->> exit(playerId)
   *
   */

  enter(client) {
    super.enter(client);

    this.receive(client, 'player:request', this._onPlayerRequest(client));
    this.receive(client, 'player:id', this._onPlayerId(client));
    this.receive(client, 'player:exit', this._onPlayerExit(client));
    this.receive(client, 'player:beacons', this._onPlayerBeacons(client));
    this.receive(client, 'instrument:control', this._onInstrumentControl(client));
  }

  exit(client) {
    super.exit(client);

    const playerId = client.activities[this.id].playerId;
    if (playerId !== undefined)
      this.desactivatePlayer(client, playerId);
  }

  activatePlayer(client, playerId) {
    const player = this.players[playerId];
    player.init(client);

    client.activities[this.id].playerId = playerId;
    this.send(client, 'player:confirm', playerId);


    // this.fakeGroups(playerId);
  }

  desactivatePlayer(client, playerId) {
    if (this.activePlayerIds.has(playerId)) {
      const player = this.players[playerId];
      player.reset();

      client.activities[this.id].playerId = undefined;
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

  _initPlayerCircles() {
    // clear player's circles

    for (let playerId of this.activePlayerIds) {
      const player = this.players[playerId];
      player.clearCircles();
    }

    // fill plyer circles
    for (let playerId of this.activePlayerIds) {
      const player = this.players[playerId];
      const playerBeacons = player.beacons;

      for (let otherId of this.activePlayerIds) {
        if (playerId < otherId) {
          const other = this.players[otherId];
          const otherBeacons = other.beacons;
          const meanRssi = 0.5 * (playerBeacons[otherId] + otherBeacons[playerId]); // TODO: check if min or max is better

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
    for (let playerId of this.activePlayerIds) {
      const player = this.players[playerId];

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
    for (let playerId of this.activePlayerIds) {
      const player = this.players[playerId];

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
    this._initPlayerCircles();
    this._reduceGroups();
    this._mergeGroups();
    this._extendGroups();
    this._createGroups();

    setTimeout(this._onGroupHouskeeping, houskeepingPeriod * 1000);
  }

  _onPlayerRequest(client) {
    return () => {
      const availablePlayerIdArray = Array.from(this.availablePlayerIds);
      this.send(client, 'player:acknowledge', availablePlayerIdArray);
    };
  }

  _onPlayerId(client) {
    return (playerId) => {
      if (this.availablePlayerIds.has(playerId)) {
        this.activatePlayer(client, playerId);
      }
    };
  }

  _onPlayerExit(client) {
    return (playerId) => {
      this.desactivatePlayer(client, playerId);
    };
  }

  _onPlayerBeacons(client) {
    return (playerId, data) => {
      const player = this.players[playerId];
      const beacons = player.beacons;
      player.clearBeacons();

      console.log(playerId, data);

      for (let i = 0; i < data.length; i += 2) {
        const otherPlayerId = data[i];
        let beaconRssi = -Infinity;

        if (this.activePlayerIds.has(otherPlayerId))
          beaconRssi = data[i + 1];

        beacons[otherPlayerId] = beaconRssi;
      }
    };
  }

  _onInstrumentControl(client) {
    return (playerId, name, value) => {
      const player = this.players[playerId];

      if (player.group) {
        for (let p of player.group.players) {
          if (p !== player)
            this.send(p.client, 'instrument:control', playerId, name, value);
        }
      }
    };
  }
}