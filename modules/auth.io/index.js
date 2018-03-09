'user strict'

var jwt = require("jsonwebtoken");

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

    this.name = cfg.table_name;
    this.table = table;
    this.paths = cfg.auth_paths;
    this.forward_token = cfg.forward_token;

    this.rights = cfg.rights;

    var this_class = this;

    this.terminate = function(ireq, ires, inext) {
      console.log("TERMINATE SESSION");
      function forward(that, req, res, next) {
        var access_token = req.cookies[this_class.name+'_access_token']
        if (access_token) {
          res.clearCookie(this_class.name+'_access_token');
          res.redirect(this_class.paths.unauthorized);
        } else {
          res.redirect(this_class.paths.unauthorized);
        }
      }
      forward(this, ireq, ires, inext);
    }

    var this_class = this;
    this.orize = function(req, res, next) {
      this_class.authorize(req, res, next)
    }

    this.orize_gen = function(required_rights) {
      return function(req, res, next) {
        this_class.authorize(req, res, next, required_rights)
      }
    }

    var app_path = cfg.prefix+'-auth.io';
    app.post(app_path, async function(req, res, next) {
      try {
        var data = req.body;

        switch (data.command) {
          case 'register':
            const err = await this_class.register(data);

            if (err) {
              res.send(err);
            } else {
              console.log("REDIRECT", this_class.paths.unauthorized);
              res.redirect(this_class.paths.unauthorized);
            }
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
      let columns = {
        email: 'varchar(256)',
        password: 'varchar(256)',
        jwt_secret: 'varchar(256)',
        cookie_secret: 'varchar(256)',
        access_token: 'varchar(256)',
        cfg: 'jsonb'
      };

      if (cfg.rights) {
        columns.super = 'boolean';
        columns.creator = 'boolean';
      }

      var table = await aura.table(cfg.table_name, {
        columns: columns
      });

      return new module.exports(app, table, cfg);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async register(data) {
    try {
      var found = await this.table.select(
        ['email'],
        "(email = $1)", [data.email]
      );

      if (!data.email) {
        return "FAILED: email address was not defined";
      } else if (!data.pwd) {
        return "FAILED: password was not defined";
      } else if (!data.pwdr) {
        return "FAILED: you did not repeat the password";
      } else if (data.pwd !== data.pwdr) {
        return "FAILED: passwords don't match";
      } else if (found.length > 0) {
        return "FAILED: email address already taken";
      } else {
        var salt = bcrypt.genSaltSync(10);
        var acc_data = {
          email: data.email,
          password: bcrypt.hashSync(data.pwd, salt)
        }
        if (this.rights) {
          acc_data.super = (data.super == true);
          acc_data.creator = (data.creator == true);
        }
        const result = await this.table.insert(acc_data);
        return false;
      }
    } catch (e) {
      console.error(e);
      return false;
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
        let found = await this.table.select(
          '*', "(email = $1)", [data.email]
        );

        console.log('AUTH FOUND', found);

        if (0 < found.length) {
          found = JSON.parse(JSON.stringify(found[0]));

          if (bcrypt.compareSync(data.pwd, found.password)) {
            let jwt_secret = crypto.randomBytes(64).toString('hex');
            let token = jwt.sign({
              exp: Math.floor(Date.now() / 1000) + 60 * 15,
              email: data.email
            }, jwt_secret);
            found.access_token = token;

            await this.table.update({
              access_token: token,
              jwt_secret: jwt_secret
            }, "id = $1", [found.id]);

            res.cookie(this.name+'_access_token', token, {
              httpOnly: true,
              maxAge: 1000 * 60 * 15
            });

            console.log("AUTH SUCCESSS");
            console.log("TOKEN", token);
            if (this.forward_token) {
              res.send(nunjucks_env.render('forward_token.html', {
                target: this.paths.authenticated,
                token: token
              }));
            } else {
              if (found.cfg) {
                if (found.cfg.auth_next) {
                  res.redirect(found.cfg.auth_next);
                } else {
                  res.redirect(this.paths.authenticated);
                }
              } else {
                res.redirect(this.paths.authenticated);
              }
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

  async authorize(req, res, next, required_rights) {
    try {
      if (req.headers.cookie) {
        var cookies = cookie.parse(req.headers.cookie);
        if (cookies[this.name+'_access_token']) {
          req.access_token = cookies[this.name+'_access_token'];
        } else {
          res.redirect(this.paths.unauthorized);
        }

        var access_token = req.access_token;

        if (!access_token) {
          this.terminate(req, res, next);
        }

        var found = await this.table.select(
          ['jwt_secret', 'access_token', 'cfg'],
          "access_token = $1", [access_token]
        );

        if (found.length > 0) {
          found = JSON.parse(JSON.stringify(found[0]));
          try {
            var decoded = jwt.verify(req.access_token, found.jwt_secret);
            if (required_rights) {
              console.log("REQ");
              var access_granted = true;
              for (var r = 0; r < required_rights.length; r++) {
                var required_right = required_rights[r];

                if (!found.cfg.rights.includes(required_right)) {
                  access_granted = false;
                  break;
                }
              }

              console.log("access_granted", access_granted);

              if (access_granted) {
                next();
              } else {
                res.redirect(this.paths.unauthorized);
              }
            } else {
              console.log("NEXT");
              next();
            }
          } catch (e) {
            console.log(e);
            res.redirect(this.paths.unauthorized);
          }
          console.log("SUCCESS");
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
