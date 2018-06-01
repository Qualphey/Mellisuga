const fs = require('fs-extra');
const path = require('path');

const Controls = require("./controls.js");

module.exports = class ModulesIO {
  constructor(modules_path) {
    this.dir = modules_path;
  }

  static async init(cmbird) {
    const modules_path = path.resolve(cmbird.app_path, 'cmbird_modules');

    if (!fs.existsSync(modules_path)){
      fs.mkdirSync(modules_path);
    }

    let this_class = new module.exports(modules_path);
    this_class.cmbird = cmbird;
/*
    const default_path = path.resolve(__dirname, 'default');

    var file_list = fs.readdirSync(default_path);
    file_list.forEach(file => {
      const file_path = path.resolve(default_path, file);
      var lstat = fs.lstatSync(file_path);
      if (lstat.isFile()) {
        // ----++++
      } else if (lstat.isDirectory()) {
        const dest_path = path.resolve(modules_path, file);
        if (!fs.existsSync(dest_path)){
          fs.copy(file_path, dest_path, function (err) {
            if (err) return console.error(err)

          });
        }
      }
    });
*/
    cmbird.modules = {};

    const priorities = [
      "posts"
    ];

    let all_modules = this_class.all();

    all_modules.forEach(module => {
      if (priorities.indexOf(module.name) > -1) {
        if (module.config) {
          cmbird.modules[module.name] = require(module.index).init(cmbird, module.config);
        } else {
          cmbird.modules[module.name] = require(module.index).init(cmbird, {});
        }
      }
    });

    all_modules.forEach(module => {
      if (!cmbird.modules[module.name]) {
        if (module.config) {
          cmbird.modules[module.name] = require(module.index).init(cmbird, module.config);
        } else {
          cmbird.modules[module.name] = require(module.index).init(cmbird, {});
        }
      }
    });
  }

  init_controls(auth) {
    this.controls = new Controls({
      command_path: this.cmbird.config.admin_path+"/pages.io",
      auth: auth
    }, this.cmbird);
  }

  all() {
    var list = [];
    var this_class = this;

    fs.readdirSync(this.dir).forEach(file => {
      var module_path = path.resolve(this_class.dir, file);
      var module_index_path = path.resolve(module_path, 'index.js');
      var module_config_path = path.resolve(module_path, 'config.json');
      var lstat = fs.lstatSync(module_path);
      if (lstat.isDirectory()) {
        if (fs.existsSync(module_index_path)){
          var module = {
            index: module_index_path,
            path: module_path,
            name: file
          };

          if (fs.existsSync(module_config_path)) {
            module.config = JSON.parse(fs.readFileSync(module_config_path, "utf8"));
          }

          list.push(module);
        }
      }
    });

    return list;
  }
}
