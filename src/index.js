var config = global.config = {
  admin_path : "/cmb_admin"
}

require("./style.css");

var socket = global.socket = require('socket.io-client')('http://localhost:9639');

var templates_div = document.createElement('div');
document.body.appendChild(templates_div);
var TemplatesUI = new (require('./templates.ui/index.js'))(templates_div);

var pages_div = document.createElement('div');
document.body.appendChild(pages_div);
var PagesUI = new (require('./pages.ui/index.js'))(pages_div);
/*
var pages_div = document.createElement('div');
document.body.appendChild(pages_div);
var PagesUI = new (require('./pages.ui/index.js'))(pages_div);
*/
var posts_div = document.createElement('div');
document.body.appendChild(posts_div);
var PostsUI = new (require('./posts.ui/index.js'))(posts_div);
/*
var ttb = document.getElementById('tt');
ttb.addEventListener('click', function(e) {
  socket.emit('token_test', 'testing');
});
*/
