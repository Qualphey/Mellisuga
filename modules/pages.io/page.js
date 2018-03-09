
const nunjucks = require('nunjucks');

const fs = require("fs");
const path = require('path');

const webpack = require('webpack');
const jsonlint = require("jsonlint");

module.exports = class {
  constructor(cfg, app, pages) {
    this.full_path = cfg.full_path || path.resolve(cfg.dir_path, cfg.name);
    this.http_path = cfg.custom_path || cfg.request_path || path.resolve(cfg.prefix, cfg.name);


    let index_path = this.index_path = path.resolve(this.full_path, "index.html");
    let context_path = this.context_path = path.resolve(this.full_path, "context.json");
    let global_context_path = this.global_context_path = path.resolve(global.cmb_config.globals_path, "context.json");
    this.update();

    if (!cfg.name) {
      cfg.name = cfg.full_path.split('/').pop();
      console.log("SET NAME", cfg.name);
    }

    this.path_prefix = cfg.prefix;

    if (!this.path_prefix) this.path_prefix = "";

    this.custom_paths = cfg.custom_paths;

    cfg.dir_path = cfg.dir_path || cfg.full_path;

    this.auth = cfg.auth;

    this.auth_func = cfg.auth_func;
    if (this.context) {
      if (this.context.required_rights) {
        this.auth_func = this.auth.orize_gen(this.context.required_rights);
      }
    }

    console.log("SERVE", this.http_path);

    this.pages = pages;
    this.posts = pages.posts;

    if (cfg.custom_path) {
      app.get("/"+cfg.name, function(req, res) {
        res.redirect(cfg.custom_path);
      });
    }

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
            rules: [
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
              },
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

    var this_class = this;



    console.log("PAGE PATH", this.http_path);
    if (this.auth_func) {
      console.log("AUTH FUNC", this.auth_func);
      console.log("PATH", this.http_path);
      app.get(this.http_path, this.auth_func, async function(req, res) {
        try {
          this_class.update();
          this_class.context = await this_class.compile_context(this_class.context);

          if (this_class.context.accept_arguments) {
            this_class.context.args = req.query;
          }

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
          this_class.update();
          this_class.context = await this_class.compile_context(this_class.context);

          if (this_class.context.accept_arguments) {
            console.log("ACCEPT ARGUMENTS");
            this_class.context.args = req.query;
          }

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

  async render_page(page_dir_path) {
    try {

      var result = {};

      if (this.index_html) {
        if (this.context) {
          var rendered_html = this.nunjucks_env.render(this.index_path, this.context);
          result.html = rendered_html;
        } else {
          result.html = fs.readFileSync(this.index_path, "UTF-8");
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

  update() {
    if (fs.existsSync(this.index_path)) {
      try {
        this.index_html = fs.readFileSync(this.index_path, 'utf8');
      } catch (e) {
        console.error(e);
      }
    }
    this.context = false;
    if (fs.existsSync(this.context_path)) {
      try {
        this.context = JSON.parse(fs.readFileSync(this.context_path, 'utf8'));
      } catch (e) {
        this.context = {};
        console.error(e);
      }
    } else {
      this.context = {};
    }

    if (fs.existsSync(this.global_context_path)) {
      try {
         var global_context = JSON.parse(fs.readFileSync(this.global_context_path, 'utf8'));
        this.context = Object.assign(this.context, global_context);
      } catch (e) {
        console.error(e);
      }
    }
  }

  async compile_context(context) {
    try {
      if (context.posts && this.posts) {
        var tags = context.posts.split(" ");
        var result = await this.posts.select_by_tags(tags);

        context.posts = result;
      }

      if (context.menu) {
        var names = context.menu;
        context.menu = [];
        var page_list = this.pages.all();

        for (var n = 0; n < names.length; n++) {
          for (var p = 0; p < page_list.length; p++) {
            var url_encoded_name = encodeURIComponent(names[n]);
            if (page_list[p].file == url_encoded_name) {
              var path_prefix = this.path_prefix;
              while (path_prefix.slice(-1) === "/") {
                path_prefix = path_prefix.slice(0, -1);
              }
              var item = { name: names[n], path: path_prefix + "/" + url_encoded_name };
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
}
