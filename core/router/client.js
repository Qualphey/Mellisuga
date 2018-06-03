module.exports = class {
  constructor(socket) {
    this.socket = socket;
    this.jwt = socket.request.cookies.access_token;
  }
}
