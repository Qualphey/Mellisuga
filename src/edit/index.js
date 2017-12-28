require("./style.css")

const XHR = require("../utils/xhr.js");
const Editor = require("./editor.ui/index.js");

const template = XHR.getParamByName('template');
const page = XHR.getParamByName('page');

var tools = document.createElement("div");
tools.classList.add("tools");
tools.innerHTML = require("./body.html");
document.body.appendChild(tools);

var editor_btn = tools.querySelector(".editor_btn");
function editor_replaced(n_window) {
  editor_btn.removeEventListener("click", listener);
  editor_btn.addEventListener("click", listener);
  function listener(e) {
    if (n_window.visible) {
      n_window.hide();
    } else {
      n_window.dipslay();
    }
  }
}

var iframe = document.getElementById("cmb_page_display");
var target;
if (template) {
  iframe.src = 't/'+template;
  target = "templates";
} else if (page) {
  iframe.src = '/p/'+page;
  target = "pages";
}

function firstLoad() {
  var editor = new Editor(target, iframe.contentWindow.location.pathname, iframe);
  editor_replaced(editor.window);
  iframe.removeEventListener("load", firstLoad);

  var last_pathname = iframe.contentWindow.location.pathname;
  iframe.addEventListener("load", function(e) {
    var new_pathname = iframe.contentWindow.location.pathname;
    console.log(last_pathname, new_pathname);
    console.log(last_pathname != new_pathname);
    if (last_pathname != new_pathname) {
      editor.destroy();
      editor = new Editor(target, iframe.contentWindow.location.pathname, iframe);
      editor_replaced(editor.window);
    }
    last_pathname = new_pathname;
  });
}
iframe.addEventListener("load", firstLoad);

/*  var treefm = new TreeFM({
    target: "templates",
    dir: template,
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
                iframe.src = iframe.src;
              });
            }
          }
        });
      }
    }
  });

  split.list[0].appendChild(treefm.element);
  split.list[1].style.overflow = "hidden";
  split.list[1].appendChild(tabs.element);
  */
