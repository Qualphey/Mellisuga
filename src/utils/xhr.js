'use strict'

module.exports = class {
  static get(url, params, callback) {
    url += '?';
    var first = true;
    for (var key in params) {
      if (!first) url += '&';
      url += key+'='+encodeURIComponent(params[key]);
      first = false;
    }

    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", callback);
    xhr.open("GET", url);
    xhr.send();
  }
}
