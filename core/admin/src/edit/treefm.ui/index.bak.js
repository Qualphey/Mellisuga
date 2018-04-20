const XHR = require("../../utils/xhr.js");
const ContextMenu = require("./contextmenu.js");
require("./style.css");


module.exports = class {
  constructor(cfg) {
    this.element = document.createElement("div");
    this.file_cb = cfg.file_cb;

    this.target = cfg.target;
    this.dir = cfg.dir;

    this.contextmenu = new ContextMenu();

    var this_class = this;
    XHR.get('treefm.io', {
      target: cfg.target,
      command: "read",
      path: cfg.dir
    }, function() {
      var dir_tree = JSON.parse(this.responseText);
      var root_dir_name = document.createElement("div");
      root_dir_name.classList.add("treefm_item");
      root_dir_name.innerHTML = dir_tree.name;
      root_dir_name.addEventListener("click", function(e) {
        if (root_dir_content_div.displayed) {
          root_dir_content_div.style.display = "none";
          root_dir_content_div.displayed = false;
        } else {
          root_dir_content_div.style.display = "block";
          root_dir_content_div.displayed = true;
        }
      });
      root_dir_name.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        this_class.contextmenu.display(e.clientX, e.clientY, ["rename", "delete"]);

        global.editor_window.element.addEventListener("click", hide_contextmenu);

        function hide_contextmenu(e) {
          this_class.contextmenu.hide();
          global.editor_window.element.removeEventListener("click", hide_contextmenu);
        }
      })
      this_class.element.appendChild(root_dir_name);

      var root_dir_content_div = document.createElement("div");
      root_dir_content_div.displayed = false;
      root_dir_content_div.classList.add("treefm_dir_content");
      this_class.element.appendChild(root_dir_content_div);

      for (var f = 0; f < dir_tree.content.length; f++) {
        let file = dir_tree.content[f];
        if (file.type == "dir") {
          this_class.read_dir(file, root_dir_content_div);
        } else if (file.type == "txt") {
          console.log("display file");
          var file_div = document.createElement("div");
          file_div.classList.add("treefm_item");
          file_div.innerHTML = file.name;
          file_div.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            this_class.contextmenu.display(e.clientX, e.clientY, ["new_file", "new_folder"]);

            global.editor_window.element.addEventListener("click", hide_contextmenu);

            function hide_contextmenu(e) {
              this_class.contextmenu.hide();
              global.editor_window.element.removeEventListener("click", hide_contextmenu);
            }
          });
          file_div.addEventListener("click", function(e) {
            this_class.file_cb(file);
          });
          root_dir_content_div.appendChild(file_div);
        } else {
          console.error("TreeFM: Unknown file type", file.type);
        }
      }
    });
  }

  read_dir(file, append_div) {
    var this_class = this;

    var dir_div = document.createElement("div");
    var name_div = document.createElement("div");
    name_div.classList.add("treefm_item");
    name_div.innerHTML = file.name;
    name_div.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      this_class.contextmenu.display(e.clientX, e.clientY, ["rename", "delete"]);

      global.editor_window.element.addEventListener("click", hide_contextmenu);

      function hide_contextmenu(e) {
        this_class.contextmenu.hide();
        global.editor_window.element.removeEventListener("click", hide_contextmenu);
      }
    })
    name_div.addEventListener("click", function(e) {
      if (content_div.displayed) {
        content_div.style.display = "none";
        content_div.displayed = false;
      } else {
        content_div.style.display = "block";
        content_div.displayed = true;
      }
    });
    dir_div.appendChild(name_div);

    var content_div = document.createElement("div");
    content_div.displayed = false;
    content_div.classList.add("treefm_dir_content");
    for (var f = 0; f < file.content.length; f++) {
      let child_file = file.content[f];
      if (child_file.type == "dir") {
        this.read_dir(child_file, content_div);
      } else if (child_file.type == "txt") {
        var file_div = document.createElement("div");
        file_div.innerHTML = child_file.name;
        file_div.classList.add("treefm_item");
        file_div.addEventListener("click", function(e) {
          this_class.file_cb(child_file);
        });
        file_div.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          this_class.contextmenu.display(e.clientX, e.clientY, ["new_file", "new_folder"]);

          global.editor_window.element.addEventListener("click", hide_contextmenu);

          function hide_contextmenu(e) {
            this_class.contextmenu.hide();
            global.editor_window.element.removeEventListener("click", hide_contextmenu);
          }
        });
        content_div.appendChild(file_div);
      } else {
        console.error("TreeFM: Unknown file type", child_file.type);
      }
    }
    dir_div.appendChild(content_div);

    append_div.appendChild(dir_div);
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
}
