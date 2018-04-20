'use strict'

//require("./style.css");

const CodeMirror = require('codemirror');

require('codemirror/lib/codemirror.css');
require('codemirror/theme/base16-dark.css');

require('codemirror/mode/javascript/javascript');
require('codemirror/mode/css/css');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/edit/matchbrackets');

require('codemirror/mode/xml/xml');
require('codemirror/mode/htmlmixed/htmlmixed');

require('codemirror/addon/edit/closetag');
require('codemirror/addon/edit/matchtags');

require('codemirror/addon/scroll/simplescrollbars.css');
require('codemirror/addon/scroll/simplescrollbars.js');


var XHR = require("../../utils/xhr.js");

module.exports = class {
  constructor(text, mode, readonly, init_cfg) {
    this.element = document.createElement("div");
    this.element.style.height = "100%";

    console.log("CODEMIRROR INITIALIZED");

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
      scrollbarStyle: "native",
      smartIndent: false,
      readOnly: readonly,
      viewportMargin: Infinity
  //  matchTags: true
    };

    if (init_cfg) {
      if (init_cfg.disable_scrollbar) {
        cfg.scrollbarStyle = "null";
        require('./noscroll.css');
      }
    }

    if (readonly) {
      cfg.cursorBlinkRate = -1;
    }

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
      case 'less':
        cfg.mode = "text/x-less";
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
