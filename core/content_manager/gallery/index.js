
const fs = require("fs");
const path = require("path");

const express = require("express");

module.exports = class {

  static async init(cms, cfg) {
    const gallery_path = path.resolve(cms.app_path, "gallery");
    const path_prefix = "/content-manager";
    let app = cms.app;


    if (!fs.existsSync(gallery_path)){
      fs.mkdirSync(gallery_path);
    }

    this.path = gallery_path;

    app.get(path_prefix+"/gallery", function(req, res) {
      var data = JSON.parse(req.query.data);

      switch (data.command) {
        case 'all':
          var srcs = [];
          fs.readdirSync(gallery_path).forEach(file => {
            srcs.push(file);
          });

          srcs.sort((a, b) => {
            return fs.statSync(path.resolve(gallery_path, b)).birthtime.getTime() - fs.statSync(path.resolve(gallery_path, a)).birthtime.getTime();
          });

          srcs.forEach(src => {
          })

          for (var i = 0; i < srcs.length; i++) {
            srcs[i] = "/gallery-directory/"+srcs[i];
          }

          res.send(JSON.stringify(srcs));
          break;
        default:

      }

    });

    app.use('/gallery-directory', express.static(gallery_path));


    app.post(path_prefix+"/gallery", cms.admin.auth.orize_gen(["content_management"]), function(req, res) {
      var data = JSON.parse(req.body.data);

      switch (data.command) {
        case 'rm':
          for (let i = 0; i < data.src.length; i++) {
            var image_path = path.resolve(gallery_path, data.src[i].split('/').pop());
            fs.unlinkSync(image_path); 
          } 
          res.send("success");
          break;
        default:

      }

    });

    var multer  = require('multer');
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, gallery_path)
      },
      filename: function (req, file, cb) {
          cb(null, file.originalname)
        }
      }
    )

    var upload = multer({ storage: storage })

    app.post(path_prefix+'/gallery-upload', cms.admin.auth.orize_gen(["content_management"]), upload.array('filei'), function(req, res) {
      var data = req.files;
      var name_list = [];
      for (var f = 0; f < data.length; f++) {
        name_list.push("/gallery-directory/"+data[f].filename);
        console.log("File uploaded to: ", data[f].path);
      }

      res.send(JSON.stringify(name_list));
    });
  }
}
