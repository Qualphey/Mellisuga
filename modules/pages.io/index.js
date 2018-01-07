"use strict"

const fs = require('fs-extra')
const path = require('path');
function rmrf(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function(file, index){
      var curPath = dir_path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        rmrf(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir_path);
  }
};

var default_html = fs.readFileSync(__dirname+'/default_templates/index.html', 'utf8');
var default_json = fs.readFileSync(__dirname+'/default_templates/context.json', 'utf8');
var default_css = fs.readFileSync(__dirname+'/default_templates/theme.css', 'utf8');
var default_js = fs.readFileSync(__dirname+'/default_templates/main.js', 'utf8');

module.exports = class {
  constructor(app, posts, templates) {
    this.app = app;
    this.posts = posts;

    var page_dir = this.page_dir = global.cmb_config.pages_path;
    var template_dir = global.cmb_config.templates_path;


    var err_response = function(res, text) {
      res.send(JSON.stringify({
        err: text
      }));
    }

    var this_class = this;

    app.get(global.cmb_config.admin_path+"/pages.io", function(req, res) {
      var data = JSON.parse(req.query.data);
      /*
        {
          command: "all"|"add"|"get"|"rm",
          name: "string" - needed on `add` and `rm` commands
        }
      */

      switch (data.command) {
        case 'all':
          var list = this_class.all();
          res.send(JSON.stringify(list));
          break;
        case 'add':
          if (data.name) {
            if (data.name.length > 0) {
              data.path = path.resolve(page_dir, data.name);
              if (data.path.startsWith(page_dir)) {
                if (!fs.existsSync(data.path)){
                  if (data.template) {
                    var src_path = path.resolve(template_dir, data.template);
                    console.log(data.path);
                    fs.copy(src_path, data.path, function (err) {
                      if (err) return console.error(err)
                      console.log('success!')
                      res.send(JSON.stringify({ msg: "success" }));
                    });
                  } else {
                    fs.mkdirSync(data.path);
                    fs.writeFileSync(path.resolve(data.path, "index.html"), default_html);
                    fs.writeFileSync(path.resolve(data.path, "context.json"), default_json);
                    fs.writeFileSync(path.resolve(data.path, "theme.css"), default_css);
                    fs.writeFileSync(path.resolve(data.path, "main.js"), default_js);
                    res.send(JSON.stringify({ msg: "success" }));
                  }
                } else {
                  err_response(res, "Page `"+data.name+"` already exists!");
                }
              }
            } else {
              err_response(res, "Page name not specified!");
            }
          } else {
            err_response(res, "Page name not specified!");
          }
          break;
        case 'rm':
          if (data.name) {
            if (data.name.length > 0) {
              data.path = path.resolve(page_dir, data.name);
              if (data.path.startsWith(page_dir)) {
                rmrf(data.path);
                res.send("success");
              }
            } else {
              err_response(res, "Page name not specified!");
            }
          } else {
            err_response(res, "Page name not specified!");
          }
          break;
        default:
          console.log("PagesIO: unknown command", data.command);
      }
    });

  }

  async compile_context(context) {
    if (context.posts) {
      var tags = context.posts.split(" ");
      var result = await this.posts.select(tags);

      context.posts = result;
    }
    if (context.menu) {
      var names = context.menu.split(" ");
      console.log(names);
      context.menu = [];
      var page_list = this.all();
      for (var p = 0; p < page_list.length; p++) {
        for (var n = 0; n < names.length; n++) {
          if (page_list[p] == names[n]) {
            context.menu.push(names[n]);
          }
        }
      }
    }
    return context;
  }

  all() {
    var list = [];
    var this_class = this;
    fs.readdirSync(this.page_dir).forEach(file => {
      var lstat = fs.lstatSync(path.resolve(this_class.page_dir, file));
      if (lstat.isDirectory()) {
        list.push(file);
      }
    });

    list.sort(function(a, b) {
      return fs.statSync(path.resolve(this_class.page_dir, a)).birthtime.getTime() - fs.statSync(path.resolve(this_class.page_dir, b)).birthtime.getTime();
    });

    return list;
  }
}
