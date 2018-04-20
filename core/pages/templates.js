"use strict"

const fs = require('fs-extra');
const path = require('path');

const Manager = require("./manager.js");

module.exports = class Templates extends Manager {
  constructor(cmbird) {
    var pages_dir = cmbird.templates_path;

    if (!fs.existsSync(pages_dir)){
      fs.mkdirSync(pages_dir);
    }

    super(pages_dir, {
      path_prefix: '/t',
      command_path: cmbird.config.admin_path+"/templates.io",
      posts: cmbird.posts
    }, cmbird);
  }
}
