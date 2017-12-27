'use strict'

const server_port = 9639;
const server_ip_address = '127.0.0.1';

var http = require('http');
var path = require('path');
var bodyParser = require('body-parser')

var express = require('express');

var nunjucks = require('nunjucks');

module.exports = class {
    constructor(app, server, io) {
      this.app = app;
      this.server = server;
      this.io = io;
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
      var app, server, io;
      await new Promise((resolve, reject) => {
        app = express();
        server = http.createServer(app);
        io = require('socket.io')(server);

        app.use(bodyParser.json());         // to support JSON-encoded bodies
        app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
          extended: true
        }));

        nunjucks.configure([global.cmb_config.pages_path, global.cmb_config.templates_path], {
          autoescape: true,
          express: app,
          watch: true
        });

  /*      app.set('view engine', 'html');
        app.set('views', global.cmb_config.pages_path)
        app.engine('html', ejs.renderFile);*/

/*        io.use(function(socket, next) {
          console.log(socket.handshake.session.usr);
          next();
        });*/

        server.listen(server_port, server_ip_address, function(){
          var addr = server.address();
          console.log("Server running ", addr.address + ":" + addr.port);
          resolve(app);
        });
      });
      return new module.exports(app, server, io);
    }
}
