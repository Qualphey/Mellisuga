
const fs = require('fs');
const path = require('path');

const Aura = require('pg-aura');
const Auth = require('./auth/index.js');
const Accounts = require('./accounts/index.js');

const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const express = require("express");

module.exports = class {
  constructor() {

  }

  static async init(cfg, cmbird) {
    let this_class = cmbird.admin = new module.exports();
    let config = cmbird.config;

    let aura = cmbird.aura = await Aura.connect({
      db_host: "127.0.0.1",
      db_super_usr: cmbird.db_super_user,
      db_super_pwd: cmbird.db_super_pwd,
      db_name: config.db_name
    });

    let auth = this_class.auth = await Auth.init(cmbird.router.app, cmbird.aura, cfg);
    let accounts = this_class.accounts = await Accounts.init(cmbird);

    this_class.table = auth.table;

    cmbird.pages.serve_dir("/admin_auth", path.resolve(__dirname, 'auth/dist'));
    cmbird.pages.serve_dir("/cmbird_admin", path.resolve(__dirname, 'dist'), auth);

    if (!fs.existsSync(cmbird.globals_path)){
      fs.mkdirSync(cmbird.globals_path);
    }
    return this_class;
  }

  static async setup(cfg, cmbird) {
    let app = cmbird.app;

    let this_class = this;
    let config = cmbird.config;

    app.use(
      "/setup",
      express.static(__dirname+"/setup")
    );

    app.use(function(req, res, next) {
      if (!req.path.startsWith("/setup") && !req.path.startsWith("/initialise") && config.setup) {
        res.redirect("/setup");
      } else {
        next();
      }
    });

    return await new Promise(function(resolve) {
      app.post("/initialise", async function(req, res, next) {
        try {
          if (!config.setup) {
            res.redirect('/');
          } else {
            let data = req.body;

            if (!data.name) {
              res.send("FAILED: name was not defined");
            } else if (!data.email) {
              res.send("FAILED: email address was not defined");
            } else if (!data.pwd) {
              res.send("FAILED: password was not defined");
            } else if (!data.pwdr) {
              res.send("FAILED: you did not repeat the password");
            } else if (data.pwd !== data.pwdr) {
              res.send("FAILED: passwords don't match");
            } else {
              console.log("NEW ADMIN:", data);
              config.db_name = data.name.replace(/\s+/g, '').toLowerCase();
              config.db_pwd = crypto.randomBytes(20).toString('hex');



              var admin = await this_class.init(cfg, cmbird);

              data.super = true;
              data.creator = true;
              var result = await admin.register(data);

              if (result.err) {
                res.send(result.err);
              } else {
                config.name = data.name;

                config.setup = false;

                var oConfig = {};
                Object.assign(oConfig, config);
                delete oConfig.pages_path;

                await cmbird.save_config();

                resolve(admin);
                res.redirect(config.admin_path);
              }
            }
          }
        } catch (e) {
          console.error(e.stack)
        }
      });
    });
  }

  async register(data) {
    try {
      let err = false;

      let empty_fields = [];
      if (!data.name) {
        err = true;
        empty_fields.push('email');
      }
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

      let values_in_use = [];
      var found_email = await this.auth.table.select(
        ['email'],
        "(email = $1)", [data.email]
      );
      if (found_email.length > 0) {
        err = true;
        values_in_use.push('email');
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
          super: true
        }

        result.success = true;
        result.id = await this.table.insert(acc_data);
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
}
