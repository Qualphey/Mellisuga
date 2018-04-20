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
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const XHR = __webpack_require__(/*! ./xhr_async */ "./src/xhr_async.js");

var next_url = getParam("next_url");
if (next_url) {
  var next_url_input = document.createElement("input");
  next_url_input.type = "hidden";
  next_url_input.name = "next_url";
  next_url_input.value = next_url;

  var auth_form = document.getElementById("auth_form");
  auth_form.appendChild(next_url_input);
}

function getParam(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

let signin_form = document.getElementById("auth_form");
let err_msg_field = document.getElementById("err_msg_field");

signin_form.addEventListener('submit', (() => {
  var _ref = _asyncToGenerator(function* (e) {
    e.preventDefault();
    try {
      let formData = new FormData(signin_form);
      let send_data = {};
      for (let [key, value] of formData.entries()) {
        send_data[key] = value;
      }
      const response = yield XHR.post("/admin-auth", send_data);

      if (response.err) {
        err_msg_field.innerHTML = "Neteisingai įvestas e-pašto adresas arba slaptažodis!";
      } else if (response.next_url) {
        window.localStorage.setItem('access_token', response.access_token);
        window.location.replace(response.next_url);
      }
      console.log(response);
    } catch (e) {
      console.error(e);
    }
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})());

/***/ }),

/***/ "./src/xhr_async.js":
/*!**************************!*\
  !*** ./src/xhr_async.js ***!
  \**************************/
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

  static post(url, params) {
    return _asyncToGenerator(function* () {
      try {
        return yield new Promise(function (resolve) {
          if (params.formData) {
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
                resolve(JSON.parse(xhr.responseText));
              }
            };

            var json = JSON.stringify(params);
            var param_str = 'data=' + encodeURIComponent(json);
            xhr.send(param_str);
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

/***/ })

/******/ });
//# sourceMappingURL=main.js.map