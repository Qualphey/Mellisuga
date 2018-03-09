
const Templates = require("./templates.js");
const Pages = require("./pages.js");
const Page = require("./page.js");

module.exports = class {
  constructor(router, posts, auth, admin_auth) {
    this.router = router;
    this.auth = auth;
    this.admin_auth = admin_auth;

    this.templates = new Templates(router, posts);
    this.pages = new Pages(router, posts, auth);

  }

  static async init(router, posts, auth, admin_auth) {

    return new module.exports(router, posts, auth, admin_auth);
  }

  serve_dir(dir_full_path, request_path, admin) {
    var auth = this.auth;
    if (admin) {
      auth = this.admin_auth;
    }
    var npage = new Page({
      full_path: dir_full_path,
      request_path: request_path,
      auth: auth
    }, this.router.app, this.pages);
  }
}
