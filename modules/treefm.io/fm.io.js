var fs = require("fs");

var path = require("path");
var isolated_directory_path = __dirname;

module.exports = class {
  constructor(cfg) {
    this.router = cfg.router;
    this.targets = cfg.targets;

    var this_class = this;
    this.router.get(global.cmb_config.admin_path+'/treefm.io', function(req, res) {
      var data = JSON.parse(req.query.data);

      /*
        {
          target: "page"|"template",
          command: "read"|"write"|"rm"|"mkdir"|"rmdir"|"rename",
          path: "path/to/file"
          data: "string" - needed on `write` and `rename` commands
        }
      */

      var target_dir = this_class.targets[data.target];
      var result = this_class.command(target_dir, data.command, data.path, data.data);
      res.send(JSON.stringify(result));
    });
  }

  command(root_dir, command, file_path, data) {
    var result = false;

    root_dir = path.resolve(root_dir);
    var rel_path = file_path;
    file_path = path.resolve(root_dir, file_path);

    if (file_path.startsWith(root_dir)) {
      switch (command) {
        case 'read':
          result = this.readFile(file_path, rel_path);
          break;
        case 'write':
          result = this.writeFile(file_path, data);
          break;
        case 'rm':
          result = this.rmFile(file_path);
          break;
        case 'mkdir':
          result = this.mkDir(file_path);
          break;
        case 'rmdir':
          result = this.rmDir(file_path);
          break;
        case 'rename':
          var new_path = path.resolve(root_dir, data);
          result = this.rename(file_path, new_path);
          break;
        default:
          console.log("Unknown command:", command);
      }
    } else {
      console.log("Unsafe path has been stopped:", file_path);
    }
    return result;
  }

  writeFile(file_path, data) {
    fs.writeFileSync(file_path, data)
    return "success";
  }

  readFile(file_path, rel_path) {
    var result = false;

    var lstat = fs.lstatSync(file_path);
    if (lstat.isFile()) {
      result = fs.readFileSync(file_path, 'utf8');
    } else if (lstat.isDirectory()) {
      var file_tree = {
        path: file_path,
        rel_path: rel_path,
        name: rel_path,
        type: 'dir',
        content: []
      };

      readdir(file_tree);
      function readdir(dir) {
        fs.readdirSync(dir.path).forEach(file => {
          var lstat = fs.lstatSync(dir.path+'/'+file);
          if (lstat.isFile()) {
            var txt = {
              name: file,
              path: dir.path+'/'+file,
              rel_path: dir.rel_path+'/'+file,
              type: 'txt'
            }
            dir.content.push(txt);
          } else if (lstat.isDirectory()) {
            var cdir = {
              name: file,
              path: dir.path+'/'+file,
              rel_path: dir.rel_path+'/'+file,
              type: 'dir',
              content: []
            }
            dir.content.push(cdir);
            readdir(cdir);
          }
        });
      }
      result = file_tree;
    }
    return result;
  }

  rmFile(file_path) {
    fs.unlinkSync(file_path);
    return "success";
  }

  mkDir(file_path) {
    if (!fs.existsSync(file_path)){
      fs.mkdirSync(file_path);
    }
    return "success";
  }

  rmDir(file_path) {
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

    rmrf(file_path);
    return "success";
  }

  rename(file_path, new_path) {
    fs.renameSync(file_path, new_path);
    return "success";
  }
}
