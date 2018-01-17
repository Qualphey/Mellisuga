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
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 26);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = class {
  static get(url, params, callback) {
    if (params) {
      url += "?data="+encodeURIComponent(JSON.stringify(params));
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

      xhr.onreadystatechange = function() {//Call a function when the state changes.
        if(xhr.readyState == 4 && xhr.status == 200) {
          callback(xhr.responseText);
        }
      }

      var json = JSON.stringify(params);
      var param_str = 'data='+encodeURIComponent(json);
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
}


/***/ }),
/* 2 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
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
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
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
/* 3 */
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

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			var styleTarget = fn.call(this, selector);
			// Special case to return head of iframe instead of iframe itself
			if (styleTarget instanceof window.HTMLIFrameElement) {
				try {
					// This will throw an exception if access to iframe is blocked
					// due to cross-origin restrictions
					styleTarget = styleTarget.contentDocument.head;
				} catch(e) {
					styleTarget = null;
				}
			}
			memo[selector] = styleTarget;
		}
		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(9);

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
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */
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
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
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


/***/ }),
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(27)

const XHR = __webpack_require__(1);
const Editor = __webpack_require__(29);

const template = XHR.getParamByName('template');
const page = XHR.getParamByName('page');

var tools = document.createElement("div");
tools.classList.add("tools");
tools.innerHTML = __webpack_require__(52);
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


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(28);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(3)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!./theme.css", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!./theme.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "body {\n  overflow: hidden;\n}\n\n.tools {\n  position: fixed;\n  bottom: 0;\n  right: 100px;\n}\n\n.tools button {\n  width: 64px;\n  height: 32px;\n}\n\nbutton {\n  background-color: #222;\n  color: #FFF;\n  border: 1px solid #444;\n}\n\nbutton:hover {\n  background-color: #111;\n}\n\n.edit_switch {\n  display: inline-block;\n}\n", ""]);

// exports


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {const XHR = __webpack_require__(1);
const WindowUI = __webpack_require__(30);
const SplitUI = __webpack_require__(34);

__webpack_require__(37)

const Session = __webpack_require__(39);

module.exports = class {
  constructor(target, pathname, iframe) {
    this.window = new WindowUI({
      DOM: document.body,
      title: "Editor",
      resize_cb: function() {
        split.auto_resize();
      }
    });
    global.editor_window = this.window;
    this.window.content.style.overflow = "hidden";

    var split = this.split = new SplitUI(this.window.content, "horizontal");
    split.split(2);

    var global_local_switch = document.createElement("button");
    global_local_switch.innerHTML = "Global";
    global_local_switch.classList.add('global_local_switch');
    this.split.list[0].appendChild(global_local_switch);

    var local_session = new Session(target, pathname, iframe, pathname);
    this.append_session_elements(local_session);
    var global_session = new Session("globals", ".", iframe, pathname);

    var this_class = this;
    global_local_switch.addEventListener("click", function(e) {
      if (global_local_switch.innerHTML == "Global") {
        local_session.destroy();
        this_class.append_session_elements(global_session);
        global_local_switch.innerHTML = "Local";
      } else {
        global_session.destroy();
        this_class.append_session_elements(local_session);
        global_local_switch.innerHTML = "Global";
      }
    });
  }

  append_session_elements(session) {
    var treefm = session.treefm;
    var tabs = session.tabs;

    this.split.list[0].appendChild(treefm.element);
    this.split.list[1].style.overflow = "hidden";
    this.split.list[1].appendChild(tabs.element);
  }

  destroy() {
    this.window.destroy();
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {



__webpack_require__(31);
var html = __webpack_require__(33);


var min_width = 181;
var min_height = 65;

var init_width = 680;
var init_height = 360;

module.exports = class {
  constructor(cfg) {
    this.element = document.createElement("div");
    this.element.innerHTML = html;
    this.element.style.minWidth = min_width+"px";
    this.element.style.minHeight = min_height+"px";
    this.element.style.width = init_width+"px";
    this.element.style.height = init_height+"px";
    this.element.classList.add('window_mod');
    this.element.classList.add('container_rgb');
    cfg.DOM.appendChild(this.element);

    this.visible = true;
    this.DOM = cfg.DOM;
    this.resize_cb = cfg.resize_cb;

    var this_class = this;

    this.titlebar = this.element.querySelector('.window_mod_titlebar');
    this.titlebar.innerHTML = cfg.title;
    this.titlebar.addEventListener('mousedown', function(e) {
      if (!this_class.maximized) {
        window_mod_move(e);
      }
    });


    var minimize = this.element.querySelector('.window_mod_hide');
    minimize.addEventListener("click", function(e) {
      this_class.hide();
    });

    var maximize = this.element.querySelector('.window_mod_min_max_imize');
    maximize.addEventListener("click", function(e) {
      if (this_class.maximized) {
        this_class.minimize();
      } else {
        this_class.maximize();
      }
    });


    this.content = this.element.querySelector('.window_mod_content');

    this.resize_controls = this.element.querySelector('.window_mod_resize_controls');

    this.element.N = this.element.querySelector('.resizeN');
    this.element.NE = this.element.querySelector('.resizeNE');
    this.element.E = this.element.querySelector('.resizeE');
    this.element.SE = this.element.querySelector('.resizeSE');
    this.element.S = this.element.querySelector('.resizeS');
    this.element.SW = this.element.querySelector('.resizeSW');
    this.element.W = this.element.querySelector('.resizeW');
    this.element.NW = this.element.querySelector('.resizeNW');

    this.mouse_div = document.createElement('div');
    this.mouse_div.classList.add('mouse_div');

    cfg.DOM.appendChild(this.mouse_div);


    var fresh = true;
    function window_mod_init(win) {
      if (fresh) {
        this_class.element = win;

        fresh = false;
      }

    }

    function div_up(next) {
      let up_cb = function(e) {
        this_class.mouse_div.style.display = "none";
        next();
        this_class.mouse_div.removeEventListener('mouseup', up_cb);
      }

      this_class.mouse_div.addEventListener('mouseup', up_cb);
    }

    function window_mod_move(event) {
      var title = event.target;

      this_class.element.startX = event.clientX - this_class.element.offsetLeft;
      this_class.element.startY = event.clientY - this_class.element.offsetTop;
      document.documentElement.addEventListener('mousemove', drag);
      this_class.mouse_div.style.display = "block";
      div_up(stopDrag);

      function drag(e) {
        var eClientX = e.clientX;
        var eClientY = e.clientY;

        var nX = (eClientX - this_class.element.startX);
        var nX2 = nX + this_class.element.offsetWidth;

        if (nX < 0) nX = 0;
        if (nX2 > window.innerWidth) {
          nX = window.innerWidth - this_class.element.offsetWidth;
        }

        this_class.element.style.left = nX + 'px';

        var nY = (eClientY - this_class.element.startY);
        var nY2 = nY + this_class.element.offsetHeight;

        if (nY < 0) nY = 0;
        if (nY2 > window.innerHeight) {
          nY = window.innerHeight - this_class.element.offsetHeight;
        }

        this_class.element.style.top = nY + 'px';
      }

      function stopDrag(e) {
        console.log('stop');
        document.documentElement.removeEventListener('mousemove', drag);
      }

    }

    // RESZ

    var startX, startY, startWidth, startHeight, curTarget, curFollower;
    var make = function(target, directions, cb) {
      if (directions == '*') {
        makeN(target);
        makeNE(target);
        makeE(target);
        makeSE(target);
        makeS(target);
        makeSW(target);
        makeW(target);
        makeNW(target);
      } else if (Array.isArray(directions)) {
        directions.forEach(function(d) {
          switch (d) {
            case 'N':
              makeN(target);
              break;
            case 'NE':
              makeNE(target);
              break;
            case 'E':
              makeE(target);
              break;
            case 'SE':
              makeSE(target);
              break;
            case 'S':
              makeS(target);
              break;
            case 'SW':
              makeSW(target);
              break;
            case 'W':
              makeW(target);
              break;
            case 'NW':
              makeNW(target);
              break;
            default:
              console.log('cmResizable: Invalid direction: "'+d+'"');
              console.log('NW N NE');
              console.log('W  +  E');
              console.log('SW S SE');
          }
        });
      }

      var screen_padding = 10;

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeN(target) {
        var element = this_class.element.N;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop;
          startHeight = target.offsetHeight;
          document.documentElement.addEventListener('mousemove', dragN);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragN);
        });

        function dragN(e) {
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;

          var nHeight = (startHeight + startY - eClientY);
          if (nHeight > min_height) {
            curTarget.style.top = (startY + eClientY - startY) + 'px';
            curTarget.style.height = nHeight + 'px';
            if (curFollower) {
              curFollower.style.top = (startY + eClientY - startY) + 'px';
              curFollower.style.height = (startHeight + startY - eClientY) + 'px';
            }
          }

          cb();
        }

        function stopDragN(e) {
          document.documentElement.removeEventListener('mousemove', dragN);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeNE(target) {
        var element = this_class.element.NE;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop;
          startX = target.offsetLeft + target.offsetWidth;
          startHeight = target.offsetHeight;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragNE);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragNE);
        });

        function dragNE(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          if (eClientX > window.innerWidth-screen_padding) {
            eClientX = window.innerWidth;
          };
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;

          var nHeight = (startHeight + startY - eClientY);
          if (nHeight > min_height) {
            curTarget.style.top = (startY + eClientY - startY) + 'px';
            curTarget.style.height = (startHeight + startY - eClientY) + 'px';
            if (curFollower) {
              curFollower.style.top = (startY + eClientY - startY) + 'px';
              curFollower.style.height = (startHeight + startY - eClientY) + 'px';
            }
          }

          curTarget.style.width = (startWidth + eClientX - startX) + 'px';
          if (curFollower) {
            curFollower.style.width = (startWidth + eClientX - startX) + 'px';
          }

          cb();
        }

        function stopDragNE(e) {
          document.documentElement.removeEventListener('mousemove', dragNE);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeE(target) {
        var element = this_class.element.E;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startX = target.offsetLeft + target.offsetWidth;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragE);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragE);
        });

        function dragE(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          if (eClientX > window.innerWidth-screen_padding) {
            eClientX = window.innerWidth;
          };

          curTarget.style.width = (startWidth + eClientX - startX) + 'px';
          if (curFollower) {
            curFollower.style.width = (startWidth + eClientX - startX) + 'px';
          }
          cb();
        }

        function stopDragE(e) {
          document.documentElement.removeEventListener('mousemove', dragE);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeSE(target) {
        var element = this_class.element.SE;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop + target.offsetHeight;
          startX = target.offsetLeft + target.offsetWidth;
          startHeight = target.offsetHeight;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragSE);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragSE);
        });

        function dragSE(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          if (eClientX > window.innerWidth-screen_padding) {
            eClientX = window.innerWidth;
          };
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;
          if (eClientY > window.innerHeight-screen_padding) {
            eClientY = window.innerHeight;
          };

          curTarget.style.height = (startHeight + eClientY - startY) + 'px';
          curTarget.style.width = (startWidth + eClientX - startX) + 'px';
          if (curFollower) {
            curFollower.style.height = (startHeight + eClientY - startY) + 'px';
            curFollower.style.width = (startWidth + eClientX - startX) + 'px';
          }
          cb();
        }

        function stopDragSE(e) {
          document.documentElement.removeEventListener('mousemove', dragSE);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeS(target) {
        var element = this_class.element.S;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop + target.offsetHeight;
          startHeight = target.offsetHeight;
          document.documentElement.addEventListener('mousemove', dragS);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragS);
        });

        function dragS(e) {
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;
          if (eClientY > window.innerHeight-screen_padding) {
            eClientY = window.innerHeight;
          };

          curTarget.style.height = (startHeight + eClientY - startY) + 'px';
          if (curFollower) {
            curFollower.style.height = (startHeight + eClientY - startY) + 'px';
          }

          cb();
        }

        function stopDragS(e) {
          document.documentElement.removeEventListener('mousemove', dragS);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeSW(target) {
        var element = this_class.element.SW;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop + target.offsetHeight;
          startX = target.offsetLeft;
          startHeight = target.offsetHeight;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragSW);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragSW);
        });

        function dragSW(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;
          if (eClientY > window.innerHeight-screen_padding) {
            eClientY = window.innerHeight;
          };

          curTarget.style.height = (startHeight + eClientY - startY) + 'px';
          if (curFollower) {
            curFollower.style.height = (startHeight + eClientY - startY) + 'px';
          }

          var nWidth = (startWidth + startX - eClientX);
          if (nWidth > min_width) {
            curTarget.style.width = (startWidth + startX -eClientX) + 'px';
            curTarget.style.left = (startX + eClientX - startX) + 'px';
            if (curFollower) {
              curFollower.style.width = (startWidth + startX -eClientX) + 'px';
              curFollower.style.left = (startX + eClientX - startX) + 'px';
            }
          }

          cb();
        }

        function stopDragSW(e) {
          document.documentElement.removeEventListener('mousemove', dragSW);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeW(target) {
        var element = this_class.element.W;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startX = target.offsetLeft;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragW);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragW);
        });

        function dragW(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;

          var nWidth = (startWidth + startX - eClientX);
          if (nWidth > min_width) {
            curTarget.style.width = (startWidth + startX - eClientX) + 'px';
            curTarget.style.left = (startX + eClientX - startX) + 'px';
            if (curFollower) {
              curFollower.style.width = (startWidth + startX -eClientX) + 'px';
              curFollower.style.left = (startX + eClientX - startX) + 'px';
            }
          }
          cb();
        }

        function stopDragW(e) {
          document.documentElement.removeEventListener('mousemove', dragW);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeNW(target) {
        var element = this_class.element.NW;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop;
          startHeight = target.offsetHeight;
          startX = target.offsetLeft;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragNW);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragNW);
        });

        function dragNW(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;

          var nHeight = (startHeight + startY - eClientY);
          if (nHeight > min_height) {
            curTarget.style.top = (startY + eClientY - startY) + 'px';
            curTarget.style.height = (startHeight + startY - eClientY) + 'px';
            if (curFollower) {
              curFollower.style.top = (startY + eClientY - startY) + 'px';
              curFollower.style.height = (startHeight + startY - eClientY) + 'px';
            }
          }

          var nWidth = (startWidth + startX - eClientX);
          if (nWidth > min_width) {
            curTarget.style.width = (startWidth + startX -eClientX) + 'px';
            curTarget.style.left = (startX + eClientX - startX) + 'px';
            if (curFollower) {
              curFollower.style.width = (startWidth + startX -eClientX) + 'px';
              curFollower.style.left = (startX + eClientX - startX) + 'px';
            }
          }

          cb();
        }

        function stopDragNW(e) {
          document.documentElement.removeEventListener('mousemove', dragNW);
          curFollower = 0;
        }
      }
    }

    //+++ NodeList forEach hack.
    var arrayMethods = Object.getOwnPropertyNames( Array.prototype );

    arrayMethods.forEach( attachArrayMethodsToNodeList );

    function attachArrayMethodsToNodeList(methodName) {
      if(methodName !== 'length') {
        NodeList.prototype[methodName] = Array.prototype[methodName];
      }
    };

    //+++ isArray Check
    if (!Array.isArray) {
      Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      };
    }

    make(this_class.element, '*', cfg.resize_cb);
  }

  maximize() {
    if (!this.maximized) {
      this.mem_layout = {
        width: this.element.offsetWidth,
        height: this.element.offsetHeight,
        top: this.element.offsetTop,
        left: this.element.offsetLeft
      }
        console.log(this.mem_layout);

      this.element.style.width = "auto";
      this.element.style.height = "auto";
      this.element.style.top = 0;
      this.element.style.left = 0;
      this.element.style.right = 0;
      this.element.style.bottom = 0;

      this.element.removeChild(this.resize_controls);

      this.maximized = true;

      this.resize_cb();
    }
  }

  minimize() {
    if (this.maximized) {
      console.log(this.mem_layout);
      this.element.style.width = this.mem_layout.width+"px";
      this.element.style.height = this.mem_layout.height+"px";
      this.element.style.top = this.mem_layout.top+"px";
      this.element.style.left = this.mem_layout.left+"px";
      this.element.style.right = "auto";
      this.element.style.bottom = "auto";

      this.element.appendChild(this.resize_controls);

      this.resize_controls.style.display = "auto";

      this.maximized = false;

      this.resize_cb();
    }
  }

  dipslay() {
    if (!this.visible) {
      this.DOM.appendChild(this.element);
      this.visible = true;
    }
  }

  hide() {
    if (this.visible) {
      this.DOM.removeChild(this.element);
      this.visible = false;
    }
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(32);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(3)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./sheet.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./sheet.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, ".window_mod {\n  position: fixed;\n  top: 100px;\n  left: 100px;\n  padding: 0;\n\n  background-color: #000000dd;\n  border: 1px solid #333;\n\n  min-height: 150px;\n  min-width: 250px;\n}\n\n.window_mod header {\n  color: rgb(0, 201, 255);\n  height: 25px;\n  cursor: default;\n  -moz-user-select: none;\n  -khtml-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  line-height: 25px;\n}\n\n.window_mod_titlebar {\n  float:left;\n  line-height: 25px;\n  display: inline-block;\n  padding: 0px 10px;\n  height: 100%;\n  width: calc(100% - 72px);\n}\n\n.window_mod header .window_mod_actions {\n  display: inline-block;\n  vertical-align: middle;\n  margin-right: 10px;\n  height: 100%;\n  line-height: 25px;\n  float:right;\n}\n\n.window_mod header button {\n  display: inline-block;\n  background-color: #111;\n  color: #FFF;\n  border: 1px solid #333;\n  margin: 0;\n  padding: 0;\n  width: 18px;\n  height: 18px;\n}\n\n.window_mod header button:hover {\n  background-color: #050505;\n}\n\n.window_mod .window_mod_content {\n  height: calc(100% - 25px);\n  overflow: auto;\n}\n\n/* Resz */\n\n.resizeN {\n  cursor: n-resize;\n  width: calc(100% - 16px);\n  height: 10px;\n  top: -10px;\n  left: 8px;\n}\n\n.resizeNE {\n  cursor: ne-resize;\n  width: 20px;\n  height: 20px;\n  right: -10px;\n  top: -10px;\n}\n\n.resizeE {\n  cursor: e-resize;\n  width: 10px;\n  height: calc(100% - 16px);\n  right: -10px;\n  top: 8px;\n}\n\n.resizeSE {\n  cursor: se-resize;\n  width: 20px;\n  height: 20px;\n  right: -10px;\n  bottom: -10px;\n}\n\n.resizeS {\n  cursor: s-resize;\n  width: calc(100% - 16px);\n  height: 10px;\n  bottom: -10px;\n  left: 8px;\n}\n\n.resizeSW {\n  cursor: sw-resize;\n  width: 20px;\n  height: 20px;\n  left: -10px;\n  bottom: -10px;\n}\n\n.resizeW {\n  cursor: w-resize;\n  width: 10px;\n  height: calc(100% - 16px);\n  left: -10px;\n  top: 8px;\n}\n\n.resizeNW {\n  cursor: nw-resize;\n  width: 20px;\n  height: 20px;\n  left: -10px;\n  top: -10px;\n}\n\n.resize {\n  position: absolute;\n/*  background-color: red;*/\n  z-index: 1;\n}\n\n.mouse_div {\n  position: absolute;\n  left: 0; top: 0; right: 0; bottom: 0;\n  z-index: 99;\n\n  display: none;\n}\n", ""]);

