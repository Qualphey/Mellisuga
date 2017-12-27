require("./style.css")

const XHR = require("../utils/xhr.js");
const WindowUI = require("./window.ui/index.js");
const SplitUI = require("./split.ui/index.js");
const TreeFM = require("./treefm.ui");
const TabsUI = require("./tabs.ui/index.js");
const CodeMirror = require("./codemirror.ui/index.js");

const template = XHR.getParamByName('template');
const page = XHR.getParamByName('page');

var tools = document.createElement("div");
tools.classList.add("tools");
tools.innerHTML = require("./body.html");
document.body.appendChild(tools);

var editor_win = new WindowUI({
  DOM: document.body,
  title: "Editor",
  resize_cb: function() {
    split.auto_resize();
  }
});

var editor_btn = tools.querySelector(".editor_btn");
editor_btn.addEventListener("click", function(e) {
  if (editor_win.visible) {
    editor_win.hide();
  } else {
    editor_win.dipslay();
  }
});

global.editor_window = editor_win;

editor_win.content.style.overflow = "hidden";

var split = new SplitUI(editor_win.content, "horizontal");
split.split(2);


var tabs = new TabsUI();

var last_save_callback = false;

function file_cb(file) {

}

if (template) {
  var iframe = document.getElementById("cmb_page_display");
  iframe.src = 't/'+template;

  var treefm = new TreeFM({
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
} else if (page) {
  var iframe = document.getElementById("cmb_page_display");
  iframe.src = '/p/'+page;

  var treefm = new TreeFM({
    target: "pages",
    dir: page,
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

} else {

}
