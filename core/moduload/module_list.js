
const fs = require('fs');
const path = require('path');

const Module = require('./module.js');

module.exports = class {
  constructor(full_path, cms) {
    this.list = [];
    this.full_path = full_path;
    this.cms = cms;
    this.name = this.full_path.substr(this.full_path.lastIndexOf('/') + 1);
  }

  static async init(full_path, cms) {
    try {
      let this_class = new module.exports(full_path, cms);
      let all_modules = this_class.load();

      for (let m = 0; m < all_modules.length; m++) {
        let modl = await Module.init(all_modules[m], cms);
        this_class.list.push(modl);
      }

      return this_class;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  load() {
    var list = [];
    var this_class = this;

    fs.readdirSync(this.full_path).forEach(file => {
      var module_path = path.resolve(this_class.full_path, file);
      var module_index_path = path.resolve(module_path, 'index.js');
      var module_config_path = path.resolve(module_path, 'config.json');
      var lstat = fs.lstatSync(module_path);
      if (lstat.isDirectory()) {
        if (fs.existsSync(module_index_path)){
          var module = {
            index: module_index_path,
            full_path: module_path,
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
