'use strict'

//require("./style.css");

var XHR = require("../../utils/xhr.js");

module.exports = class {
  constructor(text, mode) {
    this.element = document.createElement("div");
    this.element.style.height = "100%";

  //  parent.appendChild(this.element);

    var textarea = document.createElement("textarea");
    this.element.appendChild(textarea);

    var this_class = this;

    textarea.innerHTML = text;

    var cfg = {
      lineNumbers: true,
      theme: "base16-dark",
      indentWithTabs: true,
      tabSize: 2,
      scrollbarStyle: "null",
      smartIndent: false
  //  matchTags: true
    };
    switch (mode) {
      case 'html':
        cfg.mode = "htmlmixed";
        cfg.autoCloseTags = true;
    //  matchTags: true
        break;
      case 'css':
        cfg.mode = "css";
        cfg.autoCloseBrackets = true;
        cfg.matchBrackets = true;
        break;
      case 'js':
        cfg.mode = "javascript";
        cfg.autoCloseBrackets = true;
        cfg.matchBrackets = true;
        break;
      default:
      cfg.mode = "htmlmixed";
      cfg.autoCloseTags = true;
  //  matchTags: true
    }
    console.log("mode:", cfg.mode);
    this_class.cm = CodeMirror.fromTextArea(textarea, cfg);
    this_class.cm.refresh();
  }
}
