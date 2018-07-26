'use strict'

const XHR = require('globals/utils/xhr_async.js');
const Post = require('./post.js');

require('./style.css');

(async function() {
  let div = document.body.querySelector('.content-block');

  div.classList.add('posts');

  var post_list = div.querySelector(".post_list");

  let posts = await XHR.get('/posts', { command: "all" });
  
  for (let p = 0; p < posts.length; p++) {
    var post = new Post(posts[p]);
    post_list.insertBefore(post.element, post_list.firstChild);
  }

  let post_editor = div.querySelector(".post_editor"),
  title_input = div.querySelector(".post_title_input"),
  tags_input = div.querySelector(".post_tags_input"),
  submit_input = div.querySelector(".post_submit_input"),
  post_display_title = div.querySelector(".post_display_title"),
  post_display = div.querySelector(".post_display"),
  jodit_area = div.querySelector(".jodit");  

  title_input.addEventListener("input", function(e) {
    post_display_title.innerHTML = title_input.value;
  });

  jodit_area.id = "jodit";
  let jodit = new Jodit('#jodit', {
    toolbarAdaptive: false
  });
  jodit_area.id = "";

  jodit.events.on("change", function() {
    post_display.innerHTML = jodit.value;
  });

  submit_input.addEventListener("click", async function(e) {
    let tags; 
    if (tags_input) {
      tags = tags_input.value.split(" ");
    }
    var data = {
      command: "create",
      post: {
        title: title_input.value,
        content: jodit.value,
        tags: tags
      }
    }

    console.log("CREATE ONE POST");

    let res = await XHR.post('/content-manager/posts', data);

    if (res.err) {
      console.error(res.err);
    } else {
      data.post.id = res.id;
      data.post.publish_date = Date.now();
      var post = new Post(data.post);
      post_list.insertBefore(post.element, post_list.firstChild);
      new_post_button.style.display = "block";
      post_editor.style.display = "none";

      title_input.value = '';
      jodit.value = '';
      if (tags_input) {
        tags_input.value = '';
      }
    }
  });

  var new_post_button = div.querySelector(".new_post_button");
  new_post_button.addEventListener("click", function(e) {
    new_post_button.style.display = "none";
    post_editor.style.display = "block";
  });

})();
