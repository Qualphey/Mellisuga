

module.exports = class {
  constructor(cfg, cms) {
    this.name = cfg.name;
    this.full_path = cfg.full_path;
    this.config = cfg.config;
  }

  static async init(cfg, cms) {
    let this_class = new module.exports(cfg, cms);

    this_class.object = require(
      this_class.full_path
    ).init(cms, this_class.config);

    return this_class;
  }

  data() {
    return {
      name: this.name,
      full_path: this.full_path,
      config: this.config
    };
  }
}
