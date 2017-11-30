'use strict'

const XHR = require('../utils/xhr.js');

module.exports = class {
  constructor() {
    var pages_edit = document.getElementById('pages_edit');
    var add_page = document.getElementById('add_page');

    XHR.get('/pages', null, function() {
      var pages = JSON.parse(this.responseText);
      for (var p = 0; p < pages.length; p++) {
        var page_element = document.createElement('a');
        page_element.classList.add('list_item');
        page_element.href = "/p/"+pages[p].data.uri;
        page_element.innerHTML = pages[p].data.name;
        pages_edit.insertBefore(page_element, add_page);
      }
    });

    var add_page_btn = document.getElementById("add_page");
    add_page_btn.addEventListener("click", new_page);

    function new_page(e) {
      var input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Title";
      add_page_btn.innerHTML = "";
      add_page_btn.appendChild(input);
      input.focus();
      input.addEventListener('keyup', function (e) {
        if (e.keyCode == 13) {
          var page = {
            name : input.value,
            uri : encodeURIComponent(input.value)+".html"
          }

          XHR.get(global.config.admin_path+'/new_page', page, function() {
            if (this.responseText === "success") {
              var page_element = document.createElement('a');
              page_element.classList.add('list_item');
              page_element.href = "/p/"+page.uri;
              page_element.innerHTML = page.name;
              pages_edit.insertBefore(page_element, add_page);
              input.value = '';
            }
          });
        }
      });
      add_page_btn.removeEventListener("click", new_page);
    }
  }

}
