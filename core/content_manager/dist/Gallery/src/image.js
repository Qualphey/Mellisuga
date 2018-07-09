
'use strict'

const XHR = require('globals/utils/xhr_async.js');

module.exports = class {
  constructor(img, src, grid_ui) {
    this.element = document.createElement("div");
    this.element.classList.add("gallery_ui_item");
    this.element.appendChild(img);

    this.display_element = document.createElement("div");
    this.display_element.classList.add("gallery_ui_display");
    let dimg = document.createElement("img");
    dimg.src = src;
    this.display_element.appendChild(dimg); 

    let this_class = this;

    var xbtn = document.createElement('button');
    xbtn.innerHTML = "x";

    xbtn.addEventListener("click", e => {
      var popup = document.createElement('div');
      popup.classList.add("gallery_ui_popup");
      document.body.appendChild(popup);

      var message = document.createElement("p");
      message.innerHTML = "Are you sure you want to delete this image?";
      popup.appendChild(message);

      var ybtn = document.createElement("button");
      ybtn.innerHTML = "yes";
      ybtn.addEventListener("click", async (e) => {
        await XHR.post("/content-manager/gallery", {
          command: "rm",
          src: src
        }, "access_token");
        grid_ui.remove(this_class.element);
        document.body.removeChild(popup);
      });
      popup.appendChild(ybtn);

      var nbtn = document.createElement("button");
      nbtn.innerHTML = "no";
      nbtn.addEventListener("click", (e) => {
        document.body.removeChild(popup);
      });
      popup.appendChild(nbtn);
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
        this.element.appendChild(xbtn);
      }
    });

    this.element.addEventListener('mouseleave', e => {
      if (!displayed) {
        this.element.removeChild(xbtn);
      }
    });

    this.src = src;
  }

  static async init(src, grid_ui) {
    return await new Promise(resolve => {
      var img = document.createElement('img');
      img.src = src;
      img.addEventListener("load", e => {
        resolve(new module.exports(img, src, grid_ui));
      });

      img.addEventListener("error", e => {
        console.error(e);
        resolve(undefined);
      });
    });
  }
}

