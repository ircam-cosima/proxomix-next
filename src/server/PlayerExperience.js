import { Experience } from 'soundworks/server';
import mixSetup from '../shared/setup';

const instrumentList = Object.keys(mixSetup.instruments);
const numInstruments = instrumentList.length;
const tempo = mixSetup.common.tempo;
const tempoUnit = mixSetup.common.tempoUnit;
const numGroups = numInstruments / 2;

const houskeepingPeriod = 1;
const playerOutTime = 1;

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
let xp = null;

class Group {
  constructor(id) {
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

    xp.activeGroups.add(this);
    xp.availableGroups.delete(this);
  }

  reset() {
    this.players.clear();
    this.age = 0;

    xp.activeGroups.delete(this);
    xp.availableGroups.add(this);
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
    // add player as neighbour of players of the group
    for (let p of this.players)
      p.addNeighbour(player);

    // add all players of the group as neighbours of the added player
    player.addNeighbours(this.players);
    player.setGroup(this);

    this.players.add(player);
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

    for (let p of keep.players)
      p.addNeighbours(merge.players);

    for (let p of merge.players) {
      keep.players.add(p);
      p.setGroup(keep);
      p.addNeighbours(keep.players);
    }

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
  constructor(id) {
    this.id = id;
    this.client = null;
    this.beacons = [];

    this.group = null;
    this.age = 0;

    this.innerCircle = new Set();
    this.outerGroupCircle = new Set();

    for (let i = 0; i < numInstruments; i++)
      this.beacons.push(-Infinity);
  }

  addNeighbour(neighbour) {
    xp.send(this.client, 'player:activate', [neighbour.id]);
  }

  removeNeighbour(neighbour) {
    xp.send(this.client, 'player:disactivate', [neighbour.id]);
  }

  addNeighbours(neighbours) {
    const array = [];

    for (let n of neighbours) {
      if (n.id !== this.id)
        array.push(n.id);
    }

    xp.send(this.client, 'player:activate', array);
  }

  removeNeighbours(neighbours) {
    const array = [];

    for (let n of neighbours) {
      if (n.id !== this.id)
        array.push(n.id);
    }

    xp.send(this.client, 'player:disactivate', array);
  }

  clearBeacons() {
    const beacons = this.beacons;

    for (let i = 0; i < beacons.length; i++)
      beacons[i] = -Infinity;
  }

  clearCircles() {
    this.innerCircle.clear();
    this.outerGroupCircle.clear();
  }

  setGroup(group) {
    this.group = group;
    this.age = 0;

    xp.send(this.client, 'player:group', group.id);
  }

  resetGroup(group) {
    this.group = null;
    xp.send(this.client, 'player:group');
  }

  incrAge() {
    if (this.age < maxAge - 1)
      this.age++;
  }
}

function groupCircleSort(player, other) {
  const playerValue = player.outerGroupCircle.size + player.age / maxAge;
  const otherValue = other.outerGroupCircle.size + other.age / maxAge;
  return playerValue - otherValue;
}

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

      const player = new Player(i);
      this.players.push(player);
    }

    for (let i = 0; i < numGroups; i++) {
      const group = new Group(i);
      this.availableGroups.add(group);
    }

    xp = this;

    this._onGroupHouskeeping = this._onGroupHouskeeping.bind(this);
  }

  start() {
    //setTimeout(this._onGroupHouskeeping, houskeepingPeriod * 1000);
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
    if (playerId !== undefined) {
      client.activities[this.id].playerId = undefined;
      this.exitPlayer(client, playerId);
    }
  }

  enterPlayer(client, playerId) {
    this.availablePlayerIds.delete(playerId);

    this.activePlayerIds.add(playerId);
    this.players[playerId].client = client;

    client.activities[this.id].playerId = playerId;

    this.send(client, 'player:confirm', playerId);
    this.broadcast('player', client, 'player:unavailable', playerId);

    if(this.activePlayerIds.size === 2) {
      const group = this._getAvailableGroup();
      const iter = this.activePlayerIds.values();
      const p = this.players[iter.next().value];
      const q = this.players[iter.next().value];

      console.log("group:", group);
      console.log("players:", p, q);

      group.init(p, q);
    }
  }

  exitPlayer(client, playerId) {
    if (this.activePlayerIds.has(playerId)) {
      this.activePlayerIds.delete(playerId);
      this.players[playerId].client = null;

      this.broadcast('player', client, 'player:exit', playerId);

      setTimeout(() => {
        this.availablePlayerIds.add(playerId);
        this.broadcast('player', null, 'player:available', playerId);
      }, playerOutTime * 1000);
    }
  }

  _getAvailableGroup() {
    const iter = this.availableGroups.values();
    return iter.next().value;
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
    for (let group of xp.activeGroups)
      group.reduce();
  }

  _mergeGroups() {
    for (let group of xp.activeGroups) {
      for (let other of xp.activeGroups) {
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

      if (!player.group) {
        for (let neighbour of player.innerCircle) {
          let group = neighbour.group;

          if (group) {
            if (group.canAdd(player)) {
              group.add(player);
              break;
            }
          } else {
            group = this._getAvailableGroup();
            group.init(player, neighbour);
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
        this.players[playerId].client = client;
        this.enterPlayer(client, playerId);
      }
    };
  }

  _onPlayerExit(client) {
    return (playerId) => {
      this.players[playerId].client = null;
      this.exitPlayer(client, playerId);
    };
  }

  _onPlayerBeacons(client) {
    return (playerId, data) => {
      const player = this.players[playerId];
      const beacons = player.beacons;

      player.clearBeacons();

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

      if(player.group) {
        for (let p of group.players)
          this.send(p.client, 'instrument:control', playerId, name, value);
      }
    };
  }
}
