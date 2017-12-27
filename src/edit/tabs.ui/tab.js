

module.exports = class {
  constructor(data, tabs) {
    this.id = data.id;
    this.cb = data.cb;
    this.tabs = tabs;

    this.element = document.createElement('div');
    this.element.classList.add("tabs_ui_menu_item");

    var text = document.createElement('div');
    text.innerHTML = data.text;
    this.element.appendChild(text);

    var this_class = this;

    text.addEventListener("click", function(e) {
      this_class.display();
    });

    var close = document.createElement('button');
    close.innerHTML = "⨯";
    this.element.appendChild(close);

    close.addEventListener("click", function(e) {
      this_class.tabs.remove(this_class);
    });
  }

  display() {
    this.tabs.display(this);
  }
}
