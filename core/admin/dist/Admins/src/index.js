
const XHR = require('globals/utils/xhr_async.js');
const CodeMirror = require("globals/codemirror.ui/index.js");
const Account = require('./account.js');

let div = document.getElementById('admin_accounts_ui');

let accounts_array = [];

let accounts_list = div.querySelector(".admin_accounts_ui_list");

let new_account_form = div.querySelector("#admin_accounts_ui_new_item_input");

let new_acc_email_input = new_account_form.querySelector('input[name="email"]');
let new_acc_password_input = new_account_form.querySelector('input[name="password"]');

let new_acc_super_input = new_account_form.querySelector('input[name="super"]');

var json_edit = div.querySelector(".new_json_edit");

(async function() {
  let accounts = await XHR.post('../admin_accounts.io', {
    command: "all"
  }, 'access_token');

  for (let p = 0; p < accounts.length; p++) {
    accounts[p].cfg = JSON.stringify(accounts[p].cfg);
    var account = new Account(accounts[p]);
    new_account_form.parentNode.insertBefore(account.element, new_account_form);
    accounts_array.push(account);
  }
})();


let new_account_button = div.querySelector("#admin_accounts_ui_new_item");
let html_editor = undefined;

new_account_button.addEventListener("click", function(e) {

  new_account_button.style.display = "none";
  new_account_form.style.display = "";

  new_acc_email_input.value = "";
  new_acc_password_input.value = "";


  html_editor = new CodeMirror('', 'js', false);
  json_edit.appendChild(html_editor.element);
  html_editor.cm.setSize(500, 100);
  html_editor.cm.refresh();
});

let new_acc_submit = new_account_form.querySelector('button[name="submit"]');
new_acc_submit.addEventListener("click", async function(e) {
  var data = {
    email: new_acc_email_input.value,
    password: new_acc_password_input.value
  };

  if (new_acc_super_input.checked) {
    data.super = true;
  } else {
    data.cfg = html_editor.cm.getValue();
  }

  const response = await XHR.post('../admin_accounts.io', {
    command: "add",
    data: data
  }, "access_token");
  if (response === "success") {
    var account = new Account(data);
    new_account_form.parentNode.insertBefore(account.element, new_account_form);
    new_account_button.style.display = "block";
    new_account_form.style.display = "none";
  } else {
    console.log(response);
  }
});

let new_acc_cancel = new_account_form.querySelector('button[name="cancel"]');
new_acc_cancel.addEventListener("click", function(e) {
  new_account_button.style.display = "block";
  new_account_form.style.display = "none";
});

function refresh() {
  for (var a = 0; a < accounts_array.length; a++) {
    console.log("r", a);
    accounts_array[a].html_editor.cm.refresh();
  }
}
