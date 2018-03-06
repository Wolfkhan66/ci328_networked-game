class Client {

  constructor() {
    console.log("in client constructor");
    this.socket = io(location.hostname + ':55000');
    this.newPlayer();
    this.allPlayers();
  }

  newPlayer() {
    this.socket.on('newplayer', function(data) {
      addNewPlayer(data.id, data.x, data.y);
    });
  }

  allPlayers() {
    let client = this;
    this.socket.on('allplayers', function(data) {
      for (var i = 0; i < data.length; i++) {
        addNewPlayer(data[i].id, data[i].x, data[i].y);
      }
      client.move();
      client.remove();
    });
  }

  move() {
    this.socket.on('move', function(data, direction) {
      console.log('move ', direction);
      movePlayer(data.id, data.x, data.y, direction);
    });
  }

  remove() {
    this.socket.on('remove', function(id) {
      removePlayer(id);
    });
  }

  sendTest() {
    console.log("Test Sent");
    this.socket.emit('test');
  }

  askNewPlayer() {
    this.socket.emit('newplayer');
  }

  sendClick(x, y) {
    this.socket.emit('click', {
      x: x,
      y: y
    });
  }

  sendCursor(direction) {
    this.socket.emit('movement', {
      direction: direction
    });
  }

}
