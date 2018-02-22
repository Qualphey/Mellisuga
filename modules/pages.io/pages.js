"use strict"

const fs = require('fs-extra');
const path = require('path');

const Manager = require("./manager.js");

const page_blacklist = [
  ".builtin"
]

module.exports = class extends Manager {
  constructor(router, posts, auth) {
    var pages_dir = global.cmb_config.pages_path;
    var template_dir = global.cmb_config.templates_path;

    if (!fs.existsSync(pages_dir)){
      fs.mkdirSync(pages_dir);
      fs.mkdirSync(path.resolve(pages_dir, '.builtin'));
    }

    super(router, pages_dir, {
      path_prefix: '/',
      command_path: global.cmb_config.admin_path+"/pages.io",
      posts: posts,
      blacklist: page_blacklist,
      template_dir: template_dir,
      auth: auth
    });
  }
}
