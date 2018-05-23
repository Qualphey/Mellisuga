/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./cmbird/core/admin/dist/Admins/src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./cmbird/core/admin/dist/Admins/src/account.html":
/*!********************************************************!*\
  !*** ./cmbird/core/admin/dist/Admins/src/account.html ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n<td class=\"admin_accounts_ui_item_name\"></td>\n<td>\n  <input type=\"checkbox\" name=\"super\" disabled />\n</td>\n<td class=\"json_edit\">\n\n</td>\n<td>\n  <button class=\"admin_accounts_ui_item_edit\">/</button>\n  <button class=\"admin_accounts_ui_item_remove\">X</button>\n  <button class=\"admin_accounts_ui_item_save\" style=\"display: none;\">Save</button>\n</td>\n";

/***/ }),

/***/ "./cmbird/core/admin/dist/Admins/src/account.js":
/*!******************************************************!*\
  !*** ./cmbird/core/admin/dist/Admins/src/account.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const XHR = __webpack_require__(/*! globals/utils/xhr_async.js */ "./globals/modules/utils/xhr_async.js");

const CodeMirror = __webpack_require__(/*! globals/codemirror.ui/index.js */ "./globals/modules/codemirror.ui/index.js");

const html = __webpack_require__(/*! ./account.html */ "./cmbird/core/admin/dist/Admins/src/account.html");

module.exports = class {
  constructor(cfg) {
    this.element = document.createElement("tr");
    this.element.classList.add("admin_accounts_ui_item");
    this.element.innerHTML = html;

    this.email = cfg.email;

    var name = this.element.querySelector(".admin_accounts_ui_item_name");
    name.innerHTML = cfg.email;

    let inputs = this.element.getElementsByTagName("input");

    let this_class = this;

    var json_edit = this.element.querySelector(".json_edit");

    this.cfg_string = JSON.stringify(JSON.parse(cfg.cfg), null, 2);

    this.html_editor = new CodeMirror(this.cfg_string, 'js', true);
    json_edit.appendChild(this.html_editor.element);
    this.html_editor.cm.setSize(500, 100);

    setTimeout(function () {
      this_class.html_editor.cm.refresh();
    }, 1);

    let edit_btn = this.element.querySelector(".admin_accounts_ui_item_edit");
    let rm_btn = this.element.querySelector(".admin_accounts_ui_item_remove");

    if (cfg.creator) {
      console.log("CFG CREATOR");
      inputs[0].checked = true;
      edit_btn.parentNode.removeChild(edit_btn);
      rm_btn.parentNode.removeChild(rm_btn);
    } else if (cfg.super) {
      inputs[0].checked = true;
    } else {
      inputs[0].checked = false;
    }

    rm_btn.addEventListener("click", (() => {
      var _ref = _asyncToGenerator(function* (e) {
        const response = yield XHR.post('../admin_accounts.io', {
          command: "rm",
          data: {
            email: this_class.email
          }
        }, 'access_token');
        if (response === "success") {
          this_class.destroy();
        } else {
          console.log(response);
        }
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })());
    let edit_save = this.element.querySelector(".admin_accounts_ui_item_save");
    edit_btn.addEventListener("click", function (e) {
      edit_btn.style.display = "none";
      rm_btn.style.display = "none";
      edit_save.style.display = "inline-block";

      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        input.disabled = false;
      }

      json_edit.removeChild(this_class.html_editor.element);
      json_edit.style.backgroundColor = "#222";
      this_class.html_editor = new CodeMirror(this_class.cfg_string, 'js', false);
      json_edit.appendChild(this_class.html_editor.element);
      this_class.html_editor.cm.setSize(500, 100);
      this_class.html_editor.cm.refresh();
    });

    edit_save.addEventListener("click", (() => {
      var _ref2 = _asyncToGenerator(function* (e) {
        var cfg_json = this_class.html_editor.cm.getValue();
        this_class.cfg_string = cfg_json;

        const response = yield XHR.post('../admin_accounts.io', {
          command: "edit",
          data: {
            email: this_class.email,
            super: inputs[0].checked,
            cfg: cfg_json
          }
        }, 'access_token');
        if (response === "success") {
          edit_btn.style.display = "inline-block";
          rm_btn.style.display = "inline-block";
          edit_save.style.display = "none";

          for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            input.disabled = true;
          }

          json_edit.removeChild(this_class.html_editor.element);
          json_edit.style.backgroundColor = "transparent";
          this_class.html_editor = new CodeMirror(cfg_json, 'js', true);
          json_edit.appendChild(this_class.html_editor.element);
          this_class.html_editor.cm.setSize(500, 100);
          this_class.html_editor.cm.refresh();
        } else {
          alert(response);
        }
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })());
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
};

/***/ }),

/***/ "./cmbird/core/admin/dist/Admins/src/index.js":
/*!****************************************************!*\
  !*** ./cmbird/core/admin/dist/Admins/src/index.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const XHR = __webpack_require__(/*! globals/utils/xhr_async.js */ "./globals/modules/utils/xhr_async.js");
