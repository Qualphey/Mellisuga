require("./theme.css")

const XHR = require("../utils/xhr.js");
const Editor = require("./editor.ui/index.js");

const template = XHR.getParamByName('template');
const page = XHR.getParamByName('page');

let target_name = encodeURIComponent(template || page);

console.log(page);

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
  iframe.src = 't/'+target_name;
  target = "templates";
} else if (page) {
  iframe.src = '/'+target_name;
  target = "pages";
}


iframe.addEventListener("load", firstLoad);
var floadID = setTimeout(firstLoad, 1000);
function firstLoad() {
  clearTimeout(floadID);
  var editor = new Editor(target, template || page, iframe, iframe.contentWindow.location.pathname);
  editor_replaced(editor.window);
  iframe.removeEventListener("load", firstLoad);

  var last_pathname = iframe.contentWindow.location.pathname;

  iframe.addEventListener("load", socondLoad);
  var sloadID = setTimeout(socondLoad, 1000);
  function socondLoad(e) {
    clearTimeout(sloadID);
    var new_pathname = iframe.contentWindow.location.pathname;
    console.log(last_pathname, new_pathname);
    console.log(last_pathname != new_pathname);
    if (last_pathname != new_pathname) {
      editor.destroy();
      var new_root_dir = decodeURIComponent(iframe.contentWindow.location.pathname).substr(1).slice(0, -1);
      console.log("NEDITOR", new_root_dir, iframe.contentWindow.location.pathname);
      editor = new Editor(target, new_root_dir, iframe);
      editor_replaced(editor.window);
    }
    last_pathname = new_pathname;
  }
}
