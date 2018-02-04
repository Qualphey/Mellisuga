'user strict'

var jwt = require("jsonwebtoken");
var JWT_SECRET = "3asd5z9hu5f9n4i8p1c8s1r6h1x8a1u4v5fs9c5hdryx5c9";

var cookie = require('cookie');
var COOKIE_SECRET = "5x4dhyc8s6ag84ngc91d3zx21v4x8c9cv54zd6r8gzx21c"

var bcrypt = require('bcryptjs');
var crypto = require('crypto');

const fs = require('fs-extra')
const path = require('path');

const nunjucks = require('nunjucks');
var nunjucks_env = new nunjucks.Environment(new nunjucks.FileSystemLoader([
  __dirname
], {
  autoescape: true,
//      watch: true,
  noCache: true
}));

module.exports = class {
  constructor(app, table, cfg) {
    /*
      CONFIG {
        table_name: "string",
        unauthorized: function(res),
      }
    */

    this.name = cfg.table_name
    this.table = table;
    this.paths = cfg.auth_paths;
    this.forward_token = cfg.forward_token;

    var this_class = this;

    this.app_parse_token = function(ireq, ires, inext) {
      console.log("PARSE TOKEN");
      function forward(that, req, res, next) {
        if (req.headers.cookie) {
          var cookies = cookie.parse(req.headers.cookie)
          if (cookies[this_class.name+'_access_token']) {
            req.access_token = cookies[this_class.name+'_access_token'];
          }
        }
        next();
      }
      forward(this, ireq, ires, inext);
    }

    this.terminate = function(ireq, ires, inext) {
      console.log("TERMINATE SESSION");
      function forward(that, req, res, next) {
        var access_token = req.cookies[this_class.name+'_access_token']
        if (access_token) {
          res.clearCookie(this_class.name+'_access_token');
          res.redirect('/');
        } else {
          res.redirect('/signin');
        }
      }
      forward(this, ireq, ires, inext);
    }

    var this_class = this;
    this.orize = function(req, res, next) {
      this_class.authorize(req, res, next)
    }

    var app_path = cfg.prefix+'-auth.io';
    app.post(app_path, async function(req, res, next) {
      try {
        var data = req.body;

        switch (data.command) {
          case 'register':
            console.log(data);
            await this_class.register(data, function(err) { //ERROR HANDLER ONLY
              if (err) {
                res.send(err);
                next();
              } else {
                res.redirect(this_class.paths.unauthorized);
                next();
              }
            });
            break;
          case 'authenticate':
            this_class.authenticate(req, res, next);
            break;
          case 'terminate':
            this_class.terminate(req, res, next);
            break;
          default:
        }
      } catch (e) {
        console.error(e.stack);
      }
    });

    app.get(app_path, async function(req, res, next) {
      this_class.terminate(req, res, next);
    });
  }

  static async init(app, aura, cfg) {
    try {
      var table = await aura.table(cfg.table_name, {
        columns: {
          email: 'varchar(256)',
          password: 'varchar(256)',
          jwt_secret: 'varchar(256)',
          cookie_secret: 'varchar(256)',
          access_token: 'varchar(256)'
        }
      });

      return new module.exports(app, table, cfg);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async register(data, next) {
    try {
      var found = await this.table.select(
        ['email'],
        "(email = $1)", [data.email]
      );

      if (!data.email) {
        next("FAILED: email address was not defined");
      } else if (!data.pwd) {
        next("FAILED: password was not defined");
      } else if (!data.pwdr) {
        next("FAILED: you did not repeat the password");
      } else if (data.pwd !== data.pwdr) {
        next("FAILED: passwords don't match");
      } else if (found.length > 0) {
        next("FAILED: email address already taken");
      } else {
        var salt = bcrypt.genSaltSync(10);
        var user_data = [
          ,
          crypto.randomBytes(64).toString('hex'),
          ''
        ]

        await this.table.insert(user_data)
        const result = await this.table.insert({
          email: data.email,
          password: bcrypt.hashSync(data.pwd, salt),
          jwt_secret: crypto.randomBytes(64).toString('hex'),
          cookie_secret: crypto.randomBytes(64).toString('hex')
        });
        next(false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async authenticate(req, res, next) {
    var this_class = this;

    try {
      var data = req.body;
      if (!data.email) {
        this.failed_response(res, "FAILED: email address was not defined");
      } else if (!data.pwd) {
        this.failed_response(res, "FAILED: password was not defined");
      } else {
        var found = await this.table.select(
          '*', "(email = $1)", [data.email]
        );

        if (0 < found.length) {
          found = JSON.parse(JSON.stringify(found[0]));
          console.log("FOUND", found);
          if (bcrypt.compareSync(data.pwd, found.password)) {
            var token = jwt.sign(data.email, found.jwt_secret);
            found.access_token = token;

            await this.table.update({
              access_token: token
            }, "id = $1", [found.id]);

            console.log("TOKEN", token);
            console.log("SET-COOKIE");
            res.cookie(this.name+'_access_token', token, {
              httpOnly: true,
              maxAge: 1000 * 60 * 15
            });
            if (this.forward_token) {
              console.log("REDIRECT", nunjucks_env.render('forward_token.html', {
                target: this.paths.authenticated,
                token: "abc"
              }) );
              res.send(nunjucks_env.render('forward_token.html', {
                target: this.paths.authenticated,
                token: token
              }));
              console.log("AUTH SUCCESSS");
            } else {
              res.redirect(this.paths.authenticated);
            }
          } else {
            this_class.failed_response(res, "FAILED: incorect password!");
            next();
          }
        } else {
          this.failed_response(res, "FAILED: no user registered with such email address!");
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  async authorize(req, res, next) {
    try {
      console.log("authorize attempt", req.cookies);
      var access_token = req.access_token;
      console.log("token", access_token);
      if (access_token) {
        var found = await this.table.select(
          ['jwt_secret', 'access_token'],
          "(access_token = $1)", [access_token]
        );
        console.log("FOUND",found);
        if (found.length > 0) {
          found = JSON.parse(JSON.stringify(found[0]));
          console.log("FOUND",found);
          var decoded = jwt.verify(req.access_token, found.jwt_secret);
          console.log("authorize next");
          console.log(req.body);
          next();
        } else {
          this.terminate(req, res, next);
        }
      } else {
        res.redirect(this.paths.unauthorized);
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  failed_response(res, msg) {
    res.send(msg);
  }

  io_parse_token(socket, next) {
    if (socket.request.headers.cookie) {
      var cookies = cookie.parse(socket.request.headers.cookie);
      if (cookies[this.name+'_access_token']) {
        socket.access_token = cookies[this.name+'_access_token'];
      }
    }
    next();
  }

  static builtin_pages() {
    var list = [];
    var this_class = this;

    var dir = path.resolve(__dirname, "pages");

    fs.readdirSync(dir).forEach(file => {
      var full_path = path.resolve(dir, file);
      var lstat = fs.lstatSync(full_path);
      if (lstat.isDirectory()) {
        list.push(full_path);
      }
    });

    return list;
  }
}
