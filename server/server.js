const PORT = 55000;
var server = require('http').createServer();
var io = require('socket.io')(server);
var Lobby = require('./lobby.js');
var GameWorld = require('./gameWorld.js');
main();

function main() {
  var gameWorld = new GameWorld();
  var lobby = new Lobby(gameWorld);
  io.on('connection', function(client) {

    client.on('disconnect', function() {
      lobby.users.forEach(function(user) {
        if (user === client.user) {
          lobby.connectedPlayers--;
          console.log("disconnecting player" + client.user.id)
          user.connected = false;
          user.AI.active = true;
        }
      });
    });

    client.on('test', function() {
      console.log('test received');
    });

    client.on('joinLobby', function() {
      lobby.addPlayer(client, gameWorld);
      client.emit('setID', client.user.id);
    });

    client.on('playerReady', function() {
      console.log("Client " + client.user.id + " is ready");
      client.user.isReady = true;
      if (lobby.checkAllReady() === true) {
        io.emit('loadGame');
      }
    });

    client.on('gameLoaded', function() {
      client.user.gameLoaded = true;
      if (lobby.checkGameReady()) {
        gameWorld.gamePrep(io, client, lobby);
        lobby.startAIUpdateTimer(io, gameWorld);
      }
    });

    client.on('newplayer', function() {

      client.on('movement', function(direction) {
        gameWorld.movePlayer(direction, client.user.id, io, client);
      });

      client.on('targetReached', function() {
        var player = gameWorld.entities.players[client.user.id];
        player.x = player.expectedPosition.x;
        player.y = player.expectedPosition.y;
      });
    });
  });

  server.listen(PORT, function() {
    console.log('Listening on ' + server.address().port);
  });
}
