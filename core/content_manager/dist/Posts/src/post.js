'use strict'

const XHR = require('globals/utils/xhr_async.js');

var html = require('./post.html');
var edit_html = require('./edit.html');

module.exports = class {
  constructor(obj) {
    console.log("POST", obj);
    this.element = document.createElement('div');

    this.display(obj);

  }

  edit(obj) {
    var div = this.element;

    div.innerHTML = edit_html;

    var post_editor = div.querySelector(".post_editor");
    var title_input = div.querySelector(".post_title_input");
    title_input.value = obj.title;
    var tags_input = div.querySelector(".post_tags_input");
    tags_input.value = obj.tags;
    let submit_input = div.querySelector(".post_submit_input"),
    cancel_input = div.querySelector(".post_cancel_input"),
    post_display_title = div.querySelector(".post_display_title"),
    post_display = div.querySelector(".post_display"),
    jodit_area = div.querySelector(".jodit");

    var this_class = this;
    cancel_input.addEventListener("click", function(e) {
      this_class.display(obj);
    });

    title_input.addEventListener("input", function(e) {
      post_display_title.innerHTML = title_input.value;
    });
    
    jodit_area.id = "jodit";
    let jodit = new Jodit('#jodit', {
      toolbarAdaptive: false
    });
    jodit_area.id = "";
    
    jodit.value = obj.content;

    post_editor.style.display = "block";

    submit_input.addEventListener("click", async function(e) {
      var data = {
        command: "edit",
        post: {
          id: obj.id,
          title: title_input.value,
          content: jodit.value,
          tags: tags_input.value.split(" ")
        }
      }

      console.log("edit post");
      const response = await XHR.post('/content-manager/posts', data);
      console.log("response", response);
      if (response === "success") {
        console.log("Post successfuly edited!");
        obj.title = title_input.value;
        obj.content = jodit.value;
        obj.tags = tags_input.value.split(" ");
        this_class.make_first();
        div.innerHTML = html;
        this_class.display(obj);
      }
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
    title.innerHTML = obj.title;
    title.classList.add('post_display_title');

    var edit_btn = this.element.querySelector('.post_edit_btn');

    var this_class = this;
    edit_btn.addEventListener("click", function(e) {
      this_class.edit(obj);
    });

    var del_btn = this.element.querySelector('.post_del_btn');
    del_btn.addEventListener("click", async function(e) {
      const response = await XHR.post('/content-manager/posts', {
        command: "delete", ids: [obj.id]
      });
      if (response == "success") {
        this_class.element.parentNode.removeChild(this_class.element);
      } 
    });

    var content = this.element.querySelector('.post_content');

    var content_str = obj.content;
    var max_length = 1024;
    if(content_str.length > max_length) {
      content_str = content_str.substring(0,max_length)+'...';
    }
    content.innerHTML = content_str;
    content.classList.add('post_display');
  }
}
