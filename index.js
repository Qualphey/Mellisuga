'use strict'

const fs = require('fs');
const path = require('path');

const bcrypt = require('bcryptjs');
const crypto = require("crypto");

const nunjucks = require('nunjucks');

const jsonlint = require("jsonlint");



const Router = require("./modules/router/router.js");



const Auth = require("./modules/auth.io/index.js");

const PagesIO = require("./modules/pages.io/index.js");
const BuiltinIO = require("./modules/pages.io/builtin.js");
const PostsIO = require("./modules/posts.io/index.js");
const FMIO = require("./modules/treefm.io/fm.io.js");
const GalleryIO = require("./modules/gallery.io/index.js");
const AdminAccountsIO = require("./modules/admin_accounts.io/index.js");
const UserAccountsIO = require("./modules/user_accounts.io/index.js");





const Aura = require('pg-aura');


const ModulesIO = require("./modules/modules.io/index.js");

/**
 * The main class of this cms.
 */
module.exports = class CMBird {

  /**
   * constructor.
   * @param {Object} cfg - configuration object
   * @param {string} cfg.host - hostname i.e. `localhost`
   * @param {integer} cfg.port - port i.e. `8080`
   * @param {string} cfg.db_user - postgresql super user name i.e. `postgres`
   * @param {string} cfg.db_pwd - postgresql super user password i.e. `postgres`
   * @param {string} cfg.app_path - path to app top level directory i.e. `__dirname`
   * @param {function(router: Router)} callback - this is function param.
   */
  constructor(cfg) {
    this.app_path = cfg.app_path;

  }

  static async init(cfg) {
    try {
      let this_class = new module.exports(cfg);


      const config_path = path.resolve(cfg.app_path, 'config.json');
      var config = undefined;
      if (fs.existsSync(config_path)) {
        config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
      } else {
        config = {
          setup: true,
          admin_path: "/cmb_admin"
        }
      }

      config.app_path = cfg.app_path;
      config.pages_path = path.resolve(cfg.app_path, 'pages');
      config.templates_path = path.resolve(cfg.app_path, 'templates');
      config.globals_path = path.resolve(cfg.app_path, 'globals');
      config.host = cfg.host;
      config.port = cfg.port;
      config.db_super_user = cfg.db_user;
      config.db_super_pwd = cfg.db_pwd;

      global.cmb_config = config;

      let router = this_class.router = await Router.init();
      this_class.app = router.app;

      router.use(function(req, res, next) {
        if (!req.path.startsWith("/setup") && !req.path.startsWith("/initialise") && config.setup) {
          res.redirect("/setup");
        } else {
          next();
        }
      });

      const Auth = require("./modules/auth.io/index.js");

      if (!fs.existsSync(config.globals_path)){
        fs.mkdirSync(config.globals_path);
      }

      var builtin_pages = await BuiltinIO.init(
        path.resolve(config.pages_path, ".builtin"), [
          path.resolve(__dirname, "builtin_pages/setup"),
          path.resolve(__dirname, "builtin_pages/admin_auth"),
          path.resolve(__dirname, "modules/auth.io/pages/signin"),
          path.resolve(__dirname, "modules/auth.io/pages/signup")
        ], router, null, null, [
          config.pages_path
        ]
      );

      async function initialise(db_name) {
        try {

          var aura = this_class.aura = await Aura.connect({
            db_host: "127.0.0.1",
            db_super_usr: cfg.db_user,
            db_super_pwd: cfg.db_pwd,
            db_name: db_name
          });

          var posts = await PostsIO.init(router.app, aura, {
            pages_path: config.pages_path
          });


          var io = router.io;
          var admin = await Auth.init(router.app, aura, {
            table_name: "admin_accounts",
            auth_paths: {
              unauthorized: "/admin_auth",
              authenticated: config.admin_path
            },
            prefix: '/cmb_admin',
            rights: true
          });

          var auth = this_class.auth = await Auth.init(router.app, aura, {
            table_name: "user_accounts",
            auth_paths: {
              unauthorized: "/signin",
              authenticated: "/Paskyra"
            },
            prefix: '/users',
            custom_columns: {
              vardas: "varchar(256)",
              pavarde: "varchar(256)",
              tel_nr: "varchar(32)",
              planas: "smallint",
              sumoketa: "boolean"
            },
            required_custom_columns: ['vardas', 'pavarde', 'tel_nr', 'planas'],
            unique_custom_columns: ['tel_nr']
          });

          var pages_io = this_class.pages = await PagesIO.init(router, posts, auth, admin);

          router.use(
            config.admin_path,
            admin.orize_gen(["super_admin"]),
            Router.static(__dirname+"/dist")
          );

          router.use(
            '/g',
            Router.static(config.globals_path)
          );

          const res_dir_path = path.resolve(__dirname, 'dist/res');

          var fmio_templates = new FMIO({
            router: router,
            targets: {
              templates: config.templates_path,
              pages: config.pages_path,
              globals: config.globals_path
            }
          });

          var modules_path = path.resolve(config.app_path, 'cmbird_modules');

          var admin_accounts_io = await AdminAccountsIO.init(router.app, admin.table);
          var user_accounts_io = await UserAccountsIO.init(router.app, auth.table);

          var gallery_path = path.resolve(config.app_path, 'gallery');
          var gallery_io = await GalleryIO.init(gallery_path, config.admin_path, router.app);



          let modules = await ModulesIO.init(this_class);

          return admin;
        } catch (e) {
          console.error(e);
          return undefined;
        }
      };

      if (!config.setup) {
        await initialise(config.db_name);
        return this_class;
      } else {
        return await new Promise(function(resolve) {
          router.post("/initialise", async function(req, res, next) {
            try {
              if (!config.setup) {
                res.redirect('/');
              } else {
                var data = req.body;

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
                  console.log("DATA", data);
                  config.db_name = data.name.replace(/\s+/g, '').toLowerCase();
                  config.db_pwd = crypto.randomBytes(20).toString('hex');
                  var admin = await initialise(config.db_name);

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

                    fs.writeFile(config_path, JSON.stringify(oConfig, null, 4), 'utf8', function (err) {
                      if (err) {
                        res.send("Failed to write config file: "+err);
                        return false;
                      } else {
                        resolve();
                        res.redirect(config.admin_path);
                        return true;
                      }
                    });
                  }
                }
              }
            } catch (e) {
              console.error(e.stack)
            }
          });
        });
      }
    } catch (e) {
      console.error(e.stack);
    }
  }
}
