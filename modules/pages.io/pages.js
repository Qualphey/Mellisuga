"use strict"

const fs = require('fs-extra');
const path = require('path');

const Manager = require("./manager.js");

const page_blacklist = [
  ".builtin"
]

module.exports = class extends Manager {
  constructor(app, posts, auth) {
    var pages_dir = global.cmb_config.pages_path;
    var template_dir = global.cmb_config.templates_path;

    if (!fs.existsSync(pages_dir)){
      fs.mkdirSync(pages_dir);
      fs.mkdirSync(path.resolve(pages_dir, '.builtin'));
    }

    super(app, pages_dir, {
      path_prefix: '/',
      command_path: global.cmb_config.admin_path+"/pages.io",
      posts: posts,
      blacklist: page_blacklist,
      template_dir: template_dir,
      auth: auth
    });

    var this_class = this;

    app.get("/bp/*", async function(req, res) {
      try {
        console.log(req.path);
        var resource_path = path.resolve(
          this_class.dir,
          '.builtin',
          req.path.substring("/bp/".length)
        );

        if (fs.lstatSync(resource_path).isDirectory()) {
          if (req.path.slice(-1) != "/") {
            res.redirect(req.path+"/");
          } else {
            var result = await this_class.render_page(resource_path);
            if (result.err) {
              res.send(result.err);
            } else {
              res.send(result.html);
            }
          }
        } else if (resource_path.endsWith('.html')) {
          var dir_path = resource_path.substring(
            0, resource_path.lastIndexOf("/")
          );
          var result = this_class.render_page(dir_path);
          if (result.err) {
            res.send(result.err);
          } else {
            res.send(result.html);
          }
        } else {
          res.sendFile(resource_path);
        }
      } catch (e) {
        console.error(e.stack)
      }
    });
  }

  add_builtin(full_path) {
    try {
      var filename = full_path.replace(/^.*[\\\/]/, '');
      var builtin_path = path.resolve(this.dir, '.builtin', filename);
      if (!fs.existsSync(builtin_path)) {
        fs.copy(full_path, builtin_path, function (err) {
          if (err) return console.error(err)
          console.log('Builtin page successfuly added');
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  all_builtin() {
    try {
      var builtin_dir = path.resolve(this.dir, '.builtin');

      var list = [];
      var this_class = this;
      fs.readdirSync(builtin_dir).forEach(file => {
        var lstat = fs.lstatSync(path.resolve(builtin_dir, file));
        if (lstat.isDirectory()) {
          list.push(file);
        }
      });

      list.sort(function(a, b) {
        return fs.statSync(path.resolve(
          builtin_dir, a
        )).birthtime.getTime() - fs.statSync(path.resolve(
          builtin_dir, b
        )).birthtime.getTime();
      });

      return list;
    } catch (e) {
      console.error(e);
    }
  }
}
