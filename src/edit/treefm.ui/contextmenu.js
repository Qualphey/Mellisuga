var html = require("./contextmenu.html");

module.exports = class {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add("treefm_contexmenu");
    document.body.appendChild(this.element);
  }

  display(x, y, callbacks) {
    this.element.innerHTML = html;

    for (let name in callbacks) {
      var item = this.element.querySelector('div[name="'+name+'"]');
      if (!callbacks[name]) {
        item.style.display = "none";
      } else {
        item.addEventListener("click", function(e) {
          callbacks[name]();
        });
      }
    }

    this.element.style.display = "block";
    this.element.style.left = x+"px";
    this.element.style.top = y+"px";
  }

  hide() {
    this.element.style.display = "none";
  }
}
