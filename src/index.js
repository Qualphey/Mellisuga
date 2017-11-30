var config = global.config = {
  admin_path : "/cmb_admin"
}

var socket = global.socket = require('socket.io-client')('http://localhost:9639');

var PageEdit = require('./pages/edit.js');
var pe = new PageEdit();

var ttb = document.getElementById('tt');
ttb.addEventListener('click', function(e) {
  socket.emit('token_test', 'testing');
});
