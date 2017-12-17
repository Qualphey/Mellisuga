'use strict'

const XHR = require('../utils/xhr.js');

var html = require('./post.html');
var edit_html = require('./edit.html');

module.exports = class {
  constructor(obj) {
    this.element = document.createElement('div');

    this.display(obj);

  }

  edit(obj) {
    var div = this.element;

    div.innerHTML = edit_html;

    var title_input = div.querySelector(".post_title_input");
    title_input.value = obj.data.title;
    var tags_input = div.querySelector(".post_tags_input");
    tags_input.value = obj.data.tags;
    var submit_input = div.querySelector(".post_submit_input"),
    cancel_input = div.querySelector(".post_cancel_input"),
    post_display_title = div.querySelector(".post_display_title"),
    post_display = div.querySelector(".post_display");

    var this_class = this;
    cancel_input.addEventListener("click", function(e) {
      this_class.display(obj);
    });

    title_input.addEventListener("input", function(e) {
      post_display_title.innerHTML = title_input.value;
    });

    var sn = $('.cur_sn');
    sn.removeClass('cur_sn');

    sn.summernote({
      minHeight: 300,
      callbacks: {
        onChange: function(contents) {
          post_display.innerHTML = contents;
        }
      },
      fontSizes: [
        '8', '10', '12', '14', '16',
        '18', '20', '24', '36', '48',
        '64', '82', '150'
      ]
    //        lang: "lt-LT"
    });
    sn.summernote("code", obj.data.content);

    submit_input.addEventListener("click", function(e) {
      var data = {
        id: obj.id,
        title: title_input.value,
        content: sn.summernote('code'),
        tags: tags_input.value.split(" ")
      }


      console.log(data.content);

      XHR.get(global.config.admin_path+'/edit_post', data, function() {
        console.log(this.responseText);
        if (this.responseText === "success") {
          console.log("Post successfuly edited!");
          obj.data.title = title_input.value;
          obj.data.content = sn.summernote('code');
          obj.data.tags = tags_input.value.split(" ");
          this_class.display(obj);
          this_class.make_first();
        }
      });
    });
  }

  make_first() {
    var parent = this.element.parentNode;
    parent.removeChild(this.element);
    parent.insertBefore(this.element, parent.firstChild);
  }

  display(obj) {
    this.element.innerHTML = html;
    this.element.classList.add('post_element');

    var title = this.element.querySelector('.post_title');
    title.innerHTML = obj.data.title;
    title.classList.add('post_display_title');

    var edit_btn = this.element.querySelector('.post_edit_btn');

    var this_class = this;
    edit_btn.addEventListener("click", function(e) {
      this_class.edit(obj);
    });

    var del_btn = this.element.querySelector('.post_del_btn');
    del_btn.addEventListener("click", function(e) {
      XHR.get('del_post', { id: obj.id }, function() {
        if (this.responseText == "success") {
          this_class.element.parentNode.removeChild(this_class.element);
        }
      });
    });

    var content = this.element.querySelector('.post_content');

    var content_str = obj.data.content;
    var max_length = 1024;
    if(content_str.length > max_length) {
      content_str = content_str.substring(0,max_length)+'...';
    }
    content.innerHTML = content_str;
    content.classList.add('post_display');
  }
}
