
'use strict'

const XHR = require('globals/utils/xhr_async.js');

const display_html = require('./display.html');

module.exports = class {
  constructor(img, src, grid_ui, select_all, images) {
    this.images = images;
    this.element = document.createElement("div");
    this.element.classList.add("gallery_ui_item");
    this.element.appendChild(img);

    this.display_element = document.createElement("div");
    this.display_element.classList.add("gallery_ui_display");
    this.display_element.innerHTML = display_html;
    let dimg = this.display_element.querySelector("img");
    dimg.src = src;
    
    let this_class = this;

    let checkbox = this.checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", function(e) {
      if (!checkbox.checked) {
        select_all.checked = false; 
      }
    });

    this.displayed = false;

    img.addEventListener('click', function() {
      this_class.display();
    });

    this.element.addEventListener('mouseover', e => {
      if (!this_class.displayed) {
        this.element.appendChild(checkbox);
      }
    });

    this.element.addEventListener('mouseleave', e => {
      if (!this_class.displayed) {
        if (!checkbox.checked) {
          this.element.removeChild(checkbox);
        }
      }
    });
    
    this.hide_element = function(e) {
      document.body.style.overflow = "auto";
      document.body.style.position = "";
      this_class.hide(); 
    };

    this.navigate_left = function(e) {
      const next_index = this_class.images.indexOf(this_class)-1;
      if (next_index > -1 && next_index < this_class.images.length) {
        this_class.images[next_index].display();
        this_class.hide();
      }
    }

    this.navigate_right = function(e) {
      const next_index = this_class.images.indexOf(this_class)+1;
      if (next_index > -1 && next_index < this_class.images.length) {
        this_class.images[next_index].display();
        this_class.hide();
      }
    }

    this.src = src;
  }

  display() {
    let display_controls = this.display_element.querySelector(".display_controls");
    let back_btn = this.display_element.querySelector('.display_close');
    let left_btn = this.display_element.querySelector('.display_left');
    let right_btn = this.display_element.querySelector('.display_right');

    const this_index = this.images.indexOf(this);
    if (this_index < 1) {
      if (display_controls.contains(left_btn)) {
        display_controls.removeChild(left_btn);
      }
    } else {
      if (!display_controls.contains(left_btn)) {
        display_controls.appendChild(left_btn);
      }
      left_btn.addEventListener("click", this.navigate_left);
    }

    if (this_index > this.images.length-2) {
      if (display_controls.contains(right_btn)) {
        display_controls.removeChild(right_btn);
      }
    } else {
      if (!display_controls.contains(right_btn)) {
        display_controls.appendChild(right_btn);
      }
      right_btn.addEventListener("click", this.navigate_right);
    }

    let this_class = this;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    this_class.displayed = true;
 
    let hide_after = 2000; // 1000 miliseconds
    let last_moved = Date.now();

    this.interv = setInterval(function() {
      let now = Date.now();
      if (last_moved < now-hide_after) {
        display_controls.style.display = "none";
      }
    }, 1000);

    this.mouse_moved_listener = function () {
      if (display_controls.style.display === "none") {
        display_controls.style.display = "";
      }
      last_moved = Date.now();
    };

    document.addEventListener('mousemove', this.mouse_moved_listener, false);

    back_btn.addEventListener("click", this.hide_element);
     
    document.body.appendChild(this_class.display_element);
  }
  
  hide() { 
    document.body.removeChild(this.display_element);
    this.displayed = false;
    document.removeEventListener('mousemove', this.mouse_moved_listener, false);
    document.removeEventListener('click', this.hide_element, false);
    document.removeEventListener('click', this.navigate_left, false);
    document.removeEventListener('click', this.navigate_right, false);
    clearInterval(this.interv);
  }

  select() {
    this.checkbox.checked = true;
    this.element.appendChild(this.checkbox);
  }

  deselect() {
    this.checkbox.checked = false;
    if (this.element.contains(this.checkbox)) {
      this.element.removeChild(this.checkbox);
    } t
  }

  static async init(src, grid_ui, select_all, images) {
    return await new Promise(resolve => {
      var img = document.createElement('img');
      img.src = src;
      img.addEventListener("load", e => {
        resolve(new module.exports(img, src, grid_ui, select_all, images));
      });

      img.addEventListener("error", e => {
        console.error(e);
        resolve(undefined);
      });
    });
  }
}

