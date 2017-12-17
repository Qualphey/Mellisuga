'use strict'

const XHR = require('../utils/xhr.js');
const Page = require('./page.js');


var DynTable = require('../dyn_table.ui/index.js');

require('./style.less');
var html = require('./body.html');

module.exports = class {
  constructor(div) {
    div.innerHTML = html;
    div.classList.add('pages');

    this.list = div.querySelector(".list_display");

    var table = new DynTable();
    this.list.appendChild(table.element);

    var this_class = this;
    XHR.get('/pages', null, function() {
      var pages = JSON.parse(this.responseText);


      for (let p = 0; p < pages.length; p++) {
        var page = new Page(pages[p], table);
        table.add(page.element);
      }

      var add_page_btn = document.createElement("div");
      add_page_btn.classList.add("list_item");
      add_page_btn.classList.add("add_item");
      add_page_btn.addEventListener("click", new_page);
      table.add(add_page_btn);

      var text = document.createElement("h3");
      text.innerHTML = "++";
      add_page_btn.appendChild(text);

      function new_page(e) {
        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Title";
        add_page_btn.innerHTML = "";
        add_page_btn.appendChild(input);
        input.focus();
        input.addEventListener('keyup', function (e) {
          if (e.keyCode == 13) {
            var data = {
              title: input.value
            }

            XHR.get(global.config.admin_path+'/new_page', data, function() {
              var res = JSON.parse(this.responseText);
              if (res.err) {
                console.log(res.err);
              } else {
                var page = new Page({
                  id: res.id,
                  data: {
                    title: data.title,
                    uri: encodeURIComponent(input.value)+".html",
                    context_uri: encodeURIComponent(input.value)+".json"
                  }
                }, table);

                table.remove(add_page_btn);
                table.add(page.element);
                table.add(add_page_btn);
                input.focus();
                input.value = '';
              }
            });
          }
        });
        add_page_btn.removeEventListener("click", new_page);
      }
    });
  }

}
