require("./style.css")

var XHR = require("../utils/xhr.js");

var tools = document.createElement("div");
tools.classList.add("tools");
tools.innerHTML = require("./body.html");
document.body.appendChild(tools);

var WindowUI = require("./window.ui/index.js");
var html_win = new WindowUI({
  DOM: document.body,
  title: "HTML editor"
});

var HTMLEdit = require("./html.edit/index.js");
var html_editor = new HTMLEdit(html_win.content);

var html_btn = tools.querySelector(".html_btn");
html_btn.addEventListener("click", function(e) {
  if (html_win.visible) {
    html_win.hide();
  } else {
    html_win.dipslay();
  }
});

var TabsUI = require("./tabs.ui/index.js");
var tabs = new TabsUI();

var ContextEdit = require("./context.edit/index.js");
var context = new ContextEdit(tabs.display);

var HTMLEdit = require("./html.edit/index.js");
var html_editor = new HTMLEdit(tabs.display);

tabs.set([
  {
    text: "html",
    cb: function(display) {
      display.appendChild(html_editor.element);
    }
  }, {
    text: "context",
    cb: function(display) {
      display.appendChild(context.element);
    }
  }
]);

var iframe = document.getElementById("cmb_page_display");
iframe.src = '/p/'+XHR.getParamByName('page');
iframe.addEventListener('mouseup', function(e) {
  console.log("iframe up ");
});

function save() {
  XHR.get('edit_page', {
    html: html_editor.cm.getValue(),
    context: context.cm.getValue(),
    uri: XHR.getParamByName('page'),
    context_uri: XHR.getParamByName('context')
  }, function(response){
    console.log(response);
    iframe.src = iframe.src;
  });
}

var save_button = document.createElement('button');
save_button.innerHTML = "save";
save_button.addEventListener("click", function(e) {
  save();
});

document.addEventListener("keydown", function(e) {
  if (e.keyCode == 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
    e.preventDefault();
    save();
  }
}, false);

save_button.style.float = "right";
tabs.list.appendChild(save_button);
/*
var WindowUI = require("./window.ui/index.js");
var editor_win = new WindowUI(function(obj) {
  document.body.appendChild(obj.element);
  obj.content_element.appendChild(tabs.element);
});
*/
