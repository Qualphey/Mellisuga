'user strict'

var jwt = require("jsonwebtoken");

var cookie = require('cookie');

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const cryptorithm = 'aes-256-cbc';
const cryptword = '41631b983cc0906948401650d5636e8afac451c74abfd7935989cad7116e0c75';

function encrypt(text){
  var cipher = crypto.createCipher(cryptorithm, cryptword)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(text){
  var decipher = crypto.createDecipher(cryptorithm, cryptword)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8');
  return dec;
}

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

const schedule = require('node-schedule');

const nodemailer = require('nodemailer');

function obj_to_qstr(obj, prefix) {
  var str = [],
    p;
  for (p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p,
        v = obj[p];
      str.push((v !== null && typeof v === "object") ?
        serialize(v, k) : k + "=" + v);
    }
  }
  return str.join("&");
}

module.exports = class {
  constructor(app, table, cfg) {

    this.name = cfg.table_name;
    this.table = table;
    this.paths = cfg.auth_paths;
    this.forward_token = cfg.forward_token;

    this.required_custom_columns = cfg.required_custom_columns;
    this.unique_custom_columns = cfg.unique_custom_columns;

    this.super_disabled = cfg.super_disabled;

    this.autolock = cfg.autolock;

    var this_class = this;

    if (cfg.smtp) {
      this.smtp = cfg.smtp;
      this.msg = cfg.msg;
    }

    this.rights = cfg.rights;

    this.terminate = function(ireq, ires, inext) {
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

    app.use(function(req, res, next) {
      if (req.headers.cookie) {
        var cookies = cookie.parse(req.headers.cookie);
        if (cookies[this_class.name+'_access_token']) {
          if (!req.access_tokens) req.access_tokens = {};
          req.access_tokens[this_class.name] = cookies[this_class.name+'_access_token'];
        }
      }
      next();
    });

    var app_path = this.app_path = cfg.prefix+'-auth.io';
    app.post(app_path, async function(req, res, next) {
      try {
        var data = req.body;

        if (data.data) {
          if (typeof data.data === 'string' || data.data instanceof String) {
            data = JSON.parse(data.data);
          }
        }

        switch (data.command) {
          case 'register':
            const result = await this_class.register(data);

            if (result.err) {
              res.send(result);
            } else {
              res.send(result);
            //  console.log("REDIRECT", this_class.paths.unauthorized);
            //  res.redirect(this_class.paths.unauthorized);
            }
            break;
          case 'confirm':
            const results = await this_class.confirm(data.code);
            res.send(JSON.stringify(results));
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

    var restricted_path = cfg.prefix+'-auth.io-restricted';
    app.post(restricted_path, this.orize, async function(req, res, next) {
      console.log("restricted call");
      try {
        var data = req.body;

        if (data.data) {
          if (typeof data.data === 'string' || data.data instanceof String) {
            data = JSON.parse(data.data);
          }
        }

        switch (data.command) {
          case 'details':
            this_class.details(req, res, next);
            break;
          case 'edit':
            this_class.edit(data, res);
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

    schedule.scheduleJob('0 0 * * *', async function() {
      const list = await this_class.table.select(["id", "email_confirm_until"], "email_confirmation != $1", [true]);
      for (var a = 0; a < list.length; a++) {
        let acc = list[a];
        if (acc.email_confirm_until < Date.now()) {
          this_class.table.delete("id = $1", [acc.id]);
        }
      }
    });
  }

  static async init(app, aura, cfg) {
    try {
      let columns = {
        id: 'uuid',
        email: 'varchar(256)',
        password: 'varchar(256)',
        jwt_token: 'varchar(512)',
        cfg: 'jsonb',
        email_confirmation: 'boolean',
        email_confirm_until: 'bigint',
        locked: 'boolean'
      };

      if (cfg.rights) {
        columns.super = 'boolean';
        columns.creator = 'boolean';
      }

      if (cfg.custom_columns) {
        for (var key in cfg.custom_columns) {
          columns[key] = cfg.custom_columns[key];
        }
      }

      var table = await aura.table(cfg.table_name, {
        columns: columns
      });



      if (cfg.smtp) {
        let transporter = undefined;
        if (cfg.smtp.gmail) {
          transporter = nodemailer.createTransport(cfg.smtp.gmail);
        } else {
          transporter = nodemailer.createTransport({
            host: cfg.smtp.host,
            port: cfg.smtp.port,
            secure: false
          });
        }
        cfg.smtp = await new Promise(function(resolve) {
          function timeout() {
            console.error("SMTP connection timeout!");
            resolve(transporter);
          }

          const timeout_id = setTimeout(timeout, 15000);

          transporter.verify(function(error, success) {
            if (error) {
              console.log(error);
            } else {
              clearTimeout(timeout_id);
              resolve(transporter);
            }
          });
        });
      }
      return new module.exports(app, table, cfg);
    } catch (e) {
      console.error(e.stack);
      return null;
    }
  }

  async register(data) {
    try {
      let err = false;

      let empty_fields = [];
      if (!data.email) {
        err = true;
        empty_fields.push('email');
      }
      if (!data.pwd) {
        err = true;
        empty_fields.push('pwd');
      }
      if (!data.pwdr) {
        err = true;
        empty_fields.push('pwdr');
      }
      for (var r = 0; r < this.required_custom_columns.length; r++) {
        const reqcol_name = this.required_custom_columns[r];
        if (!data[reqcol_name]) {
          err = true;
          empty_fields.push(reqcol_name);
        }
      }

      let values_in_use = [];
      var found_email = await this.table.select(
        ['email'],
        "(email = $1)", [data.email]
      );
      if (found_email.length > 0) {
        err = true;
        values_in_use.push('email');
      }
      for (var r = 0; r < this.unique_custom_columns.length; r++) {
        const unicol_name = this.unique_custom_columns[r];
        var found_unicol = await this.table.select(
          [unicol_name],
          "("+unicol_name+" = $1)", [data[unicol_name]]
        );
        if (found_unicol.length > 0) {
          err = true;
          values_in_use.push(unicol_name);
        }
      }

      let pwds_dont_match = false;
      if (data.pwd !== data.pwdr) {
        pwds_dont_match = true;
      }

      let result = {};

      if (!err) {
        var salt = bcrypt.genSaltSync(10);
        var acc_data = {
          email: data.email,
          password: bcrypt.hashSync(data.pwd, salt),
          cfg: {
            rights: ["paskyra"]
          }
        }
        if (this.rights) {
          acc_data.super = (data.super == true);
          acc_data.creator = (data.creator == true);
        }

        let undefined_cols = [];
        for (var r = 0; r < this.required_custom_columns.length; r++) {
          const reqcol_name = this.required_custom_columns[r];
          acc_data[reqcol_name] = data[reqcol_name];
        }

        if (this.smtp) {
          acc_data.email_confirm_until = Date.now()+24*60*60*1000; // plus 24 hours
        }

        if (this.autolock) {
          acc_data.locked = true;
        }

        result.success = true;
        result.id = await this.table.insert(acc_data);

        if (this.smtp) {
          const confirmation_code = encrypt(acc_data.email);

          let mailOptions = {
            from: this.msg.from,
            to: acc_data.email,
            subject: this.msg.subject,
            text: nunjucks.renderString(this.msg.text, { code: confirmation_code }),
            html: nunjucks.renderString(this.msg.html, { code: confirmation_code })
          };


          this.smtp.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
          });
        }
      } else {
        result.err = {}
        if (empty_fields.length > 0) {
          result.err.empty_fields = empty_fields;
        }
        if (values_in_use.length > 0) {
          result.err.values_in_use = values_in_use;
        }
        if (pwds_dont_match) {
          result.err.pwds_dont_match = pwds_dont_match;
        }
      }
      return JSON.stringify(result);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async confirm(code) {
    try {
      if (code) {
        let found = await this.table.select(
          ["vardas", "pavarde", "imone", "planas","pareigos", "email", "id"],
          "email = $1",
          [decrypt(code)]
        );

        if (1 < found.length) {
          console.log("EMAIL CONFIRMATION DUPLICATE << !IMPORTANT");
        }

        if (0 < found.length) {
          var cuser = found[0];
          await this.table.update({
            email_confirmation: true
          }, "email = $1", [cuser.email]);
          return { user_data: cuser };
        } else {
          return { err: true };
        }
      } else {
        return { err: true };
      }
    } catch (e) {
      console.error(e);
      return { err: true };
    };
  }

  async authenticate(req, res, next) {
    var this_class = this;

    try {
      var data = JSON.parse(req.body.data);
      if (!data.email || !data.pwd) {
        res.send(JSON.stringify({
          err: true
        }));
      } else {
        let found = await this.table.select(
          '*', "(email = $1)", [data.email.toLowerCase()]
        );

        if (0 < found.length) {
          found = JSON.parse(JSON.stringify(found[0]));

          if (bcrypt.compareSync(data.pwd, found.password)) {
            let proceed = true;
            if (this.smtp) {
              if (!found.email_confirmation) {
                proceed = false;
              }
            }
            if (proceed) {
              if ('1' === '1') { //  !!!! --> !found.locked TODO
                const csrf_token = crypto.randomBytes(64).toString('hex');

                const jwt_token = jwt.sign({
                  exp: Math.floor(Date.now() / 1000) + 60 * 30,
                  email: data.email,
                  csrf: csrf_token
                }, found.password);

                await this.table.update({
                  jwt_token: jwt_token
                }, "id = $1", [found.id]);

                res.cookie(this.name+'_access_token', jwt_token, {
                  httpOnly: true,
                  maxAge: 1000 * 60 * 15
                });

                if (this.forward_token) {
                  res.send(nunjucks_env.render('forward_token.html', {
                    target: this.paths.authenticated,
                    access_token: csrf_token,
                  }));
                } else {
                  if (found.cfg) {
                    if (found.cfg.auth_next) {
                      res.send(JSON.stringify({
                        access_token: csrf_token,
                        next_url: found.cfg.auth_next
                      }));
                    } else if (data.next_url) {
                      res.send(JSON.stringify({
                        access_token: csrf_token,
                        next_url: data.next_url
                      }));
                    } else {
                      res.send(JSON.stringify({
                        access_token: csrf_token,
                        next_url: this.paths.authenticated
                      }));
                    }
                  } else if (data.next_url) {
                    res.send(JSON.stringify({
                      access_token: csrf_token,
                      next_url: data.next_url
                    }));
                  } else {
                    res.send(JSON.stringify({
                      access_token: csrf_token,
                      next_url: this.paths.authenticated
                    }));
                  }
                }
              } else {
                res.send(JSON.stringify({
                  err: "locked"
                }));
              }
            } else {
              res.send(JSON.stringify({
                err: "email_confirm"
              }));
            }
          } else {
            res.send(JSON.stringify({
              err: "usr/pass"
            }));
          }
        } else {
          res.send(JSON.stringify({
            err: "usr/pass"
          }));
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
        if (cookies['user_accounts_access_token']) {
          req.jwt_token = jwt_token = cookies['user_accounts_access_token'];
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
          console.log("req.method",req.method);

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
        console.error(e);
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

      if (access_granted) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  async details(req, res, next) {
    try {
      if (req.headers.cookie) {
        var cookies = cookie.parse(req.headers.cookie);
        if (cookies[this.name+'_access_token']) {
          req.access_token = cookies[this.name+'_access_token'];
        } else {
          res.redirect(redirect_path);
        }

        var access_token = req.jwt_token;

        if (access_token) {
          var found = await this.table.select(
            '*',
            "jwt_token = $1", [access_token]
          );


          if (found.length > 0) {
            found = found[0];
            delete found.password;
            delete found.jwt_secret;
            delete found.access_token;
            res.send(JSON.stringify(found));
          } else {
            this.terminate(req, res, next);
          }
        }
      } else {
        res.redirect(redirect_path);
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  async edit(data, res) {
    try {
      switch (data.what) {
        case "fname":
          await this.table.update({
              vardas: data.value
            },
            "id = $1", [data.id]
          );
          res.send("{}");
          break;
        case "lname":
          await this.table.update({
              pavarde: data.value
            },
            "id = $1", [data.id]
          );
          res.send("{}");
          break;
        case "phone":
          await this.table.update({
              tel_nr: data.value
            },
            "id = $1", [data.id]
          );
          res.send("{}");
          break;
        default:
          console.error("AUTH.IO: invalid edit target: ", data.what);
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
