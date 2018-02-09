"use strict"

const fs = require('fs-extra');
const path = require('path');

const Manager = require("./manager.js");


module.exports = class extends Manager {
  constructor(app, posts, auth) {
    console.log("BUILDTIN");
    var pages_dir = global.cmb_config.pages_path;
    var template_dir = global.cmb_config.templates_path;

    if (!fs.existsSync(pages_dir)){
      fs.mkdirSync(pages_dir);
    }

    super(app, pages_dir+"/.builtin", {
      path_prefix: '/',
      command_path: global.cmb_config.admin_path+"/builtin.io",
      posts: posts,
      template_dir: template_dir,
      auth: auth
    });
  }

  add(full_path) {
    try {
      var filename = full_path.replace(/^.*[\\\/]/, '');
      var builtin_path = path.resolve(this.dir, filename);
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
/*
  all() {
    try {
      var builtin_dir = this.dir;

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
  */
}
