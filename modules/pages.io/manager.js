"use strict"

const nunjucks = require('nunjucks');
const jsonlint = require("jsonlint");

const fs = require('fs-extra');
const path = require('path');

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
  constructor(app, dir, cfg) {
    console.log("PAGE MANAGER");
    this.app = app;
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

    this.nunjucks_env = new nunjucks.Environment(new nunjucks.FileSystemLoader([
      this.dir
    ], {
      autoescape: true,
//      watch: true,
      noCache: true
    }));

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
          serve_page({
            prefix: this_class.path_prefix,
            name: page.file,
            custom_path: custom_path,
            auth_func: function(req, res, next) {
              console.log("NEEDED AUTH");
              next();
            }
          });
        } else {
          serve_page({
            prefix: this_class.path_prefix,
            name: page.file,
            custom_path: custom_path
          });
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
        serve_page({
          prefix: this_class.path_prefix,
          name: page.file,
          custom_path: custom_path
        });
      });
    }




    function serve_page(cfg) {
      const page_dir = path.resolve(this_class.dir, cfg.name);
      const page_path = cfg.custom_path || path.resolve(cfg.prefix, cfg.name);
        console.log("SERVE", page_path);
      if (cfg.custom_path) {
        console.log("SERVE PATH", path.resolve(cfg.prefix, cfg.name));
        app.get(path.resolve(cfg.prefix, cfg.name), function(req, res) {
          console.log("REDIRECT", cfg.custom_path);
          res.redirect(cfg.custom_path);
        });
      }

      if (cfg.auth_func) {
        console.log("AUTH FUNC", this_class.auth.orize);
        console.log("PATH", page_path);
        app.get(page_path, this_class.auth.orize, async function(req, res) {
          try {
            const req_path = req.path;
            if (req_path.slice(-1) != "/") {
              res.redirect(req_path+"/");
            } else {
              var result = await this_class.render_page(page_dir);
              if (result.err) {
                console.error(result.err);
              } else {
                res.send(result.html);
              }
            }
          } catch (e) {
            console.error(e.stack)
          }
        });
      } else {
        app.get(page_path, async function(req, res) {
          try {
            const req_path = req.path;
            if (req_path.slice(-1) != "/") {
              res.redirect(req_path+"/");
            } else {
              var result = await this_class.render_page(page_dir);
              console.log("RESULT", result);
              if (result.err) {
                console.error(result.err);
              } else {
                res.send(result.html);
              }
            }
          } catch (e) {
            console.error(e.stack)
          }
        });
      }

      function serve_dir(dir_path, dir_file_path) {
        if (fs.existsSync(dir_file_path)) {
          if (fs.lstatSync(dir_file_path).isDirectory()) {
            fs.readdirSync(dir_file_path).forEach(function(file) {
              const sub_path = path.resolve(dir_path, file);
              const sub_file = path.resolve(dir_file_path, file);
              if (fs.lstatSync(sub_file).isDirectory()) {
                serve_dir(sub_path, sub_file);
              } else {
                app.get(sub_path, function(req, res) {
                  res.sendFile(sub_file);
                });
              }
            });
          }
        }
      }
      serve_dir(page_path, page_dir);
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
        default:
          console.log("PagesIO: unknown command", data.command);
      }
    });
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

  async compile_context(context) {
    try {
      if (context.posts) {
        var tags = context.posts.split(" ");
        var result = await this.posts.select_by_tags(tags);

        context.posts = result;
      }
      if (context.menu) {
        var names = context.menu.split(" ");
        context.menu = [];
        var page_list = this.all();
        for (var p = 0; p < page_list.length; p++) {
          for (var n = 0; n < names.length; n++) {
            if (page_list[p].file == names[n]) {
              var path_prefix = this.path_prefix;
              while (path_prefix.slice(-1) === "/") {
                path_prefix = path_prefix.slice(0, -1);
              }
              var item = { name: names[n], path: path_prefix + "/" + names[n] };
              var custom_path = false;
              if (this.config.custom_paths) {
                this.config.custom_paths.forEach(function(cpath) {
                  const cpath_name = Object.keys(cpath)[0];
                  if (item.name == cpath_name) {
                    item.path = cpath[cpath_name];
                  }

                });
              }
              context.menu.push(item);
            }
          }
        }
      }
      return context;
    } catch (e) {
      console.error(e.stack)
    }
  }

  async render_page(page_dir_path) {
    try {

      console.log("RENDER", page_dir_path);
      var index_html = path.resolve(page_dir_path, "index.html");
      var context_json = path.resolve(page_dir_path, "context.json");
      var global_context_json = path.resolve(global.cmb_config.globals_path, "context.json");

      var result = {};

      if (fs.existsSync(index_html)) {
        if (fs.existsSync(context_json) || fs.existsSync(global_context_json)) {
          var context, err = false;
          if (fs.existsSync(context_json)) {
            try {
              context = jsonlint.parse(fs.readFileSync(context_json, 'utf8'));
            } catch(e) {
              result.err = e.message+"\n\nat "+page_dir_path+"/context.json";
            }
          }
          if (fs.existsSync(global_context_json)) {
            try {
              var global_context = jsonlint.parse(fs.readFileSync(global_context_json, 'utf8'));
              context = Object.assign(global_context, context);
            } catch(e) {
              result.err = e.message+"\n\nat global/context.json";
            }
          }

          context = await this.compile_context(context);
          var rendered_html = this.nunjucks_env.render(index_html, context);

          result.html = rendered_html;
        } else {
          result.html = fs.readFileSync(index_html, "UTF-8");
        }
      } else {
        result.err = "No HTML!";
      }

      if (result.err) {
        var style = "font-family: monospace;";
        result.err = "<div style='"+style+"'>"+result.err.replace(/(?:\r\n|\r|\n)/g, '<br />')+"</div>"
      }

      return result;
    } catch (e) {
      console.error(e.stack)
    }
  }
}
