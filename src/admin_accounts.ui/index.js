
const XHR = require('../utils/xhr.js');
const Account = require('./account.js');

require('./style.less');

const html = require('./body.html');

const CodeMirror = require("../edit/codemirror.ui/index.js");

module.exports = class {
  constructor(div) {
    div.classList.add('admin_accounts_ui');

    div.innerHTML = html;

    this.accounts_list = [];

    let accounts_list = div.querySelector(".admin_accounts_ui_list");

    let new_account_form = div.querySelector("#admin_accounts_ui_new_item_input");

    let new_acc_email_input = new_account_form.querySelector('input[name="email"]');
    let new_acc_password_input = new_account_form.querySelector('input[name="password"]');

    let new_acc_super_input = new_account_form.querySelector('input[name="super"]');

    var json_edit = div.querySelector(".new_json_edit")

    let this_class = this;

    XHR.post('admin_accounts.io', { command: "all" }, function(response) {
      var accounts = JSON.parse(response);
      for (let p = 0; p < accounts.length; p++) {
        accounts[p].cfg = JSON.stringify(accounts[p].cfg);
        var account = new Account(accounts[p]);
        new_account_form.parentNode.insertBefore(account.element, new_account_form);
        this_class.accounts_list.push(account);
      }
    });


    let new_account_button = div.querySelector("#admin_accounts_ui_new_item");

    new_account_button.addEventListener("click", function(e) {

      new_account_button.style.display = "none";
      new_account_form.style.display = "";

      new_acc_email_input.value = "";
      new_acc_password_input.value = "";


      this_class.html_editor = new CodeMirror('', 'js', false);
      json_edit.appendChild(this_class.html_editor.element);
      this_class.html_editor.cm.setSize(500, 100);
      this_class.html_editor.cm.refresh();
    });

    let new_acc_submit = new_account_form.querySelector('button[name="submit"]');
    new_acc_submit.addEventListener("click", function(e) {
      var data = {
        email: new_acc_email_input.value,
        password: new_acc_password_input.value
      };

      if (new_acc_super_input.checked) {
        data.super = true;
      } else {
        data.cfg = this_class.html_editor.cm.getValue();
      }

      XHR.post('admin_accounts.io', {
        command: "add",
        data: data
      }, function(response) {
        if (response === "success") {
          var account = new Account(data);
          new_account_form.parentNode.insertBefore(account.element, new_account_form);
          new_account_button.style.display = "block";
          new_account_form.style.display = "none";
        } else {
          console.log(response);
        }
      });
    });

    let new_acc_cancel = new_account_form.querySelector('button[name="cancel"]');
    new_acc_cancel.addEventListener("click", function(e) {
      new_account_button.style.display = "block";
      new_account_form.style.display = "none";
    });
  }

  refresh() {
    for (var a= 0; a < this.accounts_list.length; a++) {
      console.log("r", a);
      this.accounts_list[a].html_editor.cm.refresh();
    }
  }
}
