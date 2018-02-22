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
  constructor(router, dir, cfg) {
    console.log("PAGE MANAGER");
    let app = this.app = router.app;
    this.dir = dir;
    if (!fs.existsSync(this.dir)){
      fs.mkdirSync(this.dir);
    }


        console.log(dir);

    this.auth = cfg.auth;


    this.path_prefix = cfg.path_prefix;
    console.log("PATH PREFIX", this.path_prefix);
    while (this.path_prefix.slice(-1) === "/" && this.path_prefix.length > 1) {
      this.path_prefix = this.path_prefix.slice(0, -1);
    }

    this.command_path = cfg.command_path;
    this.template_dir = cfg.template_dir;
    this.blacklist = cfg.blacklist;
    this.posts = cfg.posts;

    this.hosted_pages = [];

    var this_class = this;

    this.config = {};
    const config_path = path.resolve(this.dir, ".config.json");
    if (fs.existsSync(config_path)) {
      this.config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
    }

      console.log("permisive", this.config.permissions);
    if (this.config.permissions) {
      var user_only = this.config.permissions.user_only;
      this.all().forEach(function(page) {
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
        console.log("PAGE", page);
        if (permisive) {
          let npage = new Page({
            dir_path: this_class.dir,
            prefix: this_class.path_prefix,
            name: page.file,
            custom_path: custom_path,
            auth_func: this_class.auth.orize
          }, app, this_class);
          this_class.hosted_pages.push(npage);
        } else {
          let npage = new Page({
            dir_path: this_class.dir,
            prefix: this_class.path_prefix,
            name: page.file,
            custom_path: custom_path
          }, app, this_class);
          this_class.hosted_pages.push(npage);
        }

      });
    } else {
      this.all().forEach(function(page) {
        var custom_path = false;

        if (this_class.config.custom_paths) {
          this_class.config.custom_paths.forEach(function(cpath) {
            const cpath_name = Object.keys(cpath)[0];
            if (page.file == cpath_name) {
              custom_path = cpath[cpath_name];
            }

          });
        }

        console.log("PAGE", page);
        let npage = new Page({
          dir_path: this_class.dir,
          prefix: this_class.path_prefix,
          name: page.file,
          custom_path: custom_path
        }, app, this_class);
        this_class.hosted_pages.push(npage);
      });
    }

    app.get(cfg.command_path, function(req, res) {
      var data = JSON.parse(req.query.data);
      /*
        {
          command: "all"
        }
      */
      switch (data.command) {
        case 'all':
          var list = this_class.all();
          res.send(JSON.stringify(list));
          break;
        default:
          console.log("PagesIO: unknown command", data.command);
      }
    });

    var err_response = function(res, text) {
      res.send(JSON.stringify({
        err: text
      }));
    }

    app.post(cfg.command_path, function(req, res) {
      var data = JSON.parse(req.body.data);
      /*
        {
          command: "add"|"rm",
          name: "string" - needed on `add` and `rm` commands
        }
      */
      switch (data.command) {
        case 'add':
          if (data.name) {
            if (data.name.length > 0) {
              data.path = path.resolve(this_class.dir, data.name);
              if (data.path.startsWith(this_class.dir)) {
                if (!fs.existsSync(data.path)){
                  if (data.template && this_class.tamplate_dir) {
                    var src_path = path.resolve(this_class.tamplate_dir, data.template);
                    fs.copy(src_path, data.path, function (err) {
                      if (err) return console.error(err)
                      res.send(JSON.stringify({ msg: "success" }));
                    });
                  } else {
                    fs.mkdirSync(data.path);
                    fs.writeFileSync(path.resolve(data.path, "index.html"), default_html);
                    fs.writeFileSync(path.resolve(data.path, "context.json"), default_json);
                    fs.writeFileSync(path.resolve(data.path, "theme.css"), default_css);
                    fs.writeFileSync(path.resolve(data.path, "main.js"), default_js);
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
            page.watching = page.compiler.run( (err, stats) => {
              if (err) console.error(err);
              // Print watch/build result here...
              console.log(stats);
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
                router.clients.forEach(client => {
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
                console.log("Watching Ended.");
                page.watching = false;
                res.send(false);
              });
            }
          } else {
            res.send("page name not defined");
          }
          break;
        default:
          console.log("PagesIO: unknown command", data.command);
      }
    });
  }

  select_by_name(name) {
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
            page.path = path.resolve(this_class.path_prefix, file);
            this_class.config.custom_paths.forEach(function(cpath) {
              const cpath_name = Object.keys(cpath)[0];
              const custom_path = cpath[cpath_name];
              if (file === cpath_name) {
                page.path = custom_path;
              }
            });
          }

          page.file = file;
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
