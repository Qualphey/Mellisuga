'user strict'

var jwt = require("jsonwebtoken");
var JWT_SECRET = "3asd5z9hu5f9n4i8p1c8s1r6h1x8a1u4v5fs9c5hdryx5c9";

var cookie = require('cookie');
var COOKIE_SECRET = "5x4dhyc8s6ag84ngc91d3zx21v4x8c9cv54zd6r8gzx21c"

var bcrypt = require('bcryptjs');

module.exports = class {
  constructor(db, cfg) {
    /*
      CONFIG {
        table_name: "string",
        unauthorized: function(res),
      }
    */
    this.db = db;
    this.table_name = cfg.table_name;
    this.table = new db.Table(cfg.table_name, {
      props: ['email']
    });
    this.unauthorized = cfg.unauthorized;
  }

  async init() {
    try {
      await this.table.init();
    } catch (e) {
      console.error(e.stack);
    }
  }

  async register(data, error_handler) {
    var found = await this.table.select_by_property('email', data.email)
    .catch(e => console.error(e.stack));

    if (!data.name) {
      error_handler("FAILED: name was not defined");
    } else if (!data.email) {
      error_handler("FAILED: email address was not defined");
    } else if (!data.pwd) {
      error_handler("FAILED: password was not defined");
    } else if (!data.pwdr) {
      error_handler("FAILED: you did not repeat the password");
    } else if (data.pwd !== data.pwdr) {
      error_handler("FAILED: passwords don't match");
    } else if (found.length > 0) {
      error_handler("FAILED: email address already taken");
    } else {
      var salt = bcrypt.genSaltSync(10);
      var user_data = {
        email: data.email,
        pwd: bcrypt.hashSync(data.pwd, salt)
      }
      const result = await this.table.insert(user_data)
      .catch(e => console.error(e.stack));
    }
  }

  async authenticate(req, res, next) {
    try {
      var data = req.body;
      if (!data.email) {
        this.failed_response(res, "FAILED: email address was not defined");
      } else if (!data.pwd) {
        this.failed_response(res, "FAILED: password was not defined");
      } else {
        var found = await this.table.select_by_property('email', data.email);

        if (0 < found.length) {
          found = JSON.parse(JSON.stringify(found[0]));
          if (bcrypt.compareSync(data.pwd, found.data.pwd)) {
            var token = jwt.sign(data.email, JWT_SECRET)
            res.cookie('access_token', token, {
              httpOnly: true,
              maxAge: 1000 * 60 * 15
            });
            res.redirect(global.cmb_config.admin_path);
          } else {
            next("FAILED: incorect password");
            this_class.failed_response(res, "FAILED: incorect password!");
          }
        } else {
          this.failed_response(res, "FAILED: no user registered with such email address!");
        }
      }
    } catch (e) {
      console.error(e.stack);
    }
  }

  authorize(req, res, next) {
    console.log("authorize attempt");
    if (req.access_token) {
      var decoded = jwt.verify(req.access_token, JWT_SECRET);
      console.log("authorize next");
      next();
    } else {
      this.unauthorized(res);
    }
  }

  failed_response(res, msg) {
    res.send(msg);
  }

  terminate(req, res, next) {
    if (req.access_token) {
      res.clearCookie('access_token');
      res.redirect('/');
      next();
    } else {
      res.redirect('/');
      next();
    }
  }

  io_parse_token(socket, next) {
    if (socket.request.headers.cookie) {
      var cookies = cookie.parse(socket.request.headers.cookie);
      if (cookies.access_token) {
        socket.access_token = cookies.access_token;
      }
    }
    next();
  }

  app_parse_token(req, res, next) {
    if (req.headers.cookie) {
      var cookies = cookie.parse(req.headers.cookie)
      if (cookies.access_token) {
        req.access_token = cookies.access_token;
      }
    }
    next();
  }
}
