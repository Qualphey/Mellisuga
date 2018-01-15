const XHR = require("../../utils/xhr.js");
const Dir = require("./dir.js");
const ContextMenu = require("./contextmenu.js");
require("./style.css");


module.exports = class {
  constructor(cfg) {
    this.element = document.createElement("div");
    this.element.classList.add("treefm");
    this.file_cb = cfg.file_cb;

    this.target = cfg.target;
    this.dir = cfg.dir;

    this.contextmenu = new ContextMenu();

    var this_class = this;

    console.log(cfg.target, cfg.dir);
    XHR.get('treefm.io', {
      target: cfg.target,
      command: "read",
      path: cfg.dir
    }, function() {
      var dir_tree = JSON.parse(this.responseText);
      dir_tree.root = true;
      dir_tree.padding_index = 0;
      var root_dir = new Dir(dir_tree, this_class);
      this_class.element.appendChild(root_dir.element);
    });
  }

  read_file(file_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "read",
      path: file_path
    }, function() {
      var file_content = JSON.parse(this.responseText);
      cb(file_content);
    });
  }

  write_file(file_path, content, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "write",
      path: file_path,
      data: content
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  upload_files(formData, cb) {
    XHR.post('treefm.io', {
      formData: formData
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  rm_file(file_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "rm",
      path: file_path
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  mkdir(file_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "mkdir",
      path: file_path
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  rm_dir(file_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "rmdir",
      path: file_path
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  rename(file_path, new_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "rename",
      path: file_path,
      data: new_path
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