// exports


/***/ }),
/* 33 */
/***/ (function(module, exports) {

module.exports = "<header class=\"window_mod_header\">\n  <div class=\"window_mod_titlebar\">New Window</div>\n  <div class=\"window_mod_actions\">\n    <button class=\"window_mod_hide\">-</button>\n    <button class=\"window_mod_min_max_imize\">+</button>\n  </div>\n</header>\n<div class=\"window_mod_content\">\n\n</div>\n\n<div class=\"window_mod_resize_controls\">\n  <div class=\"resizeN resize\"></div>\n  <div class=\"resizeNE resize\"></div>\n  <div class=\"resizeE resize\"></div>\n  <div class=\"resizeSE resize\"></div>\n  <div class=\"resizeS resize\"></div>\n  <div class=\"resizeSW resize\"></div>\n  <div class=\"resizeW resize\"></div>\n  <div class=\"resizeNW resize\"></div>\n</div>\n";

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(35);

module.exports = class {
  constructor(dom, direction) {
    this.element = document.createElement("div");
    this.element.classList.add("split_ui");
    dom.appendChild(this.element);

    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    this.min_piece_width = 50;
    this.min_piece_height = 50;

    this.list = [];
    this.direction = direction;
  }

  split(pieces) {
    if (this.direction == "horizontal") {
      this.pieces = pieces;
      var split_div_width = Math.floor(this.width/pieces);
      for (var p = 0; p < pieces; p++) {
        var piece_width = split_div_width;
        if (p > 0) {
          let resize_line = document.createElement("div");
          resize_line.classList.add("split_ui_horizontal_line");
          this.element.appendChild(resize_line);
          piece_width -= 3;

          var startX;

          var this_class = this;

          resize_line.addEventListener("mousedown", function(e) {
            startX = e.clientX;
            this_class.element.addEventListener('mousemove', resize_drag);
          });

          this.element.addEventListener('mouseup', function(e) {
            this_class.element.removeEventListener('mousemove', resize_drag);
          });

          function resize_drag(e) {
            var deltaX = e.clientX-startX;
            startX = e.clientX;

            var target_left = resize_line.previousSibling;
            var target_right = resize_line.nextSibling;
            if (target_left.offsetWidth+deltaX > 0 && target_right.offsetWidth-deltaX > 0) {
              var left_width = target_left.offsetWidth+deltaX;
              var right_width_dec = 0;
              if (left_width < this_class.min_piece_width) {
                right_width_dec = this_class.min_piece_width-left_width;
                left_width = this_class.min_piece_width;
              }

              var right_width = target_right.offsetWidth-deltaX;
              var left_width_dec = 0;
              if (right_width < this_class.min_piece_width) {
                left_width_dec = this_class.min_piece_width-right_width;
                right_width = this_class.min_piece_width;
              }

              target_left.style.width = left_width-left_width_dec+"px";
              target_right.style.width = right_width-right_width_dec+"px";
            } else {
              startX -= deltaX;
            }
          }
        }
        var split_div = document.createElement("div");
        split_div.classList.add("split_ui_horizontal");
        split_div.style.width = piece_width+"px";
        this.element.appendChild(split_div);
        this.list.push(split_div);
      }
    }
  }

  auto_resize() {
    var old_width = this.width;
    this.width = this.element.offsetWidth;
    var delta_width = this.width - old_width;
    this.height = this.element.offsetHeight;

    if (this.direction == "horizontal") {
      var piece_delta_width = delta_width/this.pieces;
      var next_delta = 0;
      for (var p = 0; p < this.pieces; p++) {
        var new_width;
        if (piece_delta_width > 0) {
          if (p == this.pieces-1) {
            new_width = this.list[p].offsetWidth+Math.ceil(piece_delta_width);
          } else {
            new_width = this.list[p].offsetWidth+Math.floor(piece_delta_width);
          }
        } else if (piece_delta_width < 0) {
          if (p == this.pieces-1) {
            new_width = this.list[p].offsetWidth+Math.floor(piece_delta_width);
          } else {
            new_width = this.list[p].offsetWidth+Math.ceil(piece_delta_width);
          }
        } else {
          new_width = this.list[p].offsetWidth;
        }

        this.list[p].style.width = new_width+"px";

        if (new_width < this.min_piece_width) {
          next_delta = this.min_piece_width-new_width;
          new_width = this.min_piece_width;
          this.list[p].style.width = new_width+"px";
        } else {
          this.list[p].style.width = new_width-next_delta+"px";
          next_delta = 0;
        }
      }

      if (next_delta > 0) {
        for (var p = 0; p < this.pieces; p++) {
          var new_width = this.list[p].offsetWidth-next_delta;

          if (new_width < this.min_piece_width) {
            next_delta = this.min_piece_width-new_width;
            new_width = this.min_piece_width;
            this.list[p].style.width = new_width+"px";
          } else {
            this.list[p].style.width = new_width+"px";
            next_delta = 0;
            break;
          }
        }
      }
    }
  }
}


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(36);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(3)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./theme.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./theme.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.split_ui {\n  width: 100%;\n  height: 100%;\n}\n\n.split_ui_horizontal {\n  display: inline-block;\n  overflow: auto;\n  height: 100%;\n}\n\n.split_ui_horizontal_line {\n  display: inline-block;\n  background-color: #000;\n  width: 3px;\n  height: 100%;\n  cursor: col-resize;\n}\n", ""]);

// exports


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(38);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(3)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./theme.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./theme.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, "\n.treefm {\n  height: calc(100% - 34px);\n}\n\n.global_local_switch {\n  height: 30px;\n}\n", ""]);

// exports


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {


const TreeFM = __webpack_require__(40);
const TabsUI = __webpack_require__(47);
const CodeMirror = __webpack_require__(51);

const template_prefix = "/cmb_admin/t/";
const page_prefix = "/p/";

module.exports = class {
  constructor(target, pathname, iframe, refresh_path) {
    var tabs = this.tabs = new TabsUI();

    var last_save_callback = false;

    var dir = pathname;

    if (dir.startsWith(template_prefix)) {
      dir = dir.substring(template_prefix.length);
    } else if (dir.startsWith(page_prefix)) {
      dir = dir.substring(page_prefix.length);
    }



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
                  iframe.contentWindow.location.replace(refresh_path);
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


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

const XHR = __webpack_require__(1);
const Dir = __webpack_require__(41);
const ContextMenu = __webpack_require__(43);
__webpack_require__(45);


module.exports = class {
  constructor(cfg) {
    this.element = document.createElement("div");
    this.element.classList.add("treefm");
    this.file_cb = cfg.file_cb;

    this.target = cfg.target;
    this.dir = cfg.dir;

    this.contextmenu = new ContextMenu();

    var this_class = this;

    console.log(cfg.target, cfg.dir);
    XHR.get('treefm.io', {
      target: cfg.target,
      command: "read",
      path: cfg.dir
    }, function() {
      var dir_tree = JSON.parse(this.responseText);
      dir_tree.root = true;
      dir_tree.padding_index = 0;
      var root_dir = new Dir(dir_tree, this_class);
      this_class.element.appendChild(root_dir.element);
    });
  }

  read_file(file_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "read",
      path: file_path
    }, function() {
      var file_content = JSON.parse(this.responseText);
      cb(file_content);
    });
  }

  write_file(file_path, content, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "write",
      path: file_path,
      data: content
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  upload_files(formData, cb) {
    XHR.post('treefm.io', {
      formData: formData
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  rm_file(file_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "rm",
      path: file_path
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  mkdir(file_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "mkdir",
      path: file_path
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  rm_dir(file_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "rmdir",
      path: file_path
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  rename(file_path, new_path, cb) {
    XHR.get('treefm.io', {
      target: this.target,
      command: "rename",
      path: file_path,
      data: new_path
    }, function() {
      var response = JSON.parse(this.responseText);
      if (response == "success") {
        cb();
      };
    });
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {const File = __webpack_require__(42);

var padding_left = 10;

var Dir = module.exports = class {
  constructor(data, treefm) {
    this.element = document.createElement('div');
    this.path = data.rel_path;
    this.name = data.name;
    this.padding_index = data.padding_index;

    var this_class = this;

    var name_div = document.createElement("div");
    name_div.classList.add("treefm_item");
    name_div.innerHTML = "▹ "+data.name;
    name_div.style.paddingLeft = this.padding_index*padding_left+padding_left+"px";

    name_div.addEventListener("click", function(e) {
      if (content_div.displayed) {
        var str = name_div.innerHTML;
        name_div.innerHTML = "▹ "+str.substring(2);
        content_div.style.display = "none";
        content_div.displayed = false;
      } else {
        var str = name_div.innerHTML;
        name_div.innerHTML = "▿ "+str.substring(2);
        content_div.style.display = "block";
        content_div.displayed = true;
      }
    });

    name_div.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      var callbacks = {
        new_file: function() {
          content_div.style.display = "block";
          content_div.displayed = true;

          var name_input = document.createElement("input");
          name_input.type = "text";
          name_input.placeholder = "new file name";
          content_div.appendChild(name_input);
          name_input.focus();
          treefm.contextmenu.hide();
          name_input.addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
              var file_path = this_class.path+"/"+name_input.value;
              treefm.write_file(file_path, "", function() {
                var new_file = new File({
                  name: name_input.value,
                  rel_path: this_class.path+"/"+name_input.value,
                  padding_index: this_class.padding_index+1,
                  type: "txt"
                }, treefm);
                content_div.replaceChild(new_file.element, name_input);
              });
            }
          });
        },
        new_folder: function() {
          content_div.style.display = "block";
          content_div.displayed = true;

          var name_input = document.createElement("input");
          name_input.type = "text";
          name_input.placeholder = "new folder name";
          content_div.appendChild(name_input);
          name_input.focus();
          treefm.contextmenu.hide();
          name_input.addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
              var file_path = this_class.path+"/"+name_input.value;
              treefm.mkdir(file_path, function() {
                var new_file = new Dir({
                  name: name_input.value,
                  rel_path: this_class.path+"/"+name_input.value,
                  type: "dir",
                  padding_index: this_class.padding_index+1,
                  content: []
                }, treefm);
                content_div.replaceChild(new_file.element, name_input);
              });
            }
          });
        },
        upload: function() {
          treefm.contextmenu.hide();

          var form = document.createElement('form');
          form.enctype = "multipart/form-data";
          this_class.element.appendChild(form);

          var target_input = document.createElement("input");
          target_input.type = "hidden";
          target_input.name = "target";
          target_input.value = treefm.target;
          form.appendChild(target_input);

          var path_input = document.createElement("input");
          path_input.type = "hidden";
          path_input.name = "path";
          path_input.value = this_class.path;
          form.appendChild(path_input);

          var upload_input = document.createElement("input");
          upload_input.type = "file";
          upload_input.name = "filei";
          upload_input.multiple = "multiple";
          upload_input.style.display = "none";
          form.appendChild(upload_input);

          upload_input.click();
          upload_input.addEventListener("change", function(e) {
            var files = this.files;

            var formData = new FormData(form);

            for (var [key, value] of formData.entries()) {
              console.log(key, value);
            }

            treefm.upload_files(formData, function() {
              for (var f = 0; f < files.length; f++) {
                var new_file = new File({
                  name: files[f].name,
                  rel_path: this_class.path+"/"+files[f].name,
                  padding_index: this_class.padding_index+1,
                  type: files[f].type
                }, treefm);
                content_div.appendChild(new_file.element);
              }
            });
          }, false);
        },
        rename: function() {
          treefm.contextmenu.hide();
          var name_input = document.createElement("input");
          name_input.type = "text";
          name_input.value = this_class.name;
          this_class.element.replaceChild(name_input, name_div);
          name_input.focus();
          name_input.addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
              var dir_arr = this_class.path.split('/');
              dir_arr.pop();
              var file_path = dir_arr.join('/')+"/"+name_input.value;
              treefm.rename(this_class.path, file_path, function() {
                name_div.innerHTML = name_input.value;
                this_class.element.replaceChild(name_div, name_input);
              });
            }
          });
        },
        delete: function() {
          treefm.contextmenu.hide();
          treefm.rm_dir(this_class.path, function() {
            this_class.element.parentNode.removeChild(this_class.element);
          });
        }
      };
      if (data.root) {
        callbacks["rename"] = false;
        callbacks["delete"] = false;
      }
      treefm.contextmenu.display(e.clientX, e.clientY, callbacks);

      global.editor_window.element.addEventListener("click", hide_contextmenu);

      function hide_contextmenu(e) {
        treefm.contextmenu.hide();
        global.editor_window.element.removeEventListener("click", hide_contextmenu);
      }
    });
    this.element.appendChild(name_div);

    var content_div = document.createElement("div");
    content_div.displayed = false;
    content_div.classList.add("treefm_dir_content");
    for (var f = 0; f < data.content.length; f++) {
      let child_file = data.content[f];
      if (child_file.type == "dir") {
        child_file.padding_index = this_class.padding_index+1;
        var child_dir = new Dir(child_file, treefm);
        content_div.appendChild(child_dir.element);
      } else if (child_file.type == "txt") {
        child_file.padding_index = this_class.padding_index+1;
        var file = new File(child_file, treefm);
        content_div.appendChild(file.element);
      } else {
        console.error("TreeFM: Unknown file type", child_file.type);
      }
    }

    if (data.root) {
      var str = name_div.innerHTML;
      name_div.innerHTML = "▿ "+str.substring(2);
      content_div.style.display = "block";
      content_div.displayed = true;
    }

    this.element.appendChild(content_div);
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {
var padding_left = 10;

module.exports = class {
  constructor(data, treefm) {
    this.path = data.rel_path;
    this.name = data.name;
    this.padding_index = data.padding_index;

    this.element = document.createElement("div");
    this.element.innerHTML = "⋄ "+data.name;
    this.element.style.paddingLeft = this.padding_index*padding_left+padding_left+"px";
    this.element.classList.add("treefm_item");
    this.element.addEventListener("click", function(e) {
      treefm.file_cb(data);
    });

    var this_class = this;
    this.element.addEventListener('contextmenu', function(e) {
      e.preventDefault();

      var callbacks = {
        new_file: false,
        new_folder: false,
        rename: function() {
          treefm.contextmenu.hide();
          var name_input = document.createElement("input");
          name_input.type = "text";
          name_input.value = this_class.name;
          this_class.element.parentNode.replaceChild(name_input, this_class.element);
          name_input.focus();
          name_input.addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
              var dir_arr = this_class.path.split('/');
              dir_arr.pop();
              var file_path = dir_arr.join('/')+"/"+name_input.value;
              treefm.rename(this_class.path, file_path, function() {
                this_class.element.innerHTML = name_input.value;
                name_input.parentNode.replaceChild(this_class.element, name_input);
              });
            }
          });
        },
        delete: function() {
          treefm.contextmenu.hide();
          treefm.rm_file(this_class.path, function() {
            this_class.element.parentNode.removeChild(this_class.element);
          });
        }
      };

      treefm.contextmenu.display(e.clientX, e.clientY, callbacks);

      global.editor_window.element.addEventListener("click", hide_contextmenu);

      function hide_contextmenu(e) {
        treefm.contextmenu.hide();
        global.editor_window.element.removeEventListener("click", hide_contextmenu);
      }
    });
  }
}

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(0)))

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