const CodeMirror = __webpack_require__(/*! globals/codemirror.ui/index.js */ "./globals/modules/codemirror.ui/index.js");
const Account = __webpack_require__(/*! ./account.js */ "./cmbird/core/admin/dist/Admins/src/account.js");

let div = document.getElementById('admin_accounts_ui');

let accounts_array = [];

let accounts_list = div.querySelector(".admin_accounts_ui_list");

let new_account_form = div.querySelector("#admin_accounts_ui_new_item_input");

let new_acc_email_input = new_account_form.querySelector('input[name="email"]');
let new_acc_password_input = new_account_form.querySelector('input[name="password"]');

let new_acc_super_input = new_account_form.querySelector('input[name="super"]');

var json_edit = div.querySelector(".new_json_edit");

_asyncToGenerator(function* () {
  let accounts = yield XHR.post('../admin_accounts.io', {
    command: "all"
  }, 'access_token');

  for (let p = 0; p < accounts.length; p++) {
    accounts[p].cfg = JSON.stringify(accounts[p].cfg);
    var account = new Account(accounts[p]);
    new_account_form.parentNode.insertBefore(account.element, new_account_form);
    accounts_array.push(account);
  }
})();

let new_account_button = div.querySelector("#admin_accounts_ui_new_item");
let html_editor = undefined;

new_account_button.addEventListener("click", function (e) {

  new_account_button.style.display = "none";
  new_account_form.style.display = "";

  new_acc_email_input.value = "";
  new_acc_password_input.value = "";

  html_editor = new CodeMirror('', 'js', false);
  json_edit.appendChild(html_editor.element);
  html_editor.cm.setSize(500, 100);
  html_editor.cm.refresh();
});

let new_acc_submit = new_account_form.querySelector('button[name="submit"]');
new_acc_submit.addEventListener("click", (() => {
  var _ref2 = _asyncToGenerator(function* (e) {
    var data = {
      email: new_acc_email_input.value,
      password: new_acc_password_input.value
    };

    if (new_acc_super_input.checked) {
      data.super = true;
    } else {
      data.cfg = html_editor.cm.getValue();
    }

    const response = yield XHR.post('../admin_accounts.io', {
      command: "add",
      data: data
    }, "access_token");
    if (response === "success") {
      var account = new Account(data);
      new_account_form.parentNode.insertBefore(account.element, new_account_form);
      new_account_button.style.display = "block";
      new_account_form.style.display = "none";
    } else {
      console.log(response);
    }
  });

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
})());

let new_acc_cancel = new_account_form.querySelector('button[name="cancel"]');
new_acc_cancel.addEventListener("click", function (e) {
  new_account_button.style.display = "block";
  new_account_form.style.display = "none";
});

function refresh() {
  for (var a = 0; a < accounts_array.length; a++) {
    console.log("r", a);
    accounts_array[a].html_editor.cm.refresh();
  }
}

/***/ }),

