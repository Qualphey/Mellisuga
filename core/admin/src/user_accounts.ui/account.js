
const XHR = require('../utils/xhr.js');

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

    console.log("CFG", cfg);

    let edit_btn = this.element.querySelector(".admin_accounts_ui_item_edit");
    let rm_btn = this.element.querySelector(".admin_accounts_ui_item_remove");

    if (cfg.creator) {
      console.log("CFG CREATOR");
      inputs[0].checked = true;
      inputs[1].checked = true;
      inputs[2].checked = true;
      inputs[3].checked = true;
      inputs[4].checked = true;

      edit_btn.parentNode.removeChild(edit_btn);
      rm_btn.parentNode.removeChild(rm_btn);
    } else if (cfg.super) {
      console.log("CFG SUPER");
      inputs[0].checked = true;
      inputs[1].checked = true;
      inputs[2].checked = true;
      inputs[3].checked = true;
      inputs[4].checked = true;
    } else {
      inputs[0].checked = false;
      if (cfg.rights) {
        inputs[1].checked = cfg.rights.templates;
        inputs[2].checked = cfg.rights.pages;
        inputs[3].checked = cfg.rights.posts;
        inputs[4].checked = cfg.rights.gallery;
      } else {
        inputs[1].checked = false;
        inputs[2].checked = false;
        inputs[3].checked = false;
        inputs[4].checked = false;
      }
    }

    let this_class = this;
    rm_btn.addEventListener("click", function(e) {
      console.log("REMOVE");
      XHR.post('admin_accounts.io', {
        command: "rm",
        data: {
          email: this_class.email
        }
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

    });
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
