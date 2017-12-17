var fs = require("fs");

var path = require("path");
var isolated_directory_path = __dirname;

module.exports = class {
  constructor(base_dir) {
    this.root = base_dir;
  }

  pathValid(npath) {
    var result = path.resolve(this.root, this.root+'/'+npath);
    return result.startsWith(this.root);
  }

  command(data) {
    /*
      {
        type: "page"|"template",
        target: "page/template name",
        command: "read"|"write"|"rm"|"mkdir"|"rmdir"|"rename",
        path: "path/to/file"
        data: "string" - needed on `write` and `rename` commands
      }
    */

    var result = false;

    if (this.pathValid(data.path)) {
      switch (data.command) {
        case 'read':
          this.readFile(data.path);
          break;
        default:

      }
    } else {
      console.log("Unsafe path has been stopped:", npath);
    }
  }

  writeFile(npath) {
  }

  readFile(npath) {
    npath = path.resolve(this.root, this.root+'/'+npath);
    var lstat = fs.lstatSync(npath);
    if (lstat.isFile()) {
      result = fs.readFileSync(npath, 'utf8');
    } else if (lstat.isDirectory()) {
      var file_tree = {
        path: npath,
        type: 'dir',
        content: []
      };

      readdir(file_tree);
      function readdir(dir) {
        fs.readdirSync(dir.path).forEach(file => {
          var lstat = fs.lstatSync(dir.path+'/'+file);
          if (lstat.isFile()) {
            var txt = {
              path: dir.path+'/'+file,
              type: 'txt'
            }
            dir.content.push(txt);
          } else if (lstat.isDirectory()) {
            var cdir = {
              path: dir.path+'/'+file,
              type: 'dir',
              content: []
            }
            dir.content.push(cdir);
            readdir(cdir);
          }
        });
      }
      return file_tree;
    }
  }

  rmFile(npath) {

  }

  mkDir(npath) {

  }

  rmDir(npath) {

  }

  rename(npath) {

  }
}
