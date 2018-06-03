'use strict'

const http = require('http');
const path = require('path');
const bodyParser = require('body-parser')

const express = require('express');
const cookieParser = require('cookie-parser');

const Client = require('./client.js');

var cookie = require('cookie');

module.exports = class {
    constructor(app, server, io, cfg) {
      this.app = app;
      this.server = server;
      this.io = io;
      this.clients = [];
      this.host = cfg.host;
      this.port = cfg.port;
    }

    async listen(admin_auth) {
      try {
        let io = this.io;
        io.use(async function(socket, next){
          try {
            if (socket.request.headers.cookie) {
              socket.request.cookies = cookie.parse(socket.request.headers.cookie);

              // Authorization
              if (socket.request.cookies.access_token) {
                let payload = await admin_auth.decrypt_token(socket.request.cookies.access_token);
                if (payload) {
                  next();
                }
              } else {
                unauthorized();
              }
            } else {
              unauthorized();
            }

            function unauthorized() {
              let err  = new Error('Authentication error');
              err.data = { type : 'authentication_error' };
              next(err);
            }
          } catch(e) {
            console.error(e.stack);
          }
        });

        let server = this.server;

        let this_class = this;

        return await new Promise((resolve, reject) => {
          server.listen(this_class.port, this_class.host, function() {
            var addr = server.address();
            console.log("Server running ", addr.address + ":" + addr.port);
            resolve();
          });
        });
      } catch (e) {
        console.error(e.stack);
        return undefined;
      }
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

    static async init(host, port) {
      let app = express();
      let server = http.createServer(app);
      let io = require('socket.io')(server);


      app.use(cookieParser());
      app.use(bodyParser.json());         // to support JSON-encoded bodies
      app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
      }));

      return new module.exports(app, server, io, { host: host, port: port });
    }
}
