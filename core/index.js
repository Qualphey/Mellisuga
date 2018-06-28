'use strict'

const fs = require('fs');
const path = require('path');

const bcrypt = require('bcryptjs');
const crypto = require("crypto");

const nunjucks = require('nunjucks');

const jsonlint = require("jsonlint");



const Router = require("./router/index.js");
const Admin = require("./admin/index.js")
const Moduload = require("./moduload/index.js")

const Auth = require("./auth/index.js");

const PostsIO = require("./posts/index.js");
const PagesIO = require("./pages/index.js");

const Mailer = require("./mailer/index.js");


//const BuiltinIO = require("./pages/builtin.js");

/*
const FMIO = require("./modules/treefm.io/fm.io.js");
const GalleryIO = require("./modules/gallery.io/index.js");
const AdminAccountsIO = require("./modules/admin_accounts.io/index.js");
const UserAccountsIO = require("./modules/user_accounts.io/index.js");
*/


const Aura = require('pg-aura');

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

    this.config_path = path.resolve(cfg.app_path, 'config.json');
    this.pages_path = path.resolve(cfg.app_path, 'pages');
    this.templates_path = path.resolve(cfg.app_path, 'templates');
    this.globals_path = path.resolve(cfg.app_path, 'globals');
   
    this.admin_path = "/mellisuga";

    this.host = cfg.host;
    this.port = cfg.port;

    this.db_super_user = cfg.db_user;
    this.db_super_pwd = cfg.db_pwd;

    this.dev_mode = cfg.dev_mode;
  }

  static async init(cfg) {
    try {
      let this_class = new module.exports(cfg);

      let config = this_class.config = await this_class.load_config();

      let router = this_class.router = await Router.init(this_class.host, this_class.port);
      this_class.app = router.app;

      let pages_io = this_class.pages = await PagesIO.init(cfg, this_class);

      let admin = undefined;
      if (!config.setup) {
        admin = await Admin.init({
          table_name: "admin_accounts",
          auth_paths: {
            unauthorized: "/admin_auth",
            authenticated: config.admin_path
          },
          prefix: '/cmb_admin',
          rights: true,
          super_disabled: cfg.disable_super
        }, this_class);
      } else {
        admin = await Admin.setup({
          table_name: "admin_accounts",
          auth_paths: {
            unauthorized: "/admin_auth",
            authenticated: config.admin_path
          },
          prefix: '/mellisuga',
          rights: true,
          super_disabled: cfg.disable_super
        }, this_class);
      }

      if (!cfg.disable_super) {
        pages_io.init_controls(admin.auth);
      }
/*      pages_io.pages.init_admin(admin.auth);
      pages_io.templates.init_admin(admin.auth);*/


      await router.listen(admin.auth);

      let aura = this_class.aura;
      if (cfg.smtp) {
        this_class.mailer = await Mailer.init(this_class, cfg.smtp);
      }

      let user_auth_cfg = {
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
          sumoketa: "boolean",
          imone: "varchar(256)",
          pareigos: "varchar(256)"
        },
        required_custom_columns: ['vardas', 'pavarde', 'tel_nr', 'planas'],
        unique_custom_columns: ['tel_nr'],
        autolock: true
      }

      if (cfg.smtp) {
        user_auth_cfg.smtp = cfg.smtp;
        user_auth_cfg.msg = cfg.smtp.msg;
        user_auth_cfg.reset_msg = cfg.smtp.reset_msg;

      }

      var auth = this_class.auth = await Auth.init(this_class.app, aura, user_auth_cfg);

      var posts = this_class.posts = await PostsIO.init(this_class);

      pages_io.serve_dirs('/', path.resolve(this_class.app_path, 'pages'), {
        auth: auth
      });

/*
      var builtin_pages = await BuiltinIO.init(
        path.resolve(this_class.pages_path, ".builtin"), [
        ], [
          this_class.pages_path
        ], this_class
      );

      builtin_pages.load();
*/
      let modules = this_class.modules = await Moduload.init(this_class);
      modules.init_controls();

      router.use(
        '/g',
        Router.static(this_class.globals_path)
      );
      return this_class;
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  }

  async load_config() {
    try {
      let config = undefined;
      if (fs.existsSync(this.config_path)) {
        config = JSON.parse(fs.readFileSync(this.config_path, 'utf8'));
      } else {
        config = {
          setup: true,
          admin_path: "/mellisuga"
        }
      }
      return config;
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  }

  async save_config() {
    try {
      fs.writeFileSync(this.config_path, JSON.stringify(this.config, null, 4), 'utf8');
    } catch (e) {
      console.error(e.stack);
    }
  }
}
