'user strict'

var jwt = require("jsonwebtoken");
var JWT_SECRET = "3asd5z9hu5f9n4i8p1c8s1r6h1x8a1u4v5fs9c5hdryx5c9";

var cookie = require('cookie');
var COOKIE_SECRET = "5x4dhyc8s6ag84ngc91d3zx21v4x8c9cv54zd6r8gzx21c"

var bcrypt = require('bcryptjs');

module.exports = class {
  constructor(config) {
    this.verify_credentials = config.verify_credentials;
    this.unauthorized = config.unauthorized;

    var this_class = this;

    this.authenticate = function(req, res, next) {
      var data = req.body;

      if (!data.email) {
        this_class.failed_response(res, "FAILED: email address was not defined");
      } else if (!data.pwd) {
        this_class.failed_response(res, "FAILED: password was not defined");
      } else {
        this_class.verify_credentials(data.email, data.pwd, function(err, usr) {
          var token = jwt.sign(usr, JWT_SECRET)
          if (err) {
            this_class.failed_response(res, err);
          } else {
            res.cookie('access_token', token, {
              httpOnly: true,
              maxAge: 1000 * 60 * 15
            });
            res.redirect(global.cmb_config.admin_path);
          }
        });
      }
    }

    this.authorize = function(req, res, next) {
      console.log("authorize attempt");
      if (req.access_token) {
        var decoded = jwt.verify(req.access_token, JWT_SECRET);
        console.log("authorize next");
        next();
      } else {
        this_class.unauthorized(res);
      }
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
