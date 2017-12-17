'use strict'

//require("./style.css");

var XHR = require("../../utils/xhr.js");

module.exports = class {
  constructor(parent) {
    this.element = document.createElement("div");
    parent.appendChild(this.element);

    var textarea = document.createElement("textarea");
    this.element.appendChild(textarea);

    var this_class = this;
    XHR.get('e/'+XHR.getParamByName('page'), null, function() {
      textarea.innerHTML = this.responseText;

      this_class.cm = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        theme: "base16-dark",
        mode: "htmlmixed",
        indentWithTabs: true,
        tabSize: 2,
        autoCloseTags: true,
        scrollbarStyle: "null",
        smartIndent: false
      //  matchTags: true
      });
      this_class.cm.refresh();
    });
  }
}
