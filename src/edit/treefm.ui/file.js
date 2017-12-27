
var padding_left = 10;

module.exports = class {
  constructor(data, treefm) {
    this.path = data.rel_path;
    this.name = data.name;
    this.padding_index = data.padding_index;

    this.element = document.createElement("div");
    this.element.innerHTML = "⋄ "+data.name;
    this.element.style.paddingLeft = this.padding_index*padding_left+padding_left+"px";
    this.element.classList.add("treefm_item");
    this.element.addEventListener("click", function(e) {
      treefm.file_cb(data);
    });

    var this_class = this;
    this.element.addEventListener('contextmenu', function(e) {
      e.preventDefault();

      var callbacks = {
        new_file: false,
        new_folder: false,
        rename: function() {
          treefm.contextmenu.hide();
          var name_input = document.createElement("input");
          name_input.type = "text";
          name_input.value = this_class.name;
          this_class.element.parentNode.replaceChild(name_input, this_class.element);
          name_input.focus();
          name_input.addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
              var dir_arr = this_class.path.split('/');
              dir_arr.pop();
              var file_path = dir_arr.join('/')+"/"+name_input.value;
              treefm.rename(this_class.path, file_path, function() {
                this_class.element.innerHTML = name_input.value;
                name_input.parentNode.replaceChild(this_class.element, name_input);
              });
            }
          });
        },
        delete: function() {
          treefm.contextmenu.hide();
          treefm.rm_file(this_class.path, function() {
            this_class.element.parentNode.removeChild(this_class.element);
          });
        }
      };

      treefm.contextmenu.display(e.clientX, e.clientY, callbacks);

      global.editor_window.element.addEventListener("click", hide_contextmenu);

      function hide_contextmenu(e) {
        treefm.contextmenu.hide();
        global.editor_window.element.removeEventListener("click", hide_contextmenu);
      }
    });
  }
}
