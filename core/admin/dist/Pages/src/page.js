'use strict'

const XHR = require('globals/utils/xhr_async.js');

var html = require('./page.html');

module.exports = class {
  constructor(cfg, table) {
    this.element = document.createElement('div');
    this.element.innerHTML = html;
    this.name = cfg.name;
    this.parent_list = cfg.parent_list;
    this.filename = cfg.file;
    this.path = cfg.path;
    this.watching = cfg.watching;

    this.fname = this.name;

    var max_length = 16;
    if(this.fname.length > max_length) {
      this.fname = this.fname.substring(0,max_length)+'...';
    }

    this.display();
    this.table = table;
  }

  display() {
    var page_element = this.element;
    page_element.classList.add('pages_ui_item');

    let this_class = this;

    var link = page_element.querySelector('.page_name');
    link.href = this.path;

    link.innerHTML = this.fname;

    var edit_btn = page_element.querySelector('.edit_btn');

    edit_btn.addEventListener('click', function(e) {
      window.location.href = "edit.html?page="+this_class.filename;
    });
    edit_btn.innerHTML = '/';

    let webpack_btn = page_element.querySelector('.webpack_btn');

    if (this.watching) {
      webpack_btn.src = "webpack-on.png";
    }

    webpack_btn.addEventListener('click', async function(e) {
      const state = await XHR.post("/mellisuga/pages.io", {
        command: "webpack-watch",
        list: this_class.parent_list,
        name: this_class.name
      }, 'access_token');

      if (state) {
        webpack_btn.src = "webpack-on.png";
      } else {
        webpack_btn.src = "webpack-off.png";
      }
    });

    var del_button = page_element.querySelector('.del_btn');
    del_button.addEventListener('click', function(e) {
      var popup = document.createElement('div');
      popup.classList.add("popup_ui");
      document.body.appendChild(popup);

      var close_btn = document.createElement("button");
      close_btn.innerHTML = "X";
      close_btn.addEventListener("click", function() {
        document.body.removeChild(popup);
      });
      popup.appendChild(close_btn);

      var message = document.createElement("p");
      message.innerHTML = "Confirm DELETION of page `"+this_class.name+"` by entering its title";
      popup.appendChild(message);

      var submit = document.createElement("input");
      submit.type = "submit";
      popup.appendChild(submit);

      var input = document.createElement("input");
      input.type = "text";
      popup.appendChild(input);
      input.focus();

      input.addEventListener('keyup', function (e) {
        if (e.keyCode == 13) {
          proceed();
        }
      });

      var err_msg = document.createElement("span");
      popup.appendChild(err_msg);

      submit.addEventListener("click", function(e) {
        proceed()
      });

      async function proceed() {
        if (input.value === this_class.name) {
          var response = await XHR.post('/mellisuga/pages.io', {
            command: 'rm',
            list: this_class.parent_list,
            name: this_class.name
          }, 'access_token');
          if (response.msg === "success") {
            this_class.table.remove(this_class.element);
            document.body.removeChild(popup);
          } else if (response.err) {
            console.error(response.err);
          } else {
            console.log(response);
          }
        } else {
          err_msg.innerHTML = "Incorrect!";
        }
      }
    });
    del_button.innerHTML = "X";
  }
}
