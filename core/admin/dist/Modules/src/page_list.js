'use strict'

const XHR = require('globals/utils/xhr_async.js');
const GridUI = require('globals/grid.ui/index.js');
const grid_row_length = 6;
const grid_padding = 20;
const grid_min_item_size = 150;

const Page = require('./page.js');


module.exports = class {
  constructor(name, list) {
    this.element = document.createElement("div");
    this.element.classList.add('pages_ui');

    let h2 = document.createElement("h2");
    h2.innerHTML = name;
    this.element.appendChild(h2);

    let grid_ui = new GridUI(
      grid_row_length,
      getWindowWidth(),
      grid_padding,
      grid_min_item_size
    );
    this.element.appendChild(grid_ui.element);

    function resize_grid() {
      let screenWidth = getWindowWidth();
      if (screenWidth < 720) {
        grid_ui.resize(screenWidth, true);
      } else {
        grid_ui.resize(screenWidth);
      }
    }
    window.addEventListener('resize', resize_grid);

    for (let t = 0; t < list.length; t++) {
      var page = new Page(list[t], grid_ui);
      grid_ui.add(page.element);
    }

    if (name != "unlisted") {
      let add_temp_btn = document.createElement("div");
      add_temp_btn.classList.add("pages_ui_item");
      add_temp_btn.classList.add("pages_ui_add");
      add_temp_btn.addEventListener("click", new_page);
      grid_ui.add(add_temp_btn);

      let text = document.createElement("h3");
      text.innerHTML = "++";
      add_temp_btn.appendChild(text);

      async function new_page(e) {
/*        var templates = await XHR.post('templates.io', {
          command: "all"
        });*/

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
/*
        for (let t = 0; t < templates.length; t++) {
          var option = document.createElement("option");
          option.value = templates[t].file;
          option.innerHTML = templates[t].file;
          select.appendChild(option);
        }
*/
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

          var res = await XHR.post('/cmbird_admin/pages.io', {
            command: "add",
            name: data.name,
            list: name,
            template: select.value
          }, 'access_token');

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
    }
  }
}

function getWindowWidth() {
  let availWidth = window.screen.width * window.devicePixelRatio;
  if (window.innerWidth < availWidth) {
    return window.innerWidth;
  } else {
    return availWidth;
  }
}
