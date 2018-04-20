
const XHR = require('../utils/xhr.js');

const CodeMirror = require("../edit/codemirror.ui/index.js");

const html = require('./account.html');

module.exports = class {
  constructor(cfg) {
    this.element = document.createElement("tr");
    this.element.classList.add("admin_accounts_ui_item");
    this.element.innerHTML = html;

    this.email = cfg.email;

    var name = this.element.querySelector(".admin_accounts_ui_item_name")
    name.innerHTML = cfg.email;

    let inputs = this.element.getElementsByTagName("input");

    let this_class = this;

    var json_edit = this.element.querySelector(".json_edit")

    this.cfg_string = JSON.stringify(JSON.parse(cfg.cfg), null, 2)

    this.html_editor = new CodeMirror(this.cfg_string, 'js', true);
    json_edit.appendChild(this.html_editor.element);
    this.html_editor.cm.setSize(500, 100);

    setTimeout(function() {
      this_class.html_editor.cm.refresh();
    },1);

    let edit_btn = this.element.querySelector(".admin_accounts_ui_item_edit");
    let rm_btn = this.element.querySelector(".admin_accounts_ui_item_remove");

    if (cfg.creator) {
      console.log("CFG CREATOR");
      inputs[0].checked = true;
      edit_btn.parentNode.removeChild(edit_btn);
      rm_btn.parentNode.removeChild(rm_btn);
    } else if (cfg.super) {
      console.log("CFG SUPER");
      inputs[0].checked = true;
    } else {
      inputs[0].checked = false;
    }

    rm_btn.addEventListener("click", function(e) {
      console.log("REMOVE");
      XHR.post('admin_accounts.io', {
        command: "rm",
        data: {
          email: this_class.email
        },
        access_token: window.localStorage.getItem('access_token')
      }, function(response) {
        if (response === "success") {
          this_class.destroy();
        } else {
          console.log(response);
        }
      });
    });
    let edit_save = this.element.querySelector(".admin_accounts_ui_item_save");
    edit_btn.addEventListener("click", function(e) {
      edit_btn.style.display = "none";
      rm_btn.style.display = "none";
      edit_save.style.display = "inline-block";

      for (var i = 0; i < inputs.length; i++) {
        var input = inputs[i];
        input.disabled = false;
      }

      json_edit.removeChild(this_class.html_editor.element);
      json_edit.style.backgroundColor = "#222";
      this_class.html_editor = new CodeMirror(this_class.cfg_string, 'js', false);
      json_edit.appendChild(this_class.html_editor.element);
      this_class.html_editor.cm.setSize(500, 100);
      this_class.html_editor.cm.refresh();
    });

    edit_save.addEventListener("click", function(e) {
      var cfg_json = this_class.html_editor.cm.getValue();
      this_class.cfg_string = cfg_json;

      XHR.post('admin_accounts.io', {
        command: "edit",
        data: {
          email: this_class.email,
          super: inputs[0].checked,
          cfg: cfg_json
        },
        access_token: window.localStorage.getItem('access_token')
      }, function(response) {
        if (response === "success") {
          edit_btn.style.display = "inline-block";
          rm_btn.style.display = "inline-block";
          edit_save.style.display = "none";

          for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            input.disabled = true;
          }

          json_edit.removeChild(this_class.html_editor.element);
          json_edit.style.backgroundColor = "transparent";
          this_class.html_editor = new CodeMirror(cfg_json, 'js', true);
          json_edit.appendChild(this_class.html_editor.element);
          this_class.html_editor.cm.setSize(500, 100);
          this_class.html_editor.cm.refresh();
        } else {
          alert(response);
        }
      });
    });
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
