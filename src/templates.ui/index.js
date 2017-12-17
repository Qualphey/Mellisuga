'use strict'

const XHR = require('../utils/xhr.js');
const Template = require('./template.js');


var DynTable = require('../dyn_table.ui/index.js');

require('./style.less');
var html = require('./body.html');

module.exports = class {
  constructor(div) {
    div.innerHTML = html;
    div.classList.add('templates');

    this.list = div.querySelector(".list_display");

    var table = new DynTable();
    this.list.appendChild(table.element);

    var this_class = this;
    XHR.get('templates.io', {
      command: "all"
    }, function() {
      var templates = JSON.parse(this.responseText);
      for (let t = 0; t < templates.length; t++) {
        var template = new Template(templates[t], table);
        table.add(template.element);
      }

      var add_temp_btn = document.createElement("div");
      add_temp_btn.classList.add("list_item");
      add_temp_btn.classList.add("add_item");
      add_temp_btn.addEventListener("click", new_template);
      table.add(add_temp_btn);

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

            XHR.get('templates.io', {
              command: "add",
              name: data.name
            }, function() {
              var res = JSON.parse(this.responseText);
              console.log(res);
              if (res.err) {
                console.log(res.err);
              } else {
                var template = new Template(data.name, table);

                table.remove(add_temp_btn);
                table.add(template.element);
                table.add(add_temp_btn);
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
