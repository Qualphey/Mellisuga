
'use strict'

const XHR = require('globals/utils/xhr_async.js');

module.exports = class {
  constructor(img, src, grid_ui, select_all) {
    this.element = document.createElement("div");
    this.element.classList.add("gallery_ui_item");
    this.element.appendChild(img);

    this.display_element = document.createElement("div");
    this.display_element.classList.add("gallery_ui_display");
    let dimg = document.createElement("img");
    dimg.src = src;
    this.display_element.appendChild(dimg); 

    let this_class = this;

    let checkbox = this.checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function(e) {
      if (!checkbox.checked) {
        select_all.checked = false; 
      }
    });

    let displayed = false;

    img.addEventListener('click', (e) => {
      document.body.style.overflow = "hidden";
      displayed = true;
    
      document.body.appendChild(this_class.display_element);

      let btn_box = document.createElement("div");
      this_class.display_element.appendChild(btn_box);

      let back_btn = document.createElement("button");
      back_btn.innerHTML = "<";

      btn_box.addEventListener("mouseover", (e) => {
        btn_box.appendChild(back_btn);
      });

      btn_box.addEventListener("mouseleave", (e) => {
        btn_box.removeChild(back_btn);
      });

      back_btn.addEventListener("click", function(e) {
        document.body.style.overflow = "auto";
        this_class.display_element.removeChild(btn_box);
        document.body.removeChild(this_class.display_element);
        displayed = false;
      });
    });

    this.element.addEventListener('mouseover', e => {
      if (!displayed) {
        this.element.appendChild(checkbox);
      }
    });

    this.element.addEventListener('mouseleave', e => {
      if (!displayed) {
        if (!checkbox.checked) {
          this.element.removeChild(checkbox);
        }
      }
    });

    this.src = src;
  }

  select() {
    this.checkbox.checked = true;
    this.element.appendChild(this.checkbox);
  }

  deselect() {
    this.checkbox.checked = false;
    if (this.element.contains(this.checkbox)) {
      this.element.removeChild(this.checkbox);
    } 
  }

  static async init(src, grid_ui, select_all) {
    return await new Promise(resolve => {
      var img = document.createElement('img');
      img.src = src;
      img.addEventListener("load", e => {
        resolve(new module.exports(img, src, grid_ui, select_all));
      });

      img.addEventListener("error", e => {
        console.error(e);
        resolve(undefined);
      });
    });
  }
}

