'use strict'

const XHR = require('../utils/xhr.js');
const Post = require('./post.js');

require('./style.css');
var html = require('./body.html');

module.exports = class {
  constructor(div) {
    div.innerHTML = html;
    div.classList.add('posts');

    var post_list = div.querySelector(".post_list");

    XHR.get('/posts.io', { command: "all" }, function() {
      var posts = JSON.parse(this.responseText);
      for (let p = 0; p < posts.length; p++) {
        var post = new Post(posts[p]);
        post_list.insertBefore(post.element, post_list.firstChild);
      }
    });

    var new_post_button = div.querySelector(".new_post_button");
    new_post_button.addEventListener("click", function(e) {
      var post_editor = div.querySelector(".post_editor"),
      title_input = div.querySelector(".post_title_input"),
      tags_input = div.querySelector(".post_tags_input"),
      submit_input = div.querySelector(".post_submit_input"),
      post_display_title = div.querySelector(".post_display_title"),
      post_display = div.querySelector(".post_display");

      new_post_button.style.display = "none";
      post_editor.style.display = "block";

      title_input.addEventListener("input", function(e) {
        post_display_title.innerHTML = title_input.value;
      });


      $('.post_summernote').summernote({
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
      submit_input.addEventListener("click", function(e) {
        var data = {
          command: "create",
          post: {
            title: title_input.value,
            content: $('.post_summernote').summernote('code'),
            tags: tags_input.value.split(" ")
          }
        }

        XHR.post(global.config.admin_path+'/posts.io', data, function(response) {
          var res = JSON.parse(response);

          if (res.err) {
            console.log(res.err);
          } else {
            var post = new Post({
              id: res.id,
              data: data.post
            });
            post_list.insertBefore(post.element, post_list.firstChild);
            new_post_button.style.display = "block";
            post_editor.style.display = "none";

            title_input.value = '';
            $('.post_summernote').summernote("code", '');
            tags_input.value = '';
          }
        });
      });
    });
  }
}