/***/ "./globals/modules/codemirror.ui/index.js":
/*!************************************************!*\
  !*** ./globals/modules/codemirror.ui/index.js ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//require("./style.css");

const CodeMirror = __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/lib/codemirror.css\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/theme/base16-dark.css\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/mode/javascript/javascript\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/mode/css/css\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/addon/edit/closebrackets\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/addon/edit/matchbrackets\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/mode/xml/xml\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/mode/htmlmixed/htmlmixed\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/addon/edit/closetag\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/addon/edit/matchtags\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/addon/scroll/simplescrollbars.css\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));
__webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"codemirror/addon/scroll/simplescrollbars.js\""); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

var XHR = __webpack_require__(/*! ../utils/xhr.js */ "./globals/modules/utils/xhr.js");

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
        __webpack_require__(/*! ./noscroll.css */ "./globals/modules/codemirror.ui/noscroll.css");
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
};

/***/ }),

/***/ "./globals/modules/codemirror.ui/noscroll.css":
/*!****************************************************!*\
  !*** ./globals/modules/codemirror.ui/noscroll.css ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {


var content = __webpack_require__(/*! !../../../node_modules/css-loader??ref--6-1!./noscroll.css */ "./node_modules/css-loader/index.js??ref--6-1!./globals/modules/codemirror.ui/noscroll.css");

if(typeof content === 'string') content = [[module.i, content, '']];

var transform;
var insertInto;



var options = {"hmr":true}

options.transform = transform
options.insertInto = undefined;

var update = __webpack_require__(/*! ../../../node_modules/style-loader/lib/addStyles.js */ "./node_modules/style-loader/lib/addStyles.js")(content, options);

if(content.locals) module.exports = content.locals;

if(false) {}

/***/ }),

/***/ "./globals/modules/utils/xhr.js":
/*!**************************************!*\
  !*** ./globals/modules/utils/xhr.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class {
  static get(url, params, callback) {
    if (params) {
      url += "?data=" + encodeURIComponent(JSON.stringify(params));
    }

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", callback);
    xhr.open("GET", url);
    xhr.send();

    console.log(url);
  }

  static post(url, params, callback) {
    if (params.formData) {
      console.log("FORM DATA");
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url);
      //  xhr.setRequestHeader("Content-Type","multipart/form-data");
      xhr.send(params.formData);
      xhr.addEventListener("load", callback);
      console.log(url);
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);

      //Send the proper header information along with the request
      xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      xhr.onreadystatechange = function () {
        //Call a function when the state changes.
        if (xhr.readyState == 4 && xhr.status == 200) {
          callback(xhr.responseText);
        }
      };

      var json = JSON.stringify(params);
      var param_str = 'data=' + encodeURIComponent(json);
      xhr.send(param_str);
    }
  }

  static getParamByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
};

/***/ }),

/***/ "./globals/modules/utils/xhr_async.js":
/*!********************************************!*\
  !*** ./globals/modules/utils/xhr_async.js ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

module.exports = class {
  static get(url, params) {
    return _asyncToGenerator(function* () {
      try {
        return yield new Promise(function (resolve) {
          if (params) {
            url += "?data=" + encodeURIComponent(JSON.stringify(params));
          }

          var xhr = new XMLHttpRequest();

          xhr.addEventListener("load", function () {
            resolve(JSON.parse(this.responseText));
          });
          xhr.open("GET", url);
          xhr.send();
        });
      } catch (e) {
        console.error(e);
        return undefined;
      }
    })();
  }

  static post(url, params, token_name) {
    return _asyncToGenerator(function* () {
      try {
        return yield new Promise(function (resolve) {
          if (params.formData) {
            console.log("FORM DATA");
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            //  xhr.setRequestHeader("Content-Type","multipart/form-data");
            xhr.send(params.formData);
            xhr.addEventListener("load", function () {
              resolve(JSON.parse(xhr.responseText));
            });
            console.log(url);
          } else {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);

            //Send the proper header information along with the request
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

            xhr.onreadystatechange = function () {
              //Call a function when the state changes.
              if (xhr.readyState == 4 && xhr.status == 200) {
                try {
                  resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                  resolve(xhr.responseText);
                }
              }
            };

            const token = localStorage.getItem(token_name || "user_access_token");

            var json = JSON.stringify(params);
            var param_str = 'data=' + encodeURIComponent(json);
            if (token) {
              param_str += '&access_token=' + token;
              xhr.send(param_str);
            } else {
              xhr.send(param_str);
            }
          }
        });
      } catch (e) {
        console.error(e);
        return undefined;
      }
    })();
  }

  static getParamByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }
};

/***/ }),

