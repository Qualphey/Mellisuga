
const XHR = require('../utils/xhr.js');
const Account = require('./account.js');

require('./style.less');

const html = require('./body.html');

module.exports = class {
  constructor(div) {
    div.classList.add('admin_accounts_ui');

    div.innerHTML = html;

    let accounts_list = div.querySelector(".admin_accounts_ui_list");

    let new_account_form = div.querySelector("#admin_accounts_ui_new_item_input");

    let new_acc_email_input = new_account_form.querySelector('input[name="email"]');
    let new_acc_password_input = new_account_form.querySelector('input[name="password"]');

    let new_acc_super_input = new_account_form.querySelector('input[name="super"]');
    let new_acc_templates_input = new_account_form.querySelector('input[name="templates"]');
    let new_acc_pages_input = new_account_form.querySelector('input[name="pages"]');
    let new_acc_posts_input = new_account_form.querySelector('input[name="posts"]');
    let new_acc_gallery_input = new_account_form.querySelector('input[name="gallery"]');

    XHR.post('user_accounts.io', { command: "all" }, function(response) {
      var accounts = JSON.parse(response);
      for (let p = 0; p < accounts.length; p++) {
        var account = new Account(accounts[p]);
        new_account_form.parentNode.insertBefore(account.element, new_account_form);
      }
    });


    let new_account_button = div.querySelector("#admin_accounts_ui_new_item");

    new_account_button.addEventListener("click", function(e) {
      new_account_button.style.display = "none";
      new_account_form.style.display = "";

      new_acc_email_input.value = "";
      new_acc_password_input.value = "";

      new_acc_templates_input.value = "";
      new_acc_pages_input.value = "";
      new_acc_posts_input.value = "";
      new_acc_gallery_input.value = "";
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
        data.rights = {
          templates: new_acc_templates_input.checked,
          pages: new_acc_pages_input.checked,
          posts: new_acc_posts_input.checked,
          gallery: new_acc_gallery_input.checked
        };
      }

      XHR.post('user_accounts.io', {
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
}
