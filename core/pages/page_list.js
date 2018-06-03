"use strict"

const fs = require('fs-extra');
const path = require('path');
const express = require('express')

const Page = require('./page.js');

const page_blacklist = [
  ".builtin"
]

var default_html = fs.readFileSync(__dirname+'/default_templates/index.html', 'utf8');
var default_json = fs.readFileSync(__dirname+'/default_templates/context.json', 'utf8');
var default_css = fs.readFileSync(__dirname+'/default_templates/theme.css', 'utf8');
var default_js = fs.readFileSync(__dirname+'/default_templates/main.js', 'utf8');

module.exports = class PageList {
  constructor(cfg, cms) {
    this.cms = cms;

    this.blacklist = page_blacklist

    this.req_prefix = cfg.req_prefix;
    while (!this.req_prefix.endsWith("/")) {
      this.req_prefix += "/";
    }
    this.full_path = cfg.full_path;
    while (this.full_path.endsWith("/") && this.full_path.length > 1) {
      this.full_path = this.full_path.slice(0, -1);
    }

    if (cfg.name) {
      this.name = cfg.name;
    } else {
      this.name = this.full_path.substr(this.full_path.lastIndexOf('/') + 1);
    }

    this.dev_only = cfg.dev_only;

    this.auth = cfg.auth;

    if (!fs.existsSync(this.full_path)){
      fs.mkdirSync(this.full_path);
    }

    this.list = [];

    let this_class = this;
    let app = this.app = cms.app;

    this.globals_path = cfg.globals_path || cms.globals_path;

    this.config = {};
    const config_path = path.resolve(this.full_path, ".config.json");
    if (fs.existsSync(config_path)) {
      try {
        this.config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
      } catch(e) {
        console.error(e.stack);
      }
    }

    if (cfg.globals_path) {
      cms.app.use(
        this_class.req_prefix+'g',
        express.static(cfg.globals_path)
      );
    }

    this.load().forEach(function(page) {
      var custom_path = false;

      if (this_class.config.custom_paths) {
        this_class.config.custom_paths.forEach(function(cpath) {
          const cpath_name = Object.keys(cpath)[0];
          if (page.file == cpath_name) {
            custom_path = cpath[cpath_name];
          }

        });
      }

      let npage = new Page({
        request_path: this_class.req_prefix+encodeURIComponent(page.file),
        full_path: path.resolve(this_class.full_path, page.file),
        custom_path: custom_path,
        auth: this_class.auth,
        parent_list: this_class,
        globals_path: this_class.globals_path
      }, cms);

      this_class.list.push(npage);
    });
  }

  load() {
    var list = [];
    var this_class = this;

    fs.readdirSync(this.full_path).forEach(file => {
      var page = {};

      page.blacklisted = false;
      if (this_class.blacklist) {
        for (var b = 0; b < this_class.blacklist.length; b++) {
          if (file == this_class.blacklist[b]) {
            page.blacklisted = true;
          }
        }
      }
      if (!page.blacklisted) {
        var lstat = fs.lstatSync(path.resolve(this_class.full_path, file));
        if (lstat.isDirectory()) {
          page.path = '/'+file;
          if (this_class.config.custom_paths) {
            this_class.config.custom_paths.forEach(function(cpath) {
              const cpath_name = Object.keys(cpath)[0];
              const custom_path = cpath[cpath_name];
              if (file === cpath_name) {
                page.path = custom_path;
              }
            });
          }

          page.file = file;
          page.name = decodeURIComponent(file);
          list.push(page);
        }
      }
    });

    list.sort(function(a, b) {
      return fs.statSync(path.resolve(this_class.full_path, a.file)).birthtime.getTime() - fs.statSync(path.resolve(this_class.full_path, b.file)).birthtime.getTime();
    });
    return list;
  }

  add(name, template) {
    let npage_path = path.resolve(this.full_path, name);
    if (!fs.existsSync(npage_path)){
      var custom_path = false;
      if (this.config.custom_paths) {
        this.config.custom_paths.forEach(function(cpath) {
          const cpath_name = Object.keys(cpath)[0];
          if (name == cpath_name) {
            custom_path = cpath[cpath_name];
          }
        });
      }

      let npage_cfg = {
        request_path: this.req_prefix+encodeURIComponent(name),
        full_path: path.resolve(this.full_path, name),
        custom_path: custom_path,
        auth: this.auth,
        parent_list: this,
        globals_path: this.globals_path
      };



/*
      if (data.template && this_class.tamplate_dir) {
        var src_path = path.resolve(this_class.tamplate_dir, data.template);
        fs.copy(src_path, data.path, function (err) {
          if (err) return console.error(err)
          var npage = new Page(npage_cfg, cms, this_class);
          this_class.hosted_pages.push(npage);
          res.send(JSON.stringify({ msg: "success" }));
        });
      } else {*/
        fs.mkdirSync(npage_path);
        fs.writeFileSync(path.resolve(npage_path, "index.html"), default_html);
        fs.writeFileSync(path.resolve(npage_path, "context.json"), default_json);
        fs.writeFileSync(path.resolve(npage_path, "theme.css"), default_css);
        fs.writeFileSync(path.resolve(npage_path, "main.js"), default_js);
        var npage = new Page(npage_cfg, this.cms);
        this.list.push(npage);
        return { msg: "success" };
    //  }
    } else {
      return { err: "Page `"+name+"` already exists!" };
    }
  }

  remove(name) {
    for (let p = 0; p < this.list.length; p++) {
      if (this.list[p].name === name) {
        this.list[p].destroy();
        this.list.splice(p, 1);
        return { msg: "success" };
      }
    }
    return { err: "Page `"+name+"` does not exists!" };;
  }

//  - -                    - -
// - - - SELECTOR METHODS - - -
//  - -                    - -

  all() {
    let list = [];
    for (let p = 0; p < this.list.length; p++) {
      list.push(this.list[p].data());
    }
    return list;
  }

  select(page_name) {
    for (let p = 0; p < this.list.length; p++) {
      let pdata = this.list[p].data();
      if (pdata.name === page_name) {
        return pdata;
      }
    }
  }
}
