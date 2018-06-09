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
        let this_class = this;
        let io = this.io;
        io.use(async function(socket, next){
          try {
            if (socket.request.headers.cookie) {
              socket.request.cookies = cookie.parse(socket.request.headers.cookie);

              // Authorization
              if (socket.request.cookies.access_token) {
                let client_exists = false;

                this_class.clients.forEach(client => {
                  if (socket.request.cookies.access_token === client.jwt) {
                    client_exists = true;
                  }
                });

                if (!client_exists) {
                  let n_client = new Client(socket, socket.request.cookies.access_token);
                  this_class.clients.push(n_client);
                  this.clients_cache = [];

                  socket.on('disconnect', function() {
                    console.log("disconnect", this_class.clients.indexOf(n_client));
                    this_class.clients.splice(this_class.clients.indexOf(n_client), 1);
                  });
                }

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
