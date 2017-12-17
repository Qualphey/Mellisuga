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
/******/ 	return __webpack_require__(__webpack_require__.s = 29);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
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

  static getParamByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  static post(url, params, callback) {
    var http = new XMLHttpRequest();
    http.open("POST", url, true);

    //Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {//Call a function when the state changes.
      if(http.readyState == 4 && http.status == 200) {
        callback(http.responseText);
      }
    }

    var json = JSON.stringify(params);
    var param_str = 'data='+encodeURIComponent(json);
    http.send(param_str);
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

var	fixUrls = __webpack_require__(10);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

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
/* 9 */,
/* 10 */
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
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//require("./style.css");

var XHR = __webpack_require__(1);

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


/***/ }),
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
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(30)

var XHR = __webpack_require__(1);

var tools = document.createElement("div");
tools.classList.add("tools");
tools.innerHTML = __webpack_require__(32);
document.body.appendChild(tools);

var WindowUI = __webpack_require__(33);
var html_win = new WindowUI({
  DOM: document.body,
  title: "HTML editor"
});

var HTMLEdit = __webpack_require__(14);
var html_editor = new HTMLEdit(html_win.content);

var html_btn = tools.querySelector(".html_btn");
html_btn.addEventListener("click", function(e) {
  if (html_win.visible) {
    html_win.hide();
  } else {
    html_win.dipslay();
  }
});

var TabsUI = __webpack_require__(37);
var tabs = new TabsUI();

var ContextEdit = __webpack_require__(40);
var context = new ContextEdit(tabs.display);

var HTMLEdit = __webpack_require__(14);
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


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(31);
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
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(undefined);
// imports


// module
exports.push([module.i, "body {\n  overflow: hidden;\n}\n\n.tools {\n  position: fixed;\n  bottom: 0;\n  right: 100px;\n}\n\n.tools button {\n  background-color: #222;\n  color: #FFF;\n  border: 1px solid #444;\n  width: 64px;\n  height: 32px;\n}\n\n.tools button:hover {\n  background-color: #111;\n}\n\n.edit_switch {\n  display: inline-block;\n}\n", ""]);

// exports


