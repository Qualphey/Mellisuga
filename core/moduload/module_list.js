
const fs = require('fs-extra');
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
            name: file,
            parent_list: this_class
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

  async add(name, template) {
    try {
      const nmodul_path = path.resolve(this.full_path, name);
      if (!fs.existsSync(nmodul_path)) {
        const template_path = path.resolve(__dirname, "default_template")

        fs.copySync(template_path, nmodul_path)
        let nmod = await Module.init({
          name: name,
          full_path: nmodul_path,
          parent_list: this
        }, this.cms);
        this.list.push(nmod);
        console.log(nmod.data());
        return nmod.data();
      } else {
        return undefined;
      }
    } catch (err) {
      console.error(err)
      return undefined;
    }
  }

  remove(name) {
    for (let l = 0; l < this.list.length; l++) {
      if (this.list[l].name === name) {
        this.list[l].destroy();
        this.list.splice(l, 1);
        return { msg: "success" };
      }
    }
  }
}
