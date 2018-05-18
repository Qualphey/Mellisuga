
const path = require("path");

const Templates = require("./templates.js");
const Pages = require("./pages.js");
const Page = require("./page.js");
/**
 * this is MyClass.
 */

module.exports = class PagesIO {
  /**
   * creates a instance of MyClass.
   * @param {number} value - initial value.
   */
  constructor(cfg, cmbird) {
    this.router = cmbird.router;

    this.cmbird = cmbird;

    this.pages = new Pages(cmbird, this.path);
    this.templates = new Templates(cmbird);

  }

  load() {
    this.pages.load();
    this.templates.load();
  }

  static async init(cfg, cmbird) {
    try {

      console.log("PAGES");
      return new module.exports(cfg, cmbird);
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }

  }

  serve_dir(request_path, dir_full_path, auth) {
    var npage = new Page({
      full_path: dir_full_path,
      request_path: request_path,
      auth: auth
    }, this.cmbird, this.pages);
  }

  server_dirs(request_path_prefix, dir_full_path, auth) {
    
  }
}
