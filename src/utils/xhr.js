'use strict'

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
