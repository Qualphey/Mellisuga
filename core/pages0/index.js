
const path = require("path");

const Page = require("./page.js");
const PageList = require("./page_list.js");
const Controls = require("./controls.js");

module.exports = class PagesIO {
  /**
   * creates a instance of MyClass.
   * @param {number} value - initial value.
   */
  constructor(cfg, cmbird) {
    this.router = cmbird.router;

    this.cmbird = cmbird;

    this.list = [];
    this.page_lists = [];


  }

  static async init(cfg, cmbird) {
    try {
      console.log("TESTING NEW PAGES IMPLEMENTATION..");



      return new module.exports(cfg, cmbird);
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }

  }

  init_controls(auth) {
    this.controls = new Controls({
      command_path: this.cmbird.config.admin_path+"/pages.io",
      auth: auth
    }, this.cmbird);
  }

  serve_dir(request_path, dir_full_path, cfg) {
    let page_cfg = {
      request_path: request_path,
      full_path: dir_full_path,
    }

    if (cfg) {
      page_cfg.auth = cfg.auth;
      page_cfg.globals_path = cfg.globals_path;
      page_cfg.name = cfg.name;
      page_cfg.dev_only = cfg.dev_only;
    }

    let new_page = new Page(page_cfg, this.cmbird);
    this.list.push(new_page);
  }

  serve_dirs(request_path_prefix, dir_full_path, cfg) {
    let page_list_cfg = {
      req_prefix: request_path_prefix,
      full_path: dir_full_path
    }

    if (cfg) {
      page_list_cfg.auth = cfg.auth;
      page_list_cfg.globals_path = cfg.globals_path;
      page_list_cfg.name = cfg.name;
      page_list_cfg.dev_only = cfg.dev_only;
    }

    let new_page_list = new PageList(page_list_cfg, this.cmbird);
    this.page_lists.push(new_page_list);
  }


//  - -                    - -
// - - - SELECTOR METHODS - - -
//  - -                    - -

  all() {
    let obj = {};

    for (let l = 0; l < this.page_lists.length; l++) {
      if (!this.page_lists[l].dev_only || this.page_lists[l].dev_only && this.cmbird.dev_mode) {
        obj[this.page_lists[l].name] = [];
        for (let p = 0; p < this.page_lists[l].list.length; p++) {
          obj[this.page_lists[l].name].push(this.page_lists[l].list[p].data());
        }
      }
    }

    obj.unlisted = [];
    for (let p = 0; p < this.list.length; p++) {
      if (!this.list[p].dev_only || this.list[p].dev_only && this.cmbird.dev_mode) {
        obj.unlisted.push(this.list[p].data());
      }
    }

    return obj;
  }
/*
  select(page_name) {
    for (let p = 0; p < this.list.length; p++) {
      let pdata = this.list[p].data();
      if (pdata.name === page_name) {
        return pdata;
      }
    }

    for (let l = 0; l < this.page_lists.length; l++) {
      if (!this.page_lists[l].dev_only || this.page_lists[l].dev_only && this.cmbird.dev_mode) {
        for (let p = 0; p < this.page_lists[l].list.length; p++) {
          let pdata = this.page_lists[l].list[p].data();
          if (pdata.name === page_name) {
            return pdata;
          }
        }
      }
    }

    return undefined;
  }
*/
  all_from_list(list_name) {
    for (let l = 0; l < this.page_lists.length; l++) {
      if (!this.page_lists[l].dev_only || this.page_lists[l].dev_only && this.cmbird.dev_mode) {
        if (this.page_lists[l].name === list_name) {
          return this.page_lists[l].all();
        }
      }
    }

    return undefined;
  }

  select_from_list(list_name, page_name) {
    for (let l = 0; l < this.page_lists.length; l++) {
      if (!this.page_lists[l].dev_only || this.page_lists[l].dev_only && this.cmbird.dev_mode) {
        if (this.page_lists[l].name === list_name) {
          return this.page_lists[l].select(page_name);
        }
      }
    }
    return undefined;
  }

  select_obj(list_name, page_name) {
    if (list_name === "unlisted") {
      for (let p = 0; p < this.list.length; p++) {
        if (!this.list[p].dev_only || this.list[p].dev_only && this.cmbird.dev_mode) {
          let pdata = this.list[p];
          if (pdata.name === page_name) {
            return pdata;
          }
        }
      }
    } else {
      for (let l = 0; l < this.page_lists.length; l++) {
        if (!this.page_lists[l].dev_only || this.page_lists[l].dev_only && this.cmbird.dev_mode) {
          if (this.page_lists[l].name === list_name) {
            for (let p = 0; p < this.page_lists[l].list.length; p++) {
              let pdata = this.page_lists[l].list[p];
              if (pdata.name === page_name) {
                return pdata;
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  select_list_obj(list_name) {
    for (let l = 0; l < this.page_lists.length; l++) {
      if (!this.page_lists[l].dev_only || this.page_lists[l].dev_only && this.cmbird.dev_mode) {
        if (this.page_lists[l].name === list_name) {
          return this.page_lists[l];
        }
      }
    }
    return undefined;
  }
}
