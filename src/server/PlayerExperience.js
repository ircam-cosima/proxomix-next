import { Experience } from 'soundworks/server';
import mixSetup from '../shared/setup';

const instrumentList = Object.keys(mixSetup.instruments);
const numInstruments = instrumentList.length;
const tempo = mixSetup.common.tempo;
const tempoUnit = mixSetup.common.tempoUnit;
const numGroups = numInstruments / 2;

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

const maxGroupAge = 1000;
let xp = null;

function getAvailableGroup() {
  const iter = xp.availableGroups.entries();
  return iter.next().value;
}

class Group {
  constructor(id) {
    this.id = id;
    this.players = new Set();
  }

  init(players) {
    for (let player of players) {
      player.addNeighbours(players);
      player.setGroup(this);
    }

    xp.activeGroups.add(this);
    xp.availableGroups.delete(this);
  }

  reset() {
    this.players.clear();
    xp.activeGroups.delete(this);
    xp.availableGroups.add(this);
  }

  addPlayer(player) {
    // add player as neihbour of players of the group
    for (let p of this.players)
      p.addNeighbour(player);

    // add all players of the group as neihbours of the added player
    const players = Array.from(this.players);
    player.addNeighbours(players);

    player.setGroup(this);

    this.players.add(player);
  }

  removePlayer(player) {
    if (this.players.size > 2) {
      this.players.delete(player);

      // remove player as neihbour of players of the group
      for (let p of this.players)
        p.removeNeighbour(player);

      // add all players of the group as neihbours of the added player
      const players = Array.from(this.players);
      player.removeNeighbours(players);

      player.resetGroup();
    } else {
      const iter = this.players.entries();
      const p = iter.next().value;
      const q = iter.next().value;

      p.removeNeighbour(q);
      p.resetGroup();

      q.removeNeighbour(p);
      q.resetGroup();

      this.reset();
    }
  }

  merge(merge) {
    let players = Array.from(merge.players);
    for (let p of this.players) {
      p.addNeighbours(players);
    }

    players = Array.from(this.players);
    for (let p of merge.players) {
      this.players.add(p);
      p.setGroup(this);
      p.addNeighbours(players);
    }

    merge.reset();
  }

  removeDistantMembers() {
    // sort group members by number of others in outer circle and age
    const sortedPlayers = Array.from(this.players);
    sortedPlayers.sort(groupCircleSort);

    const rootPlayer = sortedPlayers[0];

    for (let i = sortedPlayers.length - 1; i >= 0; i++) {
      const player = sortedPlayers[i];

      if (!player.outerGroupCircle.has(rootPlayer))
        this.removePlayer(player);
    }
  }

  checkMerge(other) {
    for (let p of this.players) {
      const innerCircle = player.innerCircle;

      for (let o of other.players) {
        if (!innerCircle.has(o))
          return false;
      }
    }

    return true;
  }
}

class Player {
  constructor(id) {
    this.id = id;
    this.client = null;
    this.beacons = [];

    this.group = null;
    this.groupAge = 0;

    this.innerCircle = new Set();
    this.outerGroupCircle = new Set();

    for (let i = 0; i < numInstruments; i++)
      this.beacons.push(-Infinity);
  }

  addNeighbour(neihbour) {

  }

  removeNeighbour(neihbour) {

  }

  addNeighbours(neihbours) {

  }

  removeNeighbours(neihbours) {

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
    this.groupAge = 0;
    // send to client
  }

  resetGroup(group) {
    this.group = null;
    // send to client
  }

  incrGroupAge() {
    if (this.groupAge < maxGroupAge - 1)
      this.groupAge++;
  }
}

function groupCircleSort(player, other) {
  const playerValue = player.outerGroupCircle.size + player.groupAge / maxGroupAge;
  const otherValue = other.outerGroupCircle.size + other.groupAge / maxGroupAge;
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
  }

  start() {}

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

    client.activities[this.id].playerId = playerId;

    this.send(client, 'player:confirm', playerId);
    this.broadcast('player', client, 'player:enter', playerId);
  }

  exitPlayer(client, playerId) {
    if (this.activePlayerIds.has(playerId)) {
      this.activePlayerIds.delete(playerId);

      this.broadcast('player', client, 'player:exit', playerId);

      setTimeout(() => {
        this.availablePlayerIds.add(playerId);
        this.broadcast('player', null, 'player:available', playerId);
      }, playerOutTime * 1000);
    }
  }

  _getPlayerCircles() {
    // clear player's circles
    for (let player in group.players)
      player.clearCircles();

    // fill plyer circles
    for (let playerId in this.activePlayerIds) {
      const player = this.players[playerId];
      const playerBeacons = player.beacons;

      for (let otherId in this.activePlayerIds) {
        if (playerId < otherId) {
          const other = this.players[otherId];
          const otherBeacons = other.beacons;
          const meanRssi = 0.5 * (playerBeacons[otherId] + otherBeacons[playerId]);

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

  _groupHouskeeping() {
    this._getPlayerCircles();

    // check group members
    for (let group in xp.activeGroups)
      group.removeDistantMembers();

    // merge groups
    for (let group in xp.activeGroups) {
      for (let other in xp.activeGroups) {
        if (group.id < other.id) {
          if (group.checkMerge(other)) {
            let keep = group;
            let merge = other;

            if (group.players.size < other.players.size) {
              keep = other;
              merge = group;
            }

            keep.merge(merge);
          }
        }
      }
    }
  }

  _onPlayerRequest(client) {
    return () => {
      const availablePlayerIdArray = Array.from(this.availablePlayerIds);
      const activePlayerIdArray = Array.from(this.activePlayerIds);
      this.send(client, 'player:acknowledge', availablePlayerIdArray, activePlayerIdArray);
    };
  }

  _onPlayerId(client) {
    return (playerId) => {
      if (this.availablePlayerIds.has(playerId))
        this.enterPlayer(client, playerId);
    };
  }

  _onPlayerExit(client) {
    return (playerId) => this.exitPlayer(client, playerId);
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
    return (playerId, name, value) => this.broadcast('player', client, 'instrument:control', playerId, name, value);
  }
}