/***/ }),
/* 32 */
/***/ (function(module, exports) {

module.exports = "<button class=\"html_btn\">&lt;&sol;&gt;</button>\n<button>.json</button>\n<button>.css</button>\n<button>{js}</button>\n";

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {



__webpack_require__(34);
var html = __webpack_require__(36);


var min_width = 181;
var min_height = 65;

module.exports = class {
  constructor(cfg) {
    this.element = document.createElement("div");
    this.element.innerHTML = html;
    this.element.style.minWidth = min_width+"px";
    this.element.style.minHeight = min_height+"px";
    this.element.classList.add('window_mod');
    this.element.classList.add('container_rgb');
    cfg.DOM.appendChild(this.element);

    this.visible = true;
    this.DOM = cfg.DOM;

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

    make(this_class.element, '*', function() {

    });
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
}


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(35);
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
		module.hot.accept("!!../../../../node_modules/css-loader/index.js!./sheet.css", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js!./sheet.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(undefined);
// imports


// module
exports.push([module.i, ".window_mod {\n  position: fixed;\n  top: 100px;\n  left: 100px;\n  padding: 0;\n\n  background-color: #000000dd;\n  border: 1px solid #333;\n\n  min-height: 150px;\n  min-width: 250px;\n}\n\n.window_mod header {\n  color: rgb(0, 201, 255);\n  height: 25px;\n  cursor: default;\n  -moz-user-select: none;\n  -khtml-user-select: none;\n  -webkit-user-select: none;\n  -ms-user-select: none;\n  user-select: none;\n  line-height: 25px;\n}\n\n.window_mod_titlebar {\n  float:left;\n  line-height: 25px;\n  display: inline-block;\n  padding: 0px 10px;\n  height: 100%;\n  width: calc(100% - 72px);\n}\n\n.window_mod header .window_mod_actions {\n  display: inline-block;\n  vertical-align: middle;\n  margin-right: 10px;\n  height: 100%;\n  line-height: 25px;\n  float:right;\n}\n\n.window_mod header button {\n  display: inline-block;\n  background-color: #111;\n  color: #FFF;\n  border: 1px solid #333;\n  margin: 0;\n  padding: 0;\n  width: 18px;\n  height: 18px;\n}\n\n.window_mod header button:hover {\n  background-color: #050505;\n}\n\n.window_mod .window_mod_content {\n  height: calc(100% - 25px);\n  overflow: auto;\n}\n\n/* Resz */\n\n.resizeN {\n  cursor: n-resize;\n  width: calc(100% - 16px);\n  height: 10px;\n  top: -10px;\n  left: 8px;\n}\n\n.resizeNE {\n  cursor: ne-resize;\n  width: 20px;\n  height: 20px;\n  right: -10px;\n  top: -10px;\n}\n\n.resizeE {\n  cursor: e-resize;\n  width: 10px;\n  height: calc(100% - 16px);\n  right: -10px;\n  top: 8px;\n}\n\n.resizeSE {\n  cursor: se-resize;\n  width: 20px;\n  height: 20px;\n  right: -10px;\n  bottom: -10px;\n}\n\n.resizeS {\n  cursor: s-resize;\n  width: calc(100% - 16px);\n  height: 10px;\n  bottom: -10px;\n  left: 8px;\n}\n\n.resizeSW {\n  cursor: sw-resize;\n  width: 20px;\n  height: 20px;\n  left: -10px;\n  bottom: -10px;\n}\n\n.resizeW {\n  cursor: w-resize;\n  width: 10px;\n  height: calc(100% - 16px);\n  left: -10px;\n  top: 8px;\n}\n\n.resizeNW {\n  cursor: nw-resize;\n  width: 20px;\n  height: 20px;\n  left: -10px;\n  top: -10px;\n}\n\n.resize {\n  position: absolute;\n/*  background-color: red;*/\n  z-index: 1;\n}\n\n.mouse_div {\n  position: absolute;\n  left: 0; top: 0; right: 0; bottom: 0;\n  z-index: 99;\n\n  display: none;\n}\n", ""]);

// exports


/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = "<header class=\"window_mod_header\">\n  <div class=\"window_mod_titlebar\">New Window</div>\n  <div class=\"window_mod_actions\">\n    <button class=\"window_mod_hide\">-</button>\n    <button class=\"window_mod_min_max_imize\">+</button>\n  </div>\n</header>\n<div class=\"window_mod_content\">\n\n</div>\n\n<div class=\"window_mod_resize_controls\">\n  <div class=\"resizeN resize\"></div>\n  <div class=\"resizeNE resize\"></div>\n  <div class=\"resizeE resize\"></div>\n  <div class=\"resizeSE resize\"></div>\n  <div class=\"resizeS resize\"></div>\n  <div class=\"resizeSW resize\"></div>\n  <div class=\"resizeW resize\"></div>\n  <div class=\"resizeNW resize\"></div>\n</div>\n";

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(38);

module.exports = function() {

  this.element = document.createElement('div');
  this.element.classList.add('tabs_ui_container');

  var list = this.list = document.createElement('div');
  list.classList.add('tabs_ui_menu');
  this.element.appendChild(list);

  var display = this.display = document.createElement('div');
  display.classList.add('tabs_ui_display');
  display.style.height = "calc(100% - 15px)";
  this.element.appendChild(display);

  this.set = function(pages) {
    this.pages = pages;
    for (p=0;p<pages.length;p++) {
      let page = pages[p];

      var item = document.createElement('button');
      item.innerHTML = page.text;
      item.addEventListener("click", function(e) {
        page.cb(function(element) {
          display.innerHTML = "";
          return display;
        }());
      });

      list.appendChild(item);
    }
  };
}


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(39);
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
		module.hot.accept("!!../../../../node_modules/css-loader/index.js!./horz.css", function() {
			var newContent = require("!!../../../../node_modules/css-loader/index.js!./horz.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(2)(undefined);
// imports


// module
exports.push([module.i, ".tabs_ui_container {\n  height: 100%;\n}\n\n.tabs_ui_container .tabs_ui_menu {\n  display: block;\n  margin: 0 auto;\n  list-style-type: none;\n  padding: 0;\n}\n\n.tabs_ui_display {\n  overflow: auto;\n}\n\n.tabs_ui_container .tabs_ui_menu button {\n  display: inline-block;\n  text-align: center;\n  text-decoration: none;\n  cursor: pointer;\n\n  -webkit-touch-callout: none; /* iOS Safari */\n  -webkit-user-select: none; /* Safari */\n   -khtml-user-select: none; /* Konqueror HTML */\n     -moz-user-select: none; /* Firefox */\n      -ms-user-select: none; /* Internet Explorer/Edge */\n          user-select: none; /* Non-prefixed version, currently\n                                supported by Chrome and Opera */\n}\n", ""]);

// exports


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


//require("./style.css");

var XHR = __webpack_require__(1);

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


/***/ })
/******/ ]);
//# sourceMappingURL=edit.js.map