var html = __webpack_require__(44);

module.exports = class {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add("treefm_contexmenu");
    document.body.appendChild(this.element);
  }

  display(x, y, callbacks) {
    console.log(callbacks);
    this.element.innerHTML = html;

    for (let name in callbacks) {
      var item = this.element.querySelector('div[name="'+name+'"]');
      if (!callbacks[name]) {
        item.style.display = "none";
      } else {
        item.addEventListener("click", function(e) {
          callbacks[name]();
        });
      }
    }

    this.element.style.display = "block";
    this.element.style.left = x+"px";
    this.element.style.top = y+"px";
  }

  hide() {
    this.element.style.display = "none";
  }
}


/***/ }),
/* 44 */
/***/ (function(module, exports) {

module.exports = "<div name=\"new_file\">New File</div>\n<div name=\"new_folder\">New Folder</div>\n<div name=\"upload\">Upload</div>\n<div name=\"rename\">Rename</div>\n<div name=\"delete\">Delete</div>\n";

/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(46);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(3)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./style.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, ".treefm {\n  background-color: #111;\n  font-size: 14px;\n  padding: 2px;\n  user-select: none;\n}\n\n.treefm_dir_content {\n  display: none;\n}\n\n.treefm_item {\n  color: #DDD;\n  padding: 2px 10px;\n  white-space: nowrap;\n}\n\n.treefm_item:hover, .treefm_contexmenu div:hover {\n  background-color: #1C1C1C;\n  cursor: default;\n}\n\n.treefm_contexmenu {\n  display: none;\n  position: fixed;\n  background-color: #090909;\n  color: #DDD;\n  cursor: default;\n  font-size: 15px;\n  z-index: 2;\n}\n\n.treefm_contexmenu div {\n  padding: 2px 10px;\n}\n", ""]);

