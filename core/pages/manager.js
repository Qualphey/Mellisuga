"use strict"

const fs = require('fs-extra');
const path = require('path');

const Page = require('./page.js');

function rmrf(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function(file, index){
      var curPath = dir_path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        rmrf(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir_path);
  }
};

var default_html = fs.readFileSync(__dirname+'/default_templates/index.html', 'utf8');
var default_json = fs.readFileSync(__dirname+'/default_templates/context.json', 'utf8');
var default_css = fs.readFileSync(__dirname+'/default_templates/theme.css', 'utf8');
var default_js = fs.readFileSync(__dirname+'/default_templates/main.js', 'utf8');

module.exports = class {
  constructor(dir, cfg, cmbird) {
    let app = this.app = cmbird.app;
    this.cmbird = cmbird;
    this.dir = dir;
    this.dirs = cfg.dirs;

    if (!fs.existsSync(this.dir)){
      fs.mkdirSync(this.dir);
    }

    this.auth = cfg.auth;


    this.path_prefix = cfg.path_prefix;
    while (this.path_prefix.slice(-1) === "/" && this.path_prefix.length > 1) {
      this.path_prefix = this.path_prefix.slice(0, -1);
    }

    this.command_path = cfg.command_path;
    this.template_dir = cfg.template_dir;
    this.blacklist = cfg.blacklist;
    this.posts = cfg.posts;

    this.hosted_pages = [];

    let this_class = this;

    this.config = {};
    const config_path = path.resolve(this.dir, ".config.json");
    if (fs.existsSync(config_path)) {
      this.config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    }

    /*
    if (this.config.permissions) {
      var user_only = this.config.permissions.user_only;
      this.local().forEach(function(page) {
        var custom_path = false;
        if (this_class.config.custom_paths) {
          this_class.config.custom_paths.forEach(function(cpath) {
            const cpath_name = Object.keys(cpath)[0];
            if (page.file == cpath_name) {
              custom_path = cpath[cpath_name];
            }

          });
        }
        var permisive = false;
        user_only.forEach(function(protected_page) {
          if (page.file === protected_page) {
            permisive = true;
          }
        });
        if (permisive) {
          let npage = new Page({
            dir_path: this_class.dir,
            prefix: this_class.path_prefix,
            name: page.file,
            custom_path: custom_path,
            custom_paths: this_class.config.custom_paths,
            auth_func: this_class.auth.orize
          }, cmbird, this_class);
          this_class.hosted_pages.push(npage);
        } else {
          let npage = new Page({
            dir_path: this_class.dir,
            prefix: this_class.path_prefix,
            name: page.file,
            custom_path: custom_path,
            user_auth: this_class.auth
          }, cmbird, this_class);
          this_class.hosted_pages.push(npage);
        }

      });
    } else {*/

//    }

  }

  init_admin(auth) {
    let this_class = this;
    let cmbird = this.cmbird;
    let err_response = function(res, text) {
      res.send(JSON.stringify({
        err: text
      }));
    }

    this.app.post(this.command_path, auth.orize, function(req, res) {
      var data = JSON.parse(req.body.data);
      /*
        {
          command: "add"|"rm",
          name: "string" - needed on `add` and `rm` commands
        }
      */
      switch (data.command) {
        case 'all':
          var list = this_class.all();
          res.send(JSON.stringify(list));
          break;
        case 'add':
          if (data.name) {
            if (data.name.length > 0) {
              data.path = path.resolve(this_class.dir, data.name);
              if (data.path.startsWith(this_class.dir)) {
                if (!fs.existsSync(data.path)){
                  var custom_path = false;
                  if (this_class.config.custom_paths) {
                    this_class.config.custom_paths.forEach(function(cpath) {
                      const cpath_name = Object.keys(cpath)[0];
                      if (data.name == cpath_name) {
                        custom_path = cpath[cpath_name];
                      }

                    });
                  }

                  let npage_cfg = {
                    dir_path: this_class.dir,
                    prefix: this_class.path_prefix,
                    name: encodeURIComponent(data.name),
                    custom_path: custom_path,
                    auth: this_class.auth
                  };

                  if (data.template && this_class.tamplate_dir) {
                    var src_path = path.resolve(this_class.tamplate_dir, data.template);
                    fs.copy(src_path, data.path, function (err) {
                      if (err) return console.error(err)
                      var npage = new Page(npage_cfg, cmbird, this_class);
                      this_class.hosted_pages.push(npage);
                      res.send(JSON.stringify({ msg: "success" }));
                    });
                  } else {
                    fs.mkdirSync(data.path);
                    fs.writeFileSync(path.resolve(data.path, "index.html"), default_html);
                    fs.writeFileSync(path.resolve(data.path, "context.json"), default_json);
                    fs.writeFileSync(path.resolve(data.path, "theme.css"), default_css);
                    fs.writeFileSync(path.resolve(data.path, "main.js"), default_js);
                    var npage = new Page(npage_cfg, cmbird, this_class);
                    this_class.hosted_pages.push(npage);
                    res.send(JSON.stringify({ msg: "success" }));
                  }
                } else {
                  err_response(res, "Page `"+data.name+"` already exists!");
                }
              }
            } else {
              err_response(res, "Page name not specified!");
            }
          } else {
            err_response(res, "Page name not specified!");
          }
          break;
        case 'rm':
          if (data.name) {
            if (data.name.length > 0) {
              data.path = path.resolve(this_class.dir, data.name);
              if (data.path.startsWith(this_class.dir)) {
                rmrf(data.path);
                res.send("success");
              }
            } else {
              err_response(res, "Page name not specified!");
            }
          } else {
            err_response(res, "Page name not specified!");
          }
          break;
        case 'webpack':
          if (data.name) {
            var page = this_class.select_by_name(data.name);
            page.watching = page.compiler.run((err, stats) => {
              if (err) console.error(err);
              // Print watch/build result here...
              res.send(true);
            });
          } else {
            res.send("page name not defined");
          }
          break;

        case 'webpack-watch':
          if (data.name) {
            let page = this_class.select_by_name(data.name);
            if (data.value && !page.watching) {
              page.watching = page.compiler.watch({
                aggregateTimeout: 300,
                poll: 1000
              }, (err, stats) => {
                if (err) console.error(err);
                cmbird.router.clients.forEach(client => {
                  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                  if (ip === client.address) {
                    if (stats.hasErrors()) {
                      client.socket.emit("webpack-err", stats.toString());
                    } else {
                      client.socket.emit("webpack-done", stats.toString());
                    }
                  }
                });
              });
              res.send(true);
            } else if (page.watching) {
              page.watching.close(() => {
                page.watching = false;
                res.send(false);
              });
            }
          } else {
            res.send("page name not defined");
          }
          break;
        default:
          console.error("PagesIO: unknown command", data.command);
      }
    });
  }

  load() {
    let this_class = this, cmbird = this.cmbird, app = this.cmbird.app;
    this.local().forEach(function(page) {
      var custom_path = false;

      if (this_class.config.custom_paths) {
        this_class.config.custom_paths.forEach(function(cpath) {
          const cpath_name = Object.keys(cpath)[0];
          if (page.file == cpath_name) {
            custom_path = cpath[cpath_name];
          }

        });
      }

      let npage = new Page({
        dir_path: this_class.dir,
        prefix: this_class.path_prefix,
        name: page.file,
        custom_path: custom_path,
        auth: cmbird.auth
      }, cmbird, this_class);
      this_class.hosted_pages.push(npage);
    });
  }

  select_by_name(name) {
    name = name;
    for (var p = 0; p < this.hosted_pages.length; p++) {
      if (this.hosted_pages[p].name === name) {
        return this.hosted_pages[p];
      }
    }
    return undefined;
  }

  all() {
    var list = [];
    var this_class = this;

    fs.readdirSync(this.dir).forEach(file => {
      var page = {};

      page.blacklisted = false;
      if (this_class.blacklist) {
        for (var b = 0; b < this_class.blacklist.length; b++) {
          if (file == this_class.blacklist[b]) {
            page.blacklisted = true;
          }
        }
      }
      if (!page.blacklisted) {
        var lstat = fs.lstatSync(path.resolve(this_class.dir, file));
        if (lstat.isDirectory()) {
          page.path = '/'+file;
          if (this_class.config.custom_paths) {
            this_class.config.custom_paths.forEach(function(cpath) {
              const cpath_name = Object.keys(cpath)[0];
              const custom_path = cpath[cpath_name];
              if (file === cpath_name) {
                page.path = custom_path;
              }
            });
          }

          page.file = file;
          page.name = decodeURIComponent(file);
          list.push(page);
        }
      }
    });

    list.sort(function(a, b) {
      return fs.statSync(path.resolve(this_class.dir, a.file)).birthtime.getTime() - fs.statSync(path.resolve(this_class.dir, b.file)).birthtime.getTime();
    });

    if (this.dirs) {
      let plus_list = [];
      for (var d = 0; d < this.dirs.length; d++) {
        fs.readdirSync(this.dirs[d]).forEach(file => {
          var page = {};

          page.blacklisted = false;
          if (this_class.blacklist) {
            for (var b = 0; b < this_class.blacklist.length; b++) {
              if (file == this_class.blacklist[b]) {
                page.blacklisted = true;
              }
            }
          }
          if (!page.blacklisted) {
            var lstat = fs.lstatSync(path.resolve(this_class.dirs[d], file));
            if (lstat.isDirectory()) {
              page.path = '/'+file;
              if (this_class.config.custom_paths) {
                this_class.config.custom_paths.forEach(function(cpath) {
                  const cpath_name = Object.keys(cpath)[0];
                  const custom_path = cpath[cpath_name];
                  if (file === cpath_name) {
                    page.path = custom_path;
                  }
                });
              }

              page.file = file;
              page.name = decodeURIComponent(file);
              plus_list.push(page);
            }
          }
        });

        plus_list.sort(function(a, b) {
          return fs.statSync(path.resolve(this_class.dirs[d], a.file)).birthtime.getTime() - fs.statSync(path.resolve(this_class.dirs[d], b.file)).birthtime.getTime();
        });

        list.push.apply(list, plus_list);
      }
    }

    return list;
  }

  local() {
    var list = [];
    var this_class = this;

    fs.readdirSync(this.dir).forEach(file => {
      var page = {};

      page.blacklisted = false;
      if (this_class.blacklist) {
        for (var b = 0; b < this_class.blacklist.length; b++) {
          if (file == this_class.blacklist[b]) {
            page.blacklisted = true;
          }
        }
      }
      if (!page.blacklisted) {
        var lstat = fs.lstatSync(path.resolve(this_class.dir, file));
        if (lstat.isDirectory()) {
          page.path = '/'+file;
          if (this_class.config.custom_paths) {
            this_class.config.custom_paths.forEach(function(cpath) {
              const cpath_name = Object.keys(cpath)[0];
              const custom_path = cpath[cpath_name];
              if (file === cpath_name) {
                page.path = custom_path;
              }
            });
          }

          page.file = file;
          page.name = decodeURIComponent(file);
          list.push(page);
        }
      }
    });

    list.sort(function(a, b) {
      return fs.statSync(path.resolve(this_class.dir, a.file)).birthtime.getTime() - fs.statSync(path.resolve(this_class.dir, b.file)).birthtime.getTime();
    });
    return list;
  }
}
