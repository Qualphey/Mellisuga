"use strict"

const fs = require('fs-extra');
const path = require('path');

const Manager = require("./manager.js");

const page_blacklist = [
  ".builtin"
]

module.exports = class Pages extends Manager {
  constructor(cmbird) {
    var pages_dir = cmbird.pages_path;
    var template_dir = cmbird.templates_path;

    if (!fs.existsSync(pages_dir)){
      fs.mkdirSync(pages_dir);
      fs.mkdirSync(path.resolve(pages_dir, '.builtin'));
    }

    super(pages_dir, {
      path_prefix: '/',
      command_path: cmbird.config.admin_path+"/pages.io",
      posts: cmbird.posts,
      blacklist: page_blacklist,
      template_dir: template_dir,
      auth: cmbird.auth
    }, cmbird);
  }

  init_admin(auth) {
    super.init_admin(auth);
  }
}
