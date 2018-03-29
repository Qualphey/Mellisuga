'use strict'

const http = require('http');
const path = require('path');
const bodyParser = require('body-parser')

const express = require('express');
const cookieParser = require('cookie-parser');

const Client = require('./client.js');

module.exports = class {
    constructor(app, server, io) {
      this.app = app;
      this.server = server;
      this.io = io;
      this.clients = [];
      let this_class = this;

      io.on('connection', function(socket) {
        console.log("SOCKET CONNECTED");
        this_class.clients.push(new Client(socket));
        socket.on("token_test", function(data) {
          console.log(data, socket.access_token);
        });
      });
    }

    get(path, ...callbacks) {
      this.app.get(path, ...callbacks);
    }

    post(path, ...callbacks) {
      this.app.post(path, ...callbacks);
    }

    serve(dir_path) {
      this.app.use(express.static(dir_path));
    }

    use(...args) {
      this.app.use(...args);
    }

    static static(dir_path) {
      return express.static(dir_path);
    }

    static async init() {
      let app = express();
      let server = http.createServer(app);
      let io = require('socket.io')(server);


      app.use(cookieParser());
      app.use(bodyParser.json());         // to support JSON-encoded bodies
      app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
      }));

      await new Promise((resolve, reject) => {
        server.listen(global.cmb_config.port, global.cmb_config.host, function(){
          var addr = server.address();
          console.log("Server running ", addr.address + ":" + addr.port);
          resolve();
        });
      });
      return new module.exports(app, server, io);
    }
}
