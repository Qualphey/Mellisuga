'use strict'

const XHR = require('./utils/xhr.js');

module.exports = class {
  constructor() {
    var posts = document.getElementById("posts_edit");
    var post_display = document.getElementById("post_display");

    XHR.get('/posts', null, function() {
      var posts = JSON.parse(this.responseText);
      for (let p = 0; p < posts.length; p++) {
        console.log(posts[p]);
        var post_element = document.createElement('div');
        post_element.classList.add('list_item');

        var link = document.createElement('a');
        link.href = "/p/"+posts[p].data.uri;
        link.innerHTML = posts[p].data.title;
        post_element.appendChild(link);

        var del_button = document.createElement('button');
        del_button.addEventListener('click', function(e) {
          XHR.get('del_post', { id: posts[p].id }, function() {
            console.log(this.responseText);
          });
        });
        del_button.innerHTML = "X";
        post_element.appendChild(del_button);

        posts_edit.insertBefore(post_element, add_post_btn);
      }
    });

    var add_post_btn = document.getElementById("add_post");
    add_post_btn.addEventListener("click", function() {
      posts.removeChild(add_post_btn);

      var title_input = document.createElement("input");
      title_input.id = "title_input";
      title_input.type = "text";
      title_input.placeholder = "Title of the post";
      posts.appendChild(title_input);

      var summernote_editor = document.createElement("div");
      summernote_editor.id = 'summernote_editor';
      posts.appendChild(summernote_editor);
      $('#summernote_editor').summernote({
        minHeight: 300,
        callbacks: {
          onChange: function(contents) {
            post_display.innerHTML = contents;
          }
        },
//        lang: "lt-LT"
      });

      var tags_input = document.createElement("input");
      tags_input.id = "tags_input";
      tags_input.type = "text";
      tags_input.placeholder = "Tags `i.e. tag1 tag2 tag3` (split by spaces)";
      posts.appendChild(tags_input);

      var submit_input = document.createElement("input");
      submit_input.id = "submit_input";
      submit_input.type = "submit";
      submit_input.addEventListener("click", function(e) {
        var data = {
          title: title_input.value,
          content: $('#summernote_editor').summernote('code'),
          tags: tags_input.value.split(" ")
        }

//        console.log("post", data);
        XHR.get(global.config.admin_path+'/new_post', data, function() {
          if (this.responseText === "success") {
            console.log("Post successfuly added!");
          }
        });
      });
      posts.appendChild(submit_input);
    });

    function new_post(e) {
      var input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Title";
      add_post_btn.innerHTML = "";
      add_post_btn.appendChild(input);
      input.focus();
      input.addEventListener('keyup', function (e) {
        if (e.keyCode == 13) {
          var post = {
            name : input.value,
            uri : encodeURIComponent(input.value)+".html"
          }

          XHR.get(global.config.admin_path+'/new_post', post, function() {
            if (this.responseText === "success") {
              var post_element = document.createElement('a');
              post_element.classList.add('list_item');
              post_element.href = "/p/"+post.uri;
              post_element.innerHTML = post.name;
              posts_edit.insertBefore(post_element, add_post);
              input.value = '';
            }
          });
        }
      });
      add_post_btn.removeEventListener("click", new_post);
    }
  }

}
