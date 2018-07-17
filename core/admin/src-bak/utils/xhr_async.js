'use strict'

module.exports = class {
  static async get(url, params) {
    try {
      return await new Promise(function (resolve) {
        if (params) {
          url += "?data="+encodeURIComponent(JSON.stringify(params));
        }

        var xhr = new XMLHttpRequest();

        xhr.addEventListener("load", function() {
          resolve(JSON.parse(this.responseText));
        });
        xhr.open("GET", url);
        xhr.send();
      });
    } catch(e) {
      console.error(e);
      return undefined;
    }
  }

  static async post(url, params) {
    try {
      return await new Promise(function (resolve) {
        if (params.formData) {
          console.log("FORM DATA");
          var xhr = new XMLHttpRequest();
          xhr.open("POST", url);
        //  xhr.setRequestHeader("Content-Type","multipart/form-data");
          xhr.send(params.formData);
          xhr.addEventListener("load", function() {
            resolve(JSON.parse(xhr.responseText));
          });
          console.log(url);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open("POST", url, true);

          //Send the proper header information along with the request
          xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

          xhr.onreadystatechange = function() {//Call a function when the state changes.
            if(xhr.readyState == 4 && xhr.status == 200) {
              try {
                let obj = JSON.parse(xhr.responseText)
                resolve(obj);
              } catch (e) {
                resolve(xhr.responseText);
              }
            }
          }

          const token = localStorage.getItem("access_token");

          if (token) {
            var json = JSON.stringify(params);
            var param_str = 'data='+encodeURIComponent(json)+'&access_token='+token;
            xhr.send(param_str);
          } else {
            console.error("Token not found");
            resolve(undefined);
          }
        }
      });
    } catch(e) {
      console.error(e);
      return undefined;
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
