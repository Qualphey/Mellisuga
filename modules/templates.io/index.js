"use strict"

const fs = require('fs');
const path = require('path');
function rmrf(dir_path) {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function(file, index){
      var curPath = dir_path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
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
  constructor(app) {
    this.app = app;

    var template_dir = global.cmb_config.templates_path;


    var err_response = function(res, text) {
      res.send(JSON.stringify({
        err: text
      }));
    }

    app.get(global.cmb_config.admin_path+"/templates.io", function(req, res) {
      var data = JSON.parse(req.query.data);
      /*
        {
          command: "all"|"add"|"rm",
          name: "string" - needed on `add` and `rm` commands
        }
      */

      switch (data.command) {
        case 'all':
          var list = [];
          fs.readdirSync(template_dir).forEach(file => {
            var lstat = fs.lstatSync(path.resolve(template_dir, file));
            if (lstat.isDirectory()) {
              list.push(file);
            }
          });
          res.send(JSON.stringify(list));
          break;
        case 'add':
          if (data.name) {
            if (data.name.length > 0) {
              data.path = path.resolve(template_dir, data.name);
              if (data.path.startsWith(template_dir)) {
                if (!fs.existsSync(data.path)){
                  fs.mkdirSync(data.path);
                  fs.writeFileSync(path.resolve(data.path, "index.html"), default_html);
                  fs.writeFileSync(path.resolve(data.path, "context.json"), default_json);
                  fs.writeFileSync(path.resolve(data.path, "theme.css"), default_css);
                  fs.writeFileSync(path.resolve(data.path, "main.js"), default_js);
                  res.send(JSON.stringify({ msg: "success" }));
                } else {
                  err_response(res, "Template `"+data.name+"` already exists!");
                }
              }
            } else {
              err_response(res, "Template name not specified!");
            }
          } else {
            err_response(res, "Template name not specified!");
          }
          break;
        case 'rm':
          if (data.name) {
            if (data.name.length > 0) {
              data.path = path.resolve(template_dir, data.name);
              if (data.path.startsWith(template_dir)) {
                rmrf(data.path);
                res.send("success");
              }
            } else {
              err_response(res, "Template name not specified!");
            }
          } else {
            err_response(res, "Template name not specified!");
          }
          break;
        default:
          console.log("TemplatesIO: unknown command", data.command);
      }
    });

  }
}