// exports


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(48);

var Tab = __webpack_require__(50);

module.exports = class {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('tabs_ui_container');

    this.menu = document.createElement('div');
    this.menu.classList.add('tabs_ui_menu');
    this.element.appendChild(this.menu);

    this.display_div = document.createElement('div');
    this.display_div.classList.add('tabs_ui_display');
    this.display_div.style.height = "calc(100% - 21px)";
    this.element.appendChild(this.display_div);

    this.list = [];
  }

  add(data) {
    var tab = new Tab(data, this);
    this.menu.appendChild(tab.element);
    this.list.push(tab);
    tab.display();
  }

  remove(tab) {
    this.menu.removeChild(tab.element);
    this.list.splice(this.list.indexOf(tab), 1);
    if (tab.element == this.displayed_tab) {
      if (this.list.length > 0) {
        this.display(this.list[this.list.length-1]);
      } else {
        this.display_div.innerHTML = "";
      }
    }
  }

  select(id) {
    var result = false;
    for (var t = 0; t < this.list.length; t++) {
      if (this.list[t].id == id) {
        result = this.list[t];
        break;
      }
    }
    return result;
  }

  display(tab) {
    var this_class = this;
    tab.cb(function() {
      if (this_class.displayed_tab) {
        this_class.displayed_tab.classList.remove("tabs_ui_selected");
      }
      this_class.displayed_tab = tab.element;
      this_class.displayed_tab.classList.add("tabs_ui_selected");

      this_class.display_div.innerHTML = "";
      return this_class.display_div;
    }());
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(49);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {"hmr":true}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(3)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js!./horz.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js!./horz.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(false);
// imports


// module
exports.push([module.i, ".tabs_ui_container {\n  height: 100%;\n}\n\n.tabs_ui_container .tabs_ui_menu {\n  display: block;\n  margin: 0 auto;\n  list-style-type: none;\n  padding: 0;\n}\n\n.tabs_ui_display {\n  overflow: auto;\n}\n\n.tabs_ui_menu_item {\n  display: inline-block;\n  background-color: #111;\n  color: #DDD;\n\n  cursor: default;\n\n  -webkit-touch-callout: none; /* iOS Safari */\n  -webkit-user-select: none; /* Safari */\n   -khtml-user-select: none; /* Konqueror HTML */\n     -moz-user-select: none; /* Firefox */\n      -ms-user-select: none; /* Internet Explorer/Edge */\n          user-select: none; /* Non-prefixed version, currently\n                                supported by Chrome and Opera */\n}\n\n.tabs_ui_menu_item div {\n  display: inline-block;\n  padding: 3px 10px;\n  font-size: 14px;\n}\n\n.tabs_ui_menu_item button {\n  display: inline-block;\n  padding: 3px 5px;\n  font-size: 14px;\n  border: 0;\n  color: #DDD;\n  background-color: transparent;\n}\n\n.tabs_ui_menu_item div:hover, .tabs_ui_menu_item button:hover {\n  background-color: #222;\n}\n\n.tabs_ui_selected {\n  background-color: #151515;\n}\n", ""]);

// exports


/***/ }),
/* 50 */
/***/ (function(module, exports) {



module.exports = class {
  constructor(data, tabs) {
    this.id = data.id;
    this.cb = data.cb;
    this.tabs = tabs;

    this.element = document.createElement('div');
    this.element.classList.add("tabs_ui_menu_item");

    var text = document.createElement('div');
    text.innerHTML = data.text;
    this.element.appendChild(text);

    var this_class = this;

    text.addEventListener("click", function(e) {
      this_class.display();
    });

    var close = document.createElement('button');
    close.innerHTML = "⨯";
    this.element.appendChild(close);

    close.addEventListener("click", function(e) {
      this_class.tabs.remove(this_class);
    });
  }

  display() {
    this.tabs.display(this);
  }
}


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//require("./style.css");

var XHR = __webpack_require__(1);

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


/***/ }),
/* 52 */
/***/ (function(module, exports) {

module.exports = "<button class=\"editor_btn\">&lt;&sol;&gt;</button>\n";

/***/ })
/******/ ]);
//# sourceMappingURL=edit.js.map