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
    XHR.get('e/'+XHR.getParamByName('context'), null, function() {
      textarea.innerHTML = this.responseText;

      this_class.cm = CodeMirror.fromTextArea(textarea, {
        lineNumbers: true,
        theme: "base16-dark",
        mode: "javascript",
        indentWithTabs: true,
        tabSize: 2,
        autoCloseBrackets: true,
        matchBrackets: true,
        scrollbarStyle: "null",
        smartIndent: false
      });
      this_class.cm.refresh();
      parent.removeChild(this_class.element);
    });
  }
}
