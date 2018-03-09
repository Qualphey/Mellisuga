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
const ModuleManagerIO = require("./modules/module_manager.io/index.js");

const Aura = require('pg-aura');

module.exports = class {
  constructor(cfg) {
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
    global.cmb_config = config;

    config.app_path = cfg.app_path;
    config.pages_path = path.resolve(cfg.app_path, 'pages');
    config.templates_path = path.resolve(cfg.app_path, 'templates');
    config.globals_path = path.resolve(cfg.app_path, 'globals');
    config.host = cfg.host;
    config.port = cfg.port;
    config.db_super_user = cfg.db_user;
    config.db_super_pwd = cfg.db_pwd;

    var this_class = this;

    this.nunjucks_env = new nunjucks.Environment(new nunjucks.FileSystemLoader([
      config.pages_path,
      config.templates_path
    ], {
      autoescape: true,
//      watch: true,
      noCache: true
    }));

    if (!fs.existsSync(config.globals_path)){
      fs.mkdirSync(config.globals_path);
    }

    (async () => {
      let cmbird = {};
      const router = cmbird.router = await Router.init();



      router.use(function(req, res, next) {
//        console.log("REQUEST", req.path);

        if (!req.path.startsWith("/setup") && !req.path.startsWith("/initialise") && config.setup) {
          res.redirect("/setup");
        } else {
          next();
        }
      });

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


      if (!config.setup) {
        initialise(config.db_name);
      }

      async function initialise(db_name) {
        try {

          var aura = cmbird.aura = await Aura.connect({
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

          var auth = cmbird.auth = await Auth.init(router.app, aura, {
            table_name: "user_accounts",
            auth_paths: {
              unauthorized: "/signin",
              authenticated: "/Paskyra"
            },
            prefix: '/users'
          });

          var pages_io = cmbird.pages = await PagesIO.init(router, posts, auth, admin);

          function authorize(req, res, next) {
            admin.authorize(req, res, next);
          }

          router.use(
            config.admin_path,
            authorize,
            Router.static(__dirname+"/dist")
          );

          router.use(
            '/g',
            Router.static(config.globals_path)
          );

          const res_dir_path = path.resolve(__dirname, 'dist/res');
          router.use('/cmbird-res', Router.static(res_dir_path));

          async function handle_dynamic_page(target_path, resource_path, res) {
            try {
              if (fs.lstatSync(target_path+"/"+resource_path).isDirectory()) {
                if (resource_path.slice(-1) != "/") {
                  res.redirect(resource_path+"/");
                } else {
                  var index_html = target_path+"/"+resource_path+"/index.html";
                  var context_json = target_path+"/"+resource_path+"/context.json";
                  var global_context_json = config.globals_path+"/context.json";
                  if (fs.existsSync(index_html)) {
                    if (fs.existsSync(context_json) || fs.existsSync(global_context_json)) {
                      var context, err = false;
                      if (fs.existsSync(context_json)) {
                        try {
                          context = jsonlint.parse(fs.readFileSync(context_json, 'utf8'));
                        } catch(e) {
                          var tp_split = target_path.split('/')
                          var prefix_path = tp_split[tp_split.length-1];
                          err = e.message+"\n\nat ./"+prefix_path+"/"+resource_path+"context.json";
                        }
                      }
                      if (fs.existsSync(global_context_json)) {
                        try {
                          var global_context = jsonlint.parse(fs.readFileSync(global_context_json, 'utf8'));
                          context = Object.assign(global_context, context);
                        } catch(e) {
                          var tp_split = config.globals_path.split('/')
                          var prefix_path = tp_split[tp_split.length-1];
                          err = e.message+"\n\nat /"+prefix_path+"/context.json";
                        }
                      }
                      context = await pages.compile_context(context);
                      var rendered_html = this_class.nunjucks_env.render(index_html, context);
                      if (err) {
                        var style = "font-family: monospace;";
                        var err = "<div style='"+style+"'>"+err.replace(/(?:\r\n|\r|\n)/g, '<br />')+"</div>";
                        res.send(err);
                      } else {
                        res.send(rendered_html);
                      }
                    } else {
                      res.send(index_html);
                    }
                  }
                }
              } else if (resource_path.endsWith('.html')) {
                var index_html = target_path+"/"+resource_path;
                var html_dir_path = index_html.substring(0, index_html.length-10);
                var context_json = html_dir_path+"context.json";
                var global_context_json = config.globals_path+"/context.json";

                if (fs.existsSync(index_html)) {
                  if (fs.existsSync(context_json) || fs.existsSync(global_context_json)) {
                    var context, err = false;
                    if (fs.existsSync(context_json)) {
                      try {
                        context = jsonlint.parse(fs.readFileSync(context_json, 'utf8'));
                      } catch(e) {
                        var tp_split = target_path.split('/')
                        var prefix_path = tp_split[tp_split.length-1];
                        err = e.message+"\n\nat ./"+prefix_path+"/"+resource_path+"context.json";
                      }
                    }
                    if (fs.existsSync(global_context_json)) {
                      try {
                        var global_context = jsonlint.parse(fs.readFileSync(global_context_json, 'utf8'));
                        context = Object.assign(global_context, context);
                      } catch(e) {
                        var tp_split = config.globals_path.split('/')
                        var prefix_path = tp_split[tp_split.length-1];
                        err = e.message+"\n\nat /"+prefix_path+"/context.json";
                      }
                    }
                    context = await pages.compile_context(context);
                    var rendered_html = this_class.nunjucks_env.render(index_html, context);
                    if (err) {
                      var style = "font-family: monospace;";
                      var err = "<div style='"+style+"'>"+err.replace(/(?:\r\n|\r|\n)/g, '<br />')+"</div>";
                      res.send(err);
                    } else {
                      res.send(rendered_html);
                    }
                  } else {
                    res.send(index_html);
                  }
                }
              } else {
                res.sendFile(target_path+'/'+resource_path);
              }
            } catch (e) {
              console.error(e.stack)
            }
          }
          /*
          router.get("/p/*", async function(req, res) {
            try {
              var resource_path = req.path.substring(3);

              handle_dynamic_page(config.pages_path, resource_path, res)
            } catch (e) {
              console.error(e.stack)
            }
          });
          */
          router.get(config.admin_path+"/t/*", async function(req, res) {
            try {
              var resource_path = req.path.substring(
                (config.admin_path+"/t/").length
              );

              handle_dynamic_page(config.templates_path, resource_path, res);
            } catch (e) {
              console.error(e.stack)
            }
          });

          var fmio_templates = new FMIO({
            router: router,
            targets: {
              templates: config.templates_path,
              pages: config.pages_path,
              globals: config.globals_path
            }
          });

          var modules_path = path.resolve(config.app_path, 'cmbird_modules');
          var module_manager_io = await ModuleManagerIO.init(modules_path, cmbird);

          var admin_accounts_io = await AdminAccountsIO.init(router.app, admin.table);
          var user_accounts_io = await UserAccountsIO.init(router.app, auth.table);

          var gallery_path = path.resolve(config.app_path, 'gallery');
          var gallery_io = await GalleryIO.init(gallery_path, config.admin_path, router.app);



          return admin;
        } catch (e) {
          console.error(e);
          return undefined;
        }
      };

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

    })().catch(e => console.error(e.stack));
  }
}
