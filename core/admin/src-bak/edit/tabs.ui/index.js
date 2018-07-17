require('./horz.css');

var Tab = require("./tab.js");

module.exports = class {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('tabs_ui_container');

    this.menu = document.createElement('div');
    this.menu.classList.add('tabs_ui_menu');
    this.element.appendChild(this.menu);

    this.display_div = document.createElement('div');
    this.display_div.classList.add('tabs_ui_display');
    this.display_div.style.height = "calc(100% - 21px)";
    this.element.appendChild(this.display_div);

    this.list = [];
  }

  add(data) {
    var tab = new Tab(data, this);
    this.menu.appendChild(tab.element);
    this.list.push(tab);
    tab.display();
  }

  remove(tab) {
    this.menu.removeChild(tab.element);
    this.list.splice(this.list.indexOf(tab), 1);
    if (tab.element == this.displayed_tab) {
      if (this.list.length > 0) {
        this.display(this.list[this.list.length-1]);
      } else {
        this.display_div.innerHTML = "";
      }
    }
  }

  select(id) {
    var result = false;
    for (var t = 0; t < this.list.length; t++) {
      if (this.list[t].id == id) {
        result = this.list[t];
        break;
      }
    }
    return result;
  }

  display(tab) {
    var this_class = this;
    tab.cb(function() {
      if (this_class.displayed_tab) {
        this_class.displayed_tab.classList.remove("tabs_ui_selected");
      }
      this_class.displayed_tab = tab.element;
      this_class.displayed_tab.classList.add("tabs_ui_selected");

      this_class.display_div.innerHTML = "";
      return this_class.display_div;
    }());
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
