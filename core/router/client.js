module.exports = class {
  constructor(socket) {
    this.socket = socket;
    this.address = socket.handshake.address;
  }
}
