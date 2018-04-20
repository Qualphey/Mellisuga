'use strict'

const XHR = require('../utils/xhr.js');
const Template = require('./template.js');


var GridUI = require('../grid.ui/index.js');

require('./style.less');
var html = require('./body.html');

module.exports = class {
  constructor(div) {
    div.classList.add('templates_ui');

    var h2 = document.createElement("h2");
    h2.innerHTML = "Templates"
    div.appendChild(h2);


    var grid_ui = new GridUI(6, window.innerWidth, 150);
    div.appendChild(grid_ui.element);

    window.addEventListener('resize', function() {
      grid_ui.resize(window.innerWidth);
    });

    var this_class = this;
    XHR.get('templates.io', {
      command: "all"
    }, function() {
      var templates = JSON.parse(this.responseText);
      for (let t = 0; t < templates.length; t++) {
        var template = new Template(templates[t].file, grid_ui);
        grid_ui.add(template.element);
      }

      var add_temp_btn = document.createElement("div");
      add_temp_btn.classList.add("templates_ui_item");
      add_temp_btn.classList.add("templates_ui_add");
      add_temp_btn.addEventListener("click", new_template);
      grid_ui.add(add_temp_btn);

      var text = document.createElement("h3");
      text.innerHTML = "++";
      add_temp_btn.appendChild(text);

      function new_template(e) {
        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Name";
        add_temp_btn.innerHTML = "";
        add_temp_btn.appendChild(input);
        input.focus();
        input.addEventListener('keyup', function (e) {
          if (e.keyCode == 13) {
            var data = {
              name: input.value
            }

            XHR.post('templates.io', {
              command: "add",
              name: data.name
            }, function(response) {
              var res = JSON.parse(response);
              if (res.err) {
                console.log(res.err);
              } else {
                var template = new Template(data.name, grid_ui);

                grid_ui.remove(add_temp_btn);
                grid_ui.add(template.element);
                grid_ui.add(add_temp_btn);
                input.focus();
                input.value = '';
              }
            });
          }
        });
        add_temp_btn.removeEventListener("click", new_template);
      }
    });
  }

}
