var config = global.config = {
  admin_path : "/cmb_admin"
}

require("./style.css");

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

const access_token = getParameterByName('access_token');

window.history.replaceState(null, null, window.location.pathname);


window.addEventListener("load", async function(e) {
  try {
    var socket = global.socket = require('socket.io-client')('http://localhost:9639');

    let cur_viewed;
    let display_box = document.getElementById("display_box");
    function view_selection(div) {
      if (div === cur_viewed) {
        return false;
      }

      if (cur_viewed) {
        cur_viewed.button.classList.remove("selected_navigation_button");
        display_box.removeChild(cur_viewed);
      }

      cur_viewed = div;
      cur_viewed.button.classList.add("selected_navigation_button");
      display_box.appendChild(cur_viewed);
    }

    var templates_div = document.createElement('div');
    templates_div.button = document.getElementById('templates_button');
    templates_div.button.addEventListener('click', function(e) {
      view_selection(templates_div);
    })
    var TemplatesUI = new (require('./templates.ui/index.js'))(templates_div);

    var pages_div = document.createElement('div');
    pages_div.button = document.getElementById('pages_button');
    pages_div.button.addEventListener('click', function(e) {
      view_selection(pages_div);
    })
    var PagesUI = new (require('./pages.ui/index.js'))(pages_div);

    var posts_div = document.createElement('div');
    posts_div.button = document.getElementById('posts_button');
    posts_div.button.addEventListener('click', function(e) {
      view_selection(posts_div);
    })
    var PostsUI = new (require('./posts.ui/index.js'))(posts_div);

    var gallery_div = document.createElement('div');
    gallery_div.button = document.getElementById('gallery_button');
    gallery_div.button.addEventListener('click', function(e) {
      view_selection(gallery_div);
    })
    var GalleryUI = require('./gallery.ui/index.js').init(gallery_div);

    var admin_accounts_div = document.createElement('div');
    admin_accounts_div.button = document.getElementById('accounts_button');
    var AdminAccountsUI = new (require('./admin_accounts.ui/index.js'))(admin_accounts_div);
    admin_accounts_div.button.addEventListener('click', function(e) {
      view_selection(admin_accounts_div);
      AdminAccountsUI.refresh();
    })
/*
    var user_accounts_div = document.createElement('div');
    user_accounts_div.button = document.getElementById('users_button');
    view_selection(user_accounts_div);
    user_accounts_div.button.addEventListener('click', function(e) {
      view_selection(user_accounts_div);
    })
    var UserAccountsUI = new (require('./user_accounts.ui/index.js'))(user_accounts_div);
*/
    view_selection(pages_div);


  } catch (e) {
    console.error(e);
  }
});
