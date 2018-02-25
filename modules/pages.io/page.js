
const nunjucks = require('nunjucks');

const fs = require("fs");
const path = require('path');

const webpack = require('webpack');
const jsonlint = require("jsonlint");

module.exports = class {
  constructor(cfg, app, pages) {
    this.name = cfg.name;
    this.full_path = path.resolve(cfg.dir_path, cfg.name);
    this.http_path = cfg.custom_path || path.resolve(cfg.prefix, cfg.name);
    this.path_prefix = cfg.prefix;
    this.custom_paths = cfg.custom_paths;

    console.log("PAGE", cfg);

    this.nunjucks_env = new nunjucks.Environment(new nunjucks.FileSystemLoader([
      cfg.dir_path
    ], {
      autoescape: true,
    //      watch: true,
      noCache: true
    }));

    this.compiler = webpack({
        entry: {
          'main': path.resolve(this.full_path, 'src/index.js'),
        },
        output: {
          path: this.full_path,
          filename: '[name].js'
        },
        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: {
                        presets: ['es2015']
                    }
                },
                {
                  test: /\.json$/,
                  loader: 'json-loader'
                }
            ],
            rules: [
              {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
              },
              {
                test: /\.less$/,
                use: [{
                  loader: "style-loader"
                }, {
                  loader: "css-loader"
                }, {
                  loader: "less-loader" // compiles Less to CSS
                }]
              },
              {
                test: /\.(html)$/,
                use: {
                  loader: 'html-loader',
                  options: {
                    attrs: [':data-src']
                  }
                }
              },
              {
                test: /\.vs$/,
                use: 'raw-loader'
              },
              {
                test: /\.fs$/,
                use: 'raw-loader'
              }
            ]
        },
        stats: {
            colors: true
        },
        devtool: 'source-map'
    });

    this.auth_func = cfg.auth_func;
    console.log("SERVE", this.http_path);

    this.pages = pages;
    this.posts = pages.posts;


    if (cfg.custom_path) {
      console.log("SERVE PATH", path.resolve(cfg.prefix, cfg.name));
      app.get(path.resolve(cfg.prefix, cfg.name), function(req, res) {
        console.log("REDIRECT", cfg.custom_path);
        res.redirect(cfg.custom_path);
      });
    }

    var this_class = this;

    if (cfg.auth_func) {
      console.log("AUTH FUNC", this.auth_func);
      console.log("PATH", this.http_path);
      app.get(this.http_path, this.auth_func, async function(req, res) {
        try {
          const req_path = req.path;
          if (req_path.slice(-1) != "/") {
            res.redirect(req_path+"/");
          } else {
            var result = await this_class.render_page(this_class.full_path);
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
      serve_dir(this.http_path, this.full_path, this.auth_func);
    } else {
      app.get(this.http_path, async function(req, res) {
        try {
          const req_path = req.path;
          if (req_path.slice(-1) != "/") {
            res.redirect(req_path+"/");
          } else {
            var result = await this_class.render_page(this_class.full_path);
      //      console.log("RESULT", result);
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
      serve_dir(this.http_path, this.full_path);
    }

    function serve_dir(dir_path, dir_file_path, auth) {
      if (fs.existsSync(dir_file_path)) {
        if (fs.lstatSync(dir_file_path).isDirectory()) {
          fs.readdirSync(dir_file_path).forEach(function(file) {
            const sub_path = path.resolve(dir_path, file);
            const sub_file = path.resolve(dir_file_path, file);
            if (fs.lstatSync(sub_file).isDirectory()) {
              serve_dir(sub_path, sub_file, auth);
            } else {
              if (auth) {
                app.get(sub_path, auth, function(req, res) {
                  res.sendFile(sub_file);
                });
              } else {
                app.get(sub_path, function(req, res) {
                  res.sendFile(sub_file);
                });
              }
            }
          });
        }
      }
    }
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
        var page_list = this.pages.all();
        for (var p = 0; p < page_list.length; p++) {
          for (var n = 0; n < names.length; n++) {
            if (page_list[p].file == names[n]) {
              var path_prefix = this.path_prefix;
              while (path_prefix.slice(-1) === "/") {
                path_prefix = path_prefix.slice(0, -1);
              }
              var item = { name: names[n], path: path_prefix + "/" + names[n] };
              var custom_path = false;
              if (this.custom_paths) {
                this.custom_paths.forEach(function(cpath) {
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
              console.log("context", context);
            } catch(e) {
              result.err = e.message+"\n\nat "+page_dir_path+"/context.json";
              console.error(e);
            }
          }
          if (fs.existsSync(global_context_json)) {
            try {
              var global_context = jsonlint.parse(fs.readFileSync(global_context_json, 'utf8'));
              context = Object.assign(global_context, context);
            } catch(e) {
              result.err = e.message+"\n\nat global/context.json";
              console.error(e);
            }
          }

          console.log("COMPILE CONTEXT", context);
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
