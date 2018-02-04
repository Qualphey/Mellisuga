"use strict"

const fs = require('fs-extra');
const path = require('path');

const Manager = require("./manager.js");


module.exports = class extends Manager {
  constructor(app, posts, auth) {
    console.log("BUILDTIN");
    var pages_dir = path.resolve(global.cmb_config.pages_path, '.builtin');
    var template_dir = global.cmb_config.templates_path;

    if (!fs.existsSync(pages_dir)){
      fs.mkdirSync(pages_dir);
    }

    super(app, pages_dir, {
      path_prefix: '/',
      command_path: global.cmb_config.admin_path+"/builtin.io",
      posts: posts,
      template_dir: template_dir,
      auth: auth
    });
  }
}
