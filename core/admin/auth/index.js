
const jwt = require("jsonwebtoken");

const cookie = require('cookie');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const auth_path = "/admin-auth";
const default_redirect = "/admin_auth";
const db_table = "admin_accounts";

module.exports = class {
  constructor(app, table, cfg) {
    this.table = table;
    this.path = auth_path;
    this.paths = cfg.auth_paths;

    var this_class = this;
    this.orize = function(req, res, next) {
      this_class.authorize(req, res, next)
    }

    this.orize_gen = function(required_rights) {
      return function(req, res, next) {
        this_class.authorize(req, res, next, required_rights)
      }
    }

    this.terminate = function(ireq, ires, inext) {
      function forward(that, req, res, next) {
        var access_token = req.cookies['access_token'];
        if (access_token) {
          res.clearCookie('access_token');
          res.redirect(this_class.paths.unauthorized);
        } else {
          res.redirect(this_class.paths.unauthorized);
        }
      }
      forward(this, ireq, ires, inext);
    }


    app.post(auth_path, async function(req, res) {
      try {
        var data = req.body;

        if (data.data) {
          if (typeof data.data === 'string' || data.data instanceof String) {
            data = JSON.parse(data.data);
          }
        }


        switch (data.command) {
          case 'authenticate':
            this_class.authenticate(req, res);
            break;
          case 'terminate':
            this_class.terminate(req, res);
            break;
          default:
            console.log('Invalid admin-auth command `' + data.command + '`');
        }
      } catch (e) {
        console.error(e.stack);
      }
    });
  }

  static async init(app, aura, cfg) {
    try {

      let table = await aura.table(db_table, {
        columns: {
          id: 'uuid',
          email: 'varchar(256)',
          password: 'varchar(256)',
          super: 'boolean',
          cfg: 'jsonb',
          jwt_token: 'varchar(512)'
        }
      });

      let this_class = new module.exports(app, table, cfg);

      return this_class;
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  }

  async authenticate(req, res) {
    var this_class = this;

    try {
      var data = JSON.parse(req.body.data);
      if (!data.email || !data.pwd) {
        res.json({
          err: 'usr/pass'
        });
      } else {
        let found = await this.table.select(
          '*', "(email = $1)", [data.email]
        );

        if (0 < found.length) {
          found = JSON.parse(JSON.stringify(found[0]));

          if (bcrypt.compareSync(data.pwd, found.password)) {
            const csrf_token = crypto.randomBytes(64).toString('hex');

            const jwt_token = jwt.sign({
              exp: Math.floor(Date.now() / 1000) + 60 * 15,
              id: found.id,
              csrf: csrf_token
            }, found.password);

            await this.table.update({
              jwt_token: jwt_token
            }, "id = $1", [found.id]);

            res.cookie('access_token', jwt_token, {
              httpOnly: true,
            });

            if (found.cfg) {
              if (found.cfg.auth_next) {
                res.json({
                  access_token: csrf_token,
                  next_url: found.cfg.auth_next
                });
              } else if (data.next_url) {
                res.json({
                  access_token: csrf_token,
                  next_url: data.next_url
                });
              } else {
                res.json({
                  access_token: csrf_token,
                  next_url: this.paths.authenticated
                });
              }
            } else if (data.next_url) {
              res.json({
                access_token: csrf_token,
                next_url: data.next_url
              });
            } else {
              res.json({
                access_token: csrf_token,
                next_url: this.paths.authenticated
              });
            }
          } else {
            res.json({
              err: "usr/pass"
            });
          }
        } else {
          res.json({
            err: "usr/pass"
          });
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  async authorize(req, res, next, required_rights) {
    try {
      let jwt_token = undefined;
      if (req.headers.cookie) {
        var cookies = cookie.parse(req.headers.cookie);
        if (cookies['access_token']) {
          jwt_token = cookies['access_token'];
        }
      }

      let redirect_path = undefined;
      if (req.method === "GET") {
        redirect_path = this.paths.unauthorized+"?next_url="+encodeURIComponent(req.originalUrl);
      }

      if (!jwt_token) {
        if (redirect_path) {
          res.status(401).redirect(redirect_path);
        } else {
          res.status(401).redirect(default_redirect);
        }
      } else {
        let session_data = await this.decrypt_token(jwt_token);
        if (session_data) {
          if (req.method === "POST") {
            if (req.body.access_token) {
              const csrf_token = req.body.access_token;
              if (session_data.csrf === csrf_token) {
                if (this.check_rights(session_data, required_rights)) {
                  next();
                } else {
                  res.status(401).send("Unauthorized");
                }

              } else {
                res.status(401).send("Unauthorized");
              }
            } else {
              res.status(401).send("Unauthorized");
            }
          } else {
            if (this.check_rights(session_data, required_rights)) {
              next();
            } else {

              console.log("RE");
              res.redirect(401, redirect_path);
            }
          }
        } else {
          if (redirect_path) {
            res.status(401).redirect(redirect_path);
          } else {
            res.status(401).redirect(default_redirect);
          }
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  async decrypt_token(jwt_token) {
    try {
      var found = await this.table.select(
        ['id', 'password', 'super', 'cfg'],
        "jwt_token = $1", [jwt_token]
      );

      if (found.length > 0) {
        found = JSON.parse(JSON.stringify(found[0]));
      } else {
        found = undefined;
      }

      let jwt_payload = undefined;
      try {
        jwt_payload = jwt.verify(jwt_token, found.password);
      } catch (e) {
        return undefined;
      }

      jwt_payload.super = found.super;
      jwt_payload.rights = found.cfg.rights;

      return jwt_payload;
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  }

  check_rights(session_data, required_rights) {
    if (required_rights) {
      var access_granted = true;
      for (var r = 0; r < required_rights.length; r++) {
        var required_right = required_rights[r];

        if (required_right === 'super_admin') {
          if (!session_data.super) {
            access_granted = false;
            break;
          } else if (this.super_disabled) {
            access_granted = false;
            break;
          }
        } else {
          if (!session_data.rights.includes(required_right)) {
            access_granted = false;
            break;
          }
        }
      }

      return access_granted;
    } else {
      return true;
    }
  }
}
