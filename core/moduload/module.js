
const fs = require('fs-extra');

module.exports = class {
  constructor(cfg, cms) {
    this.name = cfg.name;
    this.full_path = cfg.full_path;
    this.config = cfg.config;
    this.parent_list =  cfg.parent_list
  }

  static async init(cfg, cms) {
    let this_class = new module.exports(cfg, cms);

    this_class.object = require(
      this_class.full_path
    ).init(cms, this_class.config);

    return this_class;
  }

  data() {
    let parent_list = "unlisted";

    if (this.parent_list) {
      parent_list = this.parent_list.name;
    }


    return {
      name: this.name,
      full_path: this.full_path,
      config: this.config,
      parent_list: parent_list
    }
  }

  destroy() {
    this.destroyed = true;
    fs.removeSync(this.full_path);
  }
}
