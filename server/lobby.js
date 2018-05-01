var User = require('./user.js');
module.exports = class Lobby {
  constructor(gameWorld, io) {
    this.users = [];
    this.connectedPlayers = 0;
    this.minimumPlayers = 1;
    this.maximumPlayers = 4;
    this.gameReady = false;
    this.gameActive = false;

    for (var i = 0; i < this.maximumPlayers; i++) {
      var user = new User(this.users.length + 1, gameWorld);
      this.users.push(user);
      gameWorld.createEntity("players", user.id, 0, 0);
    }
  }

  addPlayer(client, io) {
    if (!this.gameActive) {
      console.log("adding player to Lobby");
      var lobby = this;
      if (this.checkSlotAvailable() === true) {
        this.users.forEach(function(user) {
          if (user.connected === false && client.user == null) {
            user.connected = true;
            user.gameLoaded = false;
            user.isReady = false;
            user.AI.active = false;
            client.user = user;
            lobby.connectedPlayers++;
            client.emit('setID', client.user.id);
            io.emit('setLobbyScreen', lobby.users);
          }
        });
      } else {
        console.log("All slots full");
        client.emit('lobbyFull');
      }
    } else {
      console.log("sorry game is already active, you'll have to wait");
      client.emit('gameActive');
    }
  }

  checkAllReady() {
    var ready = true;

    if (this.connectedPlayers >= this.minimumPlayers) {
      this.users.forEach(function(user) {
        if (user.isReady === false) {
          ready = false;
        }
      });
    } else {
      ready = false;
    }

    console.log("Checking Ready : " + ready);
    return ready;
  }

  checkGameReady() {
    var lobby = this;
    this.gameReady = true;
    this.users.forEach(function(playerInLobby) {
      if (playerInLobby.gameLoaded === false) {
        lobby.gameReady = false;
      }
    });
    return this.gameReady;
  }

  checkSlotAvailable() {
    var available = false;
    this.users.forEach(function(user) {
      if (user.connected === false) {
        available = true;
      }
    });
    return available;
  }

  startAIUpdateTimer(io, gameWorld) {
    var lobby = this;
    let duration = 400;
    this.AIUpdateTimer = setInterval(() => {
      lobby.users.forEach(function(user) {
        user.AI.update(io, gameWorld);
      });
    }, duration);
  }

}
