'use strict'

const XHR = require('../utils/xhr_async.js');
const Page = require('./page.js');

var GridUI = require('../grid.ui/index.js');

require('./style.less');

module.exports = class {
  constructor(div, templates) {


  }

  static async init(div, templates) {
    try {
      div.classList.add('pages_ui');

      var h2 = document.createElement("h2");
      h2.innerHTML = "Pages";
      div.appendChild(h2);


      var grid_ui = new GridUI(6, window.innerWidth, 150);
      div.appendChild(grid_ui.element);

      window.addEventListener('resize', function() {
        grid_ui.resize(window.innerWidth);
      });

      var pages = await XHR.post('pages.io', {
        command: "select",
        method: "all_from_list",
        list: "dist"
      });

      console.log("page_lists", pages);

      for (let t = 0; t < pages.length; t++) {
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

      async function new_page(e) {
        var templates = await XHR.post('templates.io', {
          command: "all"
        });

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

        submit.addEventListener('click', async function(e) {
          var data = {
            file: encodeURIComponent(input.value),
            path: '/'+encodeURIComponent(input.value),
            name: input.value
          }

          var res = await XHR.post('pages.io', {
            command: "add",
            name: data.name,
            template: select.value
          });
          if (res.err) {
            console.log(res.err);
          } else {
            var page = new Page(data, grid_ui);

            grid_ui.remove(add_temp_btn);
            grid_ui.add(page.element);
            add_temp_btn.innerHTML = "";
            add_temp_btn.appendChild(text);
            add_temp_btn.style.display = "flex";
            add_temp_btn.addEventListener("click", new_page);
            grid_ui.add(add_temp_btn);
            input.focus();
            input.value = '';
          }
        });
        add_temp_btn.removeEventListener("click", new_page);
      }

      return new module.exports(div, templates);
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  }
}
