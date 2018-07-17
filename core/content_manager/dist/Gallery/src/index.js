

(async () => {
  try {
    const XHR = require('globals/utils/xhr_async.js');
    const Image = require('./image.js');

    var GridUI = require('globals/grid.ui/index.js');

    var grid_ui = new GridUI(6, window.innerWidth, 10, 300);
    document.body.appendChild(grid_ui.element);
    grid_ui.resize(window.innerWidth);

    window.addEventListener('resize', function() {
      grid_ui.resize(window.innerWidth);
    });
   
    let add_temp_btn = document.createElement("div");
    add_temp_btn.classList.add("gallery_ui_item");
    add_temp_btn.classList.add("gallery_ui_add");
    add_temp_btn.addEventListener("click", upload_image);


    let text = document.createElement("h3");
    text.innerHTML = "++";
    add_temp_btn.appendChild(text);

    grid_ui.add(add_temp_btn);
    
    let srcs = await XHR.get('/content-manager/gallery', {
      command: "all"
    });

    let images = [];
 
    let select_all = document.getElementById("select_all");
    select_all.addEventListener("change", function(e) {
      if (select_all.checked) {
        for (let i = 0; i < images.length; i++) {
          images[i].select();
        }
      } else {
        for (let i = 0; i < images.length; i++) {
          images[i].deselect();
        }
      }
    });

    let delete_selection_button = document.getElementById("delete_selection");
    delete_selection_button.addEventListener('click', function(e) {
      let selected_items = [];
      let srcs = [];
      for (let i = 0; i < images.length; i++) {
        if (images[i].checkbox.checked) {
          selected_items.push(images[i]);
          srcs.push(images[i].src);
        }
      }

      if (selected_items.length > 0) {
        var popup = document.createElement('div');
        popup.classList.add("gallery_ui_popup");
        document.body.appendChild(popup);

        var message = document.createElement("p");
        message.innerHTML = "Are you sure you want to delete the images that you've selected?";
        popup.appendChild(message);

        var ybtn = document.createElement("button");
        ybtn.innerHTML = "yes";
        ybtn.addEventListener("click", async (e) => {
          let resp = await XHR.post("/content-manager/gallery", {
            command: "rm",
            src: srcs
          }, "access_token");
          if (resp === "success") {
            for (let i = 0; i < selected_items.length; i++) {
              grid_ui.remove(selected_items[i].element);
              images.splice(images.indexOf(selected_items[i]), 1);
            }

            document.body.removeChild(popup);
            
            select_all.checked = false;
          } else {
            window.location.reload();
          }
        });
        popup.appendChild(ybtn);

        var nbtn = document.createElement("button");
        nbtn.innerHTML = "no";
        nbtn.addEventListener("click", (e) => {
          document.body.removeChild(popup);
        });
        popup.appendChild(nbtn);

      }  
    });   

    for (var i = 0; i < srcs.length; i++) {
      var src = srcs[i];
      var image = await Image.init(src, grid_ui, select_all);
      if (image) {
        images.push(image);
        grid_ui.add(image.element);
      }
      grid_ui.resize(window.innerWidth);
    }
    
    function upload_image() {
      var form = document.createElement('form');
      form.enctype = "multipart/form-data";
      document.body.appendChild(form);

      var upload_input = document.createElement("input");
      upload_input.type = "file";
      upload_input.name = "filei";
      upload_input.multiple = "multiple";
      upload_input.style.display = "none";
      form.appendChild(upload_input);

      upload_input.addEventListener("change", async function(e) {
        var files = this.files;

        var formData = new FormData(form);

        var nsrcs = await XHR.post(
          '/content-manager/gallery-upload',
          { formData: formData },
          'access_token'
        );

        for (var i = 0; i < nsrcs.length; i++) {
          var src = nsrcs[i];
          var existing = undefined;
          images.forEach(image => {
            if (image.src === src) {
              existing = image;
            }
          });


          if (existing) {
            grid_ui.remove(existing.element);
          }
          var image = await Image.init(src, grid_ui, select_all);
          if (image) {
            grid_ui.insert(image.element, 1);
            images.push(image);
          }
        }
      }, false);
      upload_input.click();
    }

 

  } catch (e) {
    console.error(e);
  }

})();

