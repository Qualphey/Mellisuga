'use strict'

const XHR = require('../utils/xhr.js');
const Page = require('./page.js');


var GridUI = require('../grid.ui/index.js');

require('./style.less');
var html = require('./body.html');

module.exports = class {
  constructor(div, templates) {
    div.innerHTML = html;
    div.classList.add('pages');

    this.list = div.querySelector(".list_display");

    var table = new GridUI();
    this.list.appendChild(table.element);

    var this_class = this;
    XHR.get('pages.io', {
      command: "all"
    }, function() {
      var pages = JSON.parse(this.responseText);
      for (let t = 0; t < pages.length; t++) {
        var page = new Page(pages[t], table);
        table.add(page.element);
      }

      var add_temp_btn = document.createElement("div");
      add_temp_btn.classList.add("list_item");
      add_temp_btn.classList.add("add_item");
      add_temp_btn.addEventListener("click", new_page);
      table.add(add_temp_btn);

      var text = document.createElement("h3");
      text.innerHTML = "++";
      add_temp_btn.appendChild(text);

      function new_page(e) {
        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Name";

        var select = document.createElement("select");
        XHR.get('templates.io', {
          command: "all"
        }, function() {
          var placeholder = document.createElement("option");
          placeholder.value = "";
          placeholder.innerHTML = "Template";
          placeholder.disabled = true;
          placeholder.selected = true;
          select.appendChild(placeholder);

          var templates = JSON.parse(this.responseText);
          for (let t = 0; t < templates.length; t++) {
            var option = document.createElement("option");
            option.value = templates[t];
            option.innerHTML = templates[t];
            select.appendChild(option);
          }

          add_temp_btn.innerHTML = "";
          add_temp_btn.appendChild(input);
          input.focus();
          add_temp_btn.appendChild(select);

          var submit = document.createElement("button");
          submit.innerHTML = "Submit";
          add_temp_btn.appendChild(submit);

          submit.addEventListener('click', function (e) {
            var data = {
              name: input.value
            }

            XHR.get('pages.io', {
              command: "add",
              name: data.name,
              template: select.value
            }, function() {
              var res = JSON.parse(this.responseText);
              console.log(res);
              if (res.err) {
                console.log(res.err);
              } else {
                var page = new Page(data.name, table);

                table.remove(add_temp_btn);
                table.add(page.element);
                table.add(add_temp_btn);
                input.focus();
                input.value = '';
              }
            });
          });
        });
        add_temp_btn.removeEventListener("click", new_page);
      }
    });
  }

}
