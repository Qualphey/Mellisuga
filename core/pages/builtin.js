"use strict"

const fs = require('fs-extra');
const path = require('path');

const Manager = require("./manager.js");


module.exports = class extends Manager {
  constructor(builtin_path, paths, other_paths, cmbird) {

    super(builtin_path, {
      path_prefix: '/',
      command_path: cmbird.pages_path+"/builtin.io",
      modules: cmbird.modules,
      template_dir: cmbird.templates_path,
      dirs: [
        cmbird.pages_path
      ]
    }, cmbird);
  }

  load() {
    super.load();
  }

  static async init(builtin_path, paths, other_paths, cmbird) {
    try {
      console.log(cmbird.pages_path);
      if (!fs.existsSync(cmbird.pages_path)){
        fs.mkdirSync(cmbird.pages_path); // TODO !!!!!!!!!!!!
      }

      if (!fs.existsSync(builtin_path)){
        fs.mkdirSync(builtin_path);
      }

      for (var p = 0; p < paths.length; p++) {
        await new Promise(function(resolve) {
          var filename = paths[p].replace(/^.*[\\\/]/, '');
          var new_file_path = path.resolve(builtin_path, filename);
          if (!fs.existsSync(new_file_path)) {
            fs.copy(paths[p], new_file_path, function (err) {
              if (err) {
                console.error(err)
              } else {
                console.log('Builtin page successfuly added');
              }
              resolve();
            });
          } else {
            resolve();
          }
        });
      }



      return new module.exports(builtin_path, paths, other_paths, cmbird);
    } catch (e) {
      console.error(e);
      return undefined;
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
