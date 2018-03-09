
const fs = require("fs");
const path = require("path");

module.exports = class {
  constructor(modules_path, cmbird) {
    this.dir = modules_path;

    if (!fs.existsSync(modules_path)){
      fs.mkdirSync(modules_path);
    }
    this.all().forEach(module => {
      var args = [];

      for (var a = 0; a < module.config.init_arguments.length; a++) {
        var arg = module.config.init_arguments[a];
        switch (arg) {
          case 'app':
            args.push(cmbird.router.app);
            break;
          case 'pages':
            args.push(cmbird.pages);
            break;
          case  'user_table':
            args.push(cmbird.auth.table);
            break;
          default:
        }

      }

      module.object = require(module.index).init(...args);
    });
  }

  static async init(modules_path, cmbird) {

    return new module.exports(modules_path, cmbird);
  }

  all() {

    var list = [];
    var this_class = this;

    fs.readdirSync(this.dir).forEach(file => {
      var module_path = path.resolve(this_class.dir, file);
      var module_index_path = path.resolve(module_path, 'index.js');
      var module_config_path = path.resolve(module_path, 'config.json');
      var lstat = fs.lstatSync(module_path);
      if (lstat.isDirectory()) {
        if (fs.existsSync(module_index_path)){
          var module = {
            index: module_index_path,
            path: module_path,
            name: file
          };

          if (fs.existsSync(module_config_path)) {
            module.config = JSON.parse(fs.readFileSync(module_config_path, "utf8"));
          }

          list.push(module);
        }
      }
    });

    return list;
  }
}
