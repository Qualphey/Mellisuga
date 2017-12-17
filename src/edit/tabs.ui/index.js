require('./horz.css');

module.exports = function() {

  this.element = document.createElement('div');
  this.element.classList.add('tabs_ui_container');

  var list = this.list = document.createElement('div');
  list.classList.add('tabs_ui_menu');
  this.element.appendChild(list);

  var display = this.display = document.createElement('div');
  display.classList.add('tabs_ui_display');
  display.style.height = "calc(100% - 15px)";
  this.element.appendChild(display);

  this.set = function(pages) {
    this.pages = pages;
    for (p=0;p<pages.length;p++) {
      let page = pages[p];

      var item = document.createElement('button');
      item.innerHTML = page.text;
      item.addEventListener("click", function(e) {
        page.cb(function(element) {
          display.innerHTML = "";
          return display;
        }());
      });

      list.appendChild(item);
    }
  };
}
