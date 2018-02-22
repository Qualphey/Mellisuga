
const TreeFM = require("../treefm.ui");
const TabsUI = require("../tabs.ui/index.js");
const CodeMirror = require("../codemirror.ui/index.js");

const template_prefix = "/cmb_admin/t/";
const page_prefix = "/p/";

const XHR = require("../../utils/xhr.js");

module.exports = class {
  constructor(target, dir, iframe, refresh_path) {
    var tabs = this.tabs = new TabsUI();

    var last_save_callback = false;

    var treefm = this.treefm = new TreeFM({
      target: target,
      dir: dir,
      file_cb: function(file) {
        console.log(file);
        var tab = tabs.select(file.rel_path);
        if (tab) {
          tab.display();
        } else {
          treefm.read_file(file.rel_path, function(file_content) {
            var extension = file.rel_path.substr(file.rel_path.lastIndexOf('.')+1);
            if (extension == "json") extension = "js";
            var html_editor = new CodeMirror(file_content, extension);
            tabs.add({
              text: file.name,
              cb: function(display) {
                display.appendChild(html_editor.element);
                html_editor.cm.refresh();
                if (last_save_callback) {
                  document.body.removeEventListener("keydown", last_save_callback);
                }
                document.body.addEventListener("keydown", save_cur_file);
                last_save_callback = save_cur_file;
              },
              id: file.rel_path
            });
            function save_cur_file(e) {
              if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
                e.preventDefault();
                treefm.write_file(file.rel_path, html_editor.cm.getValue(), function() {
                  /*
                  XHR.post("pages.io", {
                    command: "webpack",
                    name: dir
                  }, function(response) {
                    console.log("WEBPACK RES", response);
                    iframe.contentWindow.location.replace(refresh_path);
                  });
                  */
                });
              }
            }
          });
        }
      }
    });
  }

  destroy() {
    this.tabs.destroy();
    this.treefm.destroy();
  }
}
