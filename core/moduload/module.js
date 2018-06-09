
const fs = require('fs-extra');

module.exports = class {
  constructor(cfg, cms) {
    this.name = cfg.name;
    this.full_path = cfg.full_path;
    this.config = cfg.config;
    this.parent_list =  cfg.parent_list
    this.cms = cms;
  }

  static async init(cfg, cms) {
    try {
      let this_class = new module.exports(cfg, cms);

      this_class.object = await (require(
        this_class.full_path
      ).init(cms, this_class.config));

      return this_class;
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
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

  async reload() {
    try {
      delete require.cache[require.resolve(this.full_path)];
      this.object = await (require(
        this.full_path
      ).init(this.cms, this.config));
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  }

  destroy() {
    this.destroyed = true;
    fs.removeSync(this.full_path);
  }
}
