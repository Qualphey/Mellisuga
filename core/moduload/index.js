const fs = require('fs-extra');
const path = require('path');

const Controls = require('./controls.js');
const ModuleList = require('./module_list.js');

module.exports = class ModulesIO {
  constructor(modules_path, cms) {
    this.dir = modules_path;
    this.cms = cms;

    this.module_lists = [];
  }

  static async init(cms) {
    const modules_path = path.resolve(cms.app_path, 'cms_modules');

    if (!fs.existsSync(modules_path)){
      fs.mkdirSync(modules_path);
    }

    let this_class = new module.exports(modules_path, cms);

    this_class.load_in_dir(modules_path);



    return this_class;
  }

  init_controls() {
    this.controls = new Controls({
      command_path: '/mellisuga/modules.io',
      auth: this.cms.admin.auth
    }, this.cms);
  }

  async load_in_dir(full_path) {
    let module_list = await ModuleList.init(full_path, this.cms);
    this.module_lists.push(module_list);
    return module_list;
  };

  all() {
    let obj = {};

    for (let l = 0; l < this.module_lists.length; l++) {
      let module_list = this.module_lists[l];
      obj[module_list.name] = [];
      for (let m = 0; m < module_list.list.length; m++) {
        obj[module_list.name].push(module_list.list[m].data());
      }
    }
/*
    obj.unlisted = [];
    for (let p = 0; p < this.list.length; p++) {
      if (!this.list[p].dev_only || this.list[p].dev_only && this.cmbird.dev_mode) {
        obj.unlisted.push(this.list[p].data());
      }
    }
*/

    return obj;
  }

  select_list_obj(list_name) {
    for (let l = 0; l < this.module_lists.length; l++) {
      if (!this.module_lists[l].dev_only || this.module_lists[l].dev_only && this.cms.dev_mode) {
        if (this.module_lists[l].name === list_name) {
          return this.module_lists[l];
        }
      }
    }
    return undefined;
  }
}
