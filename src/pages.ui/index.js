'use strict'

const XHR = require('../utils/xhr.js');
const Page = require('./page.js');


var GridUI = require('../grid.ui/index.js');

require('./style.less');
var html = require('./body.html');

module.exports = class {
  constructor(div, templates) {
    div.classList.add('pages_ui');

    var h2 = document.createElement("h2");
    h2.innerHTML = "Pages"
    div.appendChild(h2);


    var grid_ui = new GridUI(6, window.innerWidth, 150);
    div.appendChild(grid_ui.element);

    window.addEventListener('resize', function() {
      grid_ui.resize(window.innerWidth);
    });

    var this_class = this;
    XHR.get('pages.io', {
      command: "all"
    }, function() {
      var pages = JSON.parse(this.responseText);
      for (let t = 0; t < pages.length; t++) {
        console.log("PAGE", pages[t]);
        var page = new Page(pages[t], grid_ui);
        grid_ui.add(page.element);
      }

      let add_temp_btn = document.createElement("div");
      add_temp_btn.classList.add("pages_ui_item");
      add_temp_btn.classList.add("pages_ui_add");
      add_temp_btn.addEventListener("click", new_page);
      grid_ui.add(add_temp_btn);

      let text = document.createElement("h3");
      text.innerHTML = "++";
      add_temp_btn.appendChild(text);

      function new_page(e) {
        XHR.get('templates.io', {
          command: "all"
        }, function() {
          add_temp_btn.style.display = "block";

          var input = document.createElement("input");
          input.type = "text";
          input.placeholder = "Name";

          var select = document.createElement("select");

          var placeholder = document.createElement("option");
          placeholder.value = "";
          placeholder.innerHTML = "Template";
          placeholder.disabled = true;
          placeholder.selected = true;
          select.appendChild(placeholder);

          var templates = JSON.parse(this.responseText);
          for (let t = 0; t < templates.length; t++) {
            var option = document.createElement("option");
            option.value = templates[t].file;
            option.innerHTML = templates[t].file;
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

            XHR.post('pages.io', {
              command: "add",
              name: data.name,
              template: select.value
            }, function(response) {
              var res = JSON.parse(response);
              console.log(res);
              if (res.err) {
                console.log(res.err);
              } else {
                var page = new Page({ file: data.name, path: '/'+data.name });

                grid_ui.remove(add_temp_btn);
                grid_ui.add(page.element);
                add_temp_btn.innerHTML = "";
                add_temp_btn.appendChild(text);
                add_temp_btn.style.display = "flex";
                grid_ui.add(add_temp_btn);
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
