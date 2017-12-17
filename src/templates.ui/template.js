'use strict'

const XHR = require('../utils/xhr.js');

var html = require('./template.html');

module.exports = class {
  constructor(name, table) {
    this.element = document.createElement('div');
    this.element.innerHTML = html;
    this.name = name;

    var max_length = 16;
    if(this.name.length > max_length) {
      this.name = this.name.substring(0,max_length)+'...';
    }

    this.display();
    this.table = table;
  }

  edit() {

  }

  display() {

    var page_element = this.element;
    page_element.classList.add('list_item');

    var link = page_element.querySelector('.page_name');
    link.addEventListener('click', function(e) {
      window.location.href = "/p/"+page.data.uri;
    });

    link.innerHTML = this.name;
/*
    var edit_btn = page_element.querySelector('.edit_btn');
    edit_btn.addEventListener('click', function(e) {
      window.location.href = "edit.html?page="+page.data.uri+"&context="+page.data.context_uri;
    });
    edit_btn.innerHTML = '/';
*/
    var this_class = this;

    var del_button = page_element.querySelector('.del_btn');
    del_button.addEventListener('click', function(e) {
      XHR.get('templates.io', {
        command: 'rm',
        name: this_class.name
      }, function() {
        if (this.responseText == "success") {
          this_class.table.remove(this_class.element);
        }
      });
    });
    del_button.innerHTML = "X";
  }
}
