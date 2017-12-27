const File = require("./file.js");

var padding_left = 10;

var Dir = module.exports = class {
  constructor(data, treefm) {
    this.element = document.createElement('div');
    this.path = data.rel_path;
    this.name = data.name;
    this.padding_index = data.padding_index;

    var this_class = this;

    var name_div = document.createElement("div");
    name_div.classList.add("treefm_item");
    name_div.innerHTML = "▹ "+data.name;
    name_div.style.paddingLeft = this.padding_index*padding_left+padding_left+"px";

    name_div.addEventListener("click", function(e) {
      if (content_div.displayed) {
        var str = name_div.innerHTML;
        name_div.innerHTML = "▹ "+str.substring(2);
        content_div.style.display = "none";
        content_div.displayed = false;
      } else {
        var str = name_div.innerHTML;
        name_div.innerHTML = "▿ "+str.substring(2);
        content_div.style.display = "block";
        content_div.displayed = true;
      }
    });

    name_div.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      var callbacks = {
        new_file: function() {
          content_div.style.display = "block";
          content_div.displayed = true;

          var name_input = document.createElement("input");
          name_input.type = "text";
          name_input.placeholder = "new file name";
          content_div.appendChild(name_input);
          name_input.focus();
          treefm.contextmenu.hide();
          name_input.addEventListener('keyup', function (e) {
            if (e.keyCode == 13) {
              var file_path = this_class.path+"/"+name_input.value;
              treefm.write_file(file_path, "", function() {
                var new_file = new File({
                  name: name_input.value,
                  rel_path: this_class.path+"/"+name_input.value,
                  padding_index: this_class.padding_index+1,
                  type: "txt"
                }, treefm);
                content_div.replaceChild(new_file.element, name_input);
              });
            }
          });
        },
        new_folder: function() {
          content_div.style.display = "block";
          content_div.displayed = true;

          var name_input = document.createElement("input");
          name_input.type = "text";
          name_input.placeholder = "new folder name";
          content_div.appendChild(name_input);
          name_input.focus();
          treefm.contextmenu.hide();
          name_input.addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
              var file_path = this_class.path+"/"+name_input.value;
              treefm.mkdir(file_path, function() {
                var new_file = new Dir({
                  name: name_input.value,
                  rel_path: this_class.path+"/"+name_input.value,
                  type: "dir",
                  padding_index: this_class.padding_index+1,
                  content: []
                }, treefm);
                content_div.replaceChild(new_file.element, name_input);
              });
            }
          });
        },
        rename: function() {
          treefm.contextmenu.hide();
          var name_input = document.createElement("input");
          name_input.type = "text";
          name_input.value = this_class.name;
          this_class.element.replaceChild(name_input, name_div);
          name_input.focus();
          name_input.addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
              var dir_arr = this_class.path.split('/');
              dir_arr.pop();
              var file_path = dir_arr.join('/')+"/"+name_input.value;
              treefm.rename(this_class.path, file_path, function() {
                name_div.innerHTML = name_input.value;
                this_class.element.replaceChild(name_div, name_input);
              });
            }
          });
        },
        delete: function() {
          treefm.contextmenu.hide();
          treefm.rm_dir(this_class.path, function() {
            this_class.element.parentNode.removeChild(this_class.element);
          });
        }
      };
      if (data.root) {
        callbacks["rename"] = false;
        callbacks["delete"] = false;
      }
      treefm.contextmenu.display(e.clientX, e.clientY, callbacks);

      global.editor_window.element.addEventListener("click", hide_contextmenu);

      function hide_contextmenu(e) {
        treefm.contextmenu.hide();
        global.editor_window.element.removeEventListener("click", hide_contextmenu);
      }
    });
    this.element.appendChild(name_div);

    var content_div = document.createElement("div");
    content_div.displayed = false;
    content_div.classList.add("treefm_dir_content");
    for (var f = 0; f < data.content.length; f++) {
      let child_file = data.content[f];
      if (child_file.type == "dir") {
        child_file.padding_index = this_class.padding_index+1;
        var child_dir = new Dir(child_file, treefm);
        content_div.appendChild(child_dir.element);
      } else if (child_file.type == "txt") {
        child_file.padding_index = this_class.padding_index+1;
        var file = new File(child_file, treefm);
        content_div.appendChild(file.element);
      } else {
        console.error("TreeFM: Unknown file type", child_file.type);
      }
    }

    if (data.root) {
      var str = name_div.innerHTML;
      name_div.innerHTML = "▿ "+str.substring(2);
      content_div.style.display = "block";
      content_div.displayed = true;
    }

    this.element.appendChild(content_div);
  }
}