/***/ "./node_modules/css-loader/index.js??ref--6-1!./globals/modules/codemirror.ui/noscroll.css":
/*!****************************************************************************************!*\
  !*** ./node_modules/css-loader??ref--6-1!./globals/modules/codemirror.ui/noscroll.css ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(/*! ../../../node_modules/css-loader/lib/css-base.js */ "./node_modules/css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "\n.CodeMirror {\n  /* Set height, width, borders, and global font properties here */\n  min-width: 100%;\n  width: fit-content;\n\n  min-height: 100%;\n  height: fit-content;\n\n  font-family: monospace;\n  color: black;\n  direction: ltr;\n}\n", ""]);

// exports


/***/ }),

/***/ "./node_modules/css-loader/lib/css-base.js":
/*!*************************************************!*\
  !*** ./node_modules/css-loader/lib/css-base.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function (useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if (item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function (modules, mediaQuery) {
		if (typeof modules === "string") modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for (var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if (typeof id === "number") alreadyImportedModules[id] = true;
		}
		for (i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if (mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if (mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */';
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}

/***/ }),

/***/ "./node_modules/style-loader/lib/addStyles.js":
/*!****************************************************!*\
  !*** ./node_modules/style-loader/lib/addStyles.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getTarget = function (target) {
  return document.querySelector(target);
};

var getElement = (function (fn) {
	var memo = {};

	return function(target) {
                // If passing function in options, then use it for resolve "head" element.
                // Useful for Shadow Root style i.e
                // {
                //   insertInto: function () { return document.querySelector("#foo").shadowRoot }
                // }
                if (typeof target === 'function') {
                        return target();
                }
                if (typeof memo[target] === "undefined") {
			var styleTarget = getTarget.call(this, target);
			// Special case to return head of iframe instead of iframe itself
			if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[target] = styleTarget;
		}
		return memo[target]
	};
})();

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(/*! ./urls */ "./node_modules/style-loader/lib/urls.js");

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton && typeof options.singleton !== "boolean") options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
        if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else if (typeof options.insertAt === "object" && options.insertAt.before) {
		var nextSibling = getElement(options.insertInto + " " + options.insertAt.before);
		target.insertBefore(style, nextSibling);
	} else {
		throw new Error("[Style Loader]\n\n Invalid value for parameter 'insertAt' ('options.insertAt') found.\n Must be 'top', 'bottom', or Object.\n (https://github.com/webpack-contrib/style-loader#insertat)\n");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ "./node_modules/style-loader/lib/urls.js":
/*!***********************************************!*\
  !*** ./node_modules/style-loader/lib/urls.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
	// get current location
	var location = typeof window !== "undefined" && window.location;

	if (!location) {
		throw new Error("fixUrls requires window.location");
	}

	// blank or null?
	if (!css || typeof css !== "string") {
		return css;
	}

	var baseUrl = location.protocol + "//" + location.host;
	var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
 This regular expression is just a way to recursively match brackets within
 a string.
 	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
    (  = Start a capturing group
      (?:  = Start a non-capturing group
          [^)(]  = Match anything that isn't a parentheses
          |  = OR
          \(  = Match a start parentheses
              (?:  = Start another non-capturing groups
                  [^)(]+  = Match anything that isn't a parentheses
                  |  = OR
                  \(  = Match a start parentheses
                      [^)(]*  = Match anything that isn't a parentheses
                  \)  = Match a end parentheses
              )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
  \)  = Match a close parens
 	 /gi  = Get all matches, not the first.  Be case insensitive.
  */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function (fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl.trim().replace(/^"(.*)"$/, function (o, $1) {
			return $1;
		}).replace(/^'(.*)'$/, function (o, $1) {
			return $1;
		});

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/|\s*$)/i.test(unquotedOrigUrl)) {
			return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
			//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};

/***/ })

/******/ });
//# sourceMappingURL=main.js.map