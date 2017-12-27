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

  display() {

    var page_element = this.element;
    page_element.classList.add('list_item');

    var this_class = this;

    var link = page_element.querySelector('.page_name');

    link.addEventListener('click', function(e) {
      window.location.href = "t/"+this_class.name;
    });

    link.innerHTML = this.name;

    var edit_btn = page_element.querySelector('.edit_btn');
    edit_btn.addEventListener('click', function(e) {
      window.location.href = "edit.html?template="+this_class.name;
    });
    edit_btn.innerHTML = '/';

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
