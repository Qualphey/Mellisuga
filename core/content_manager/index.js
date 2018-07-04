const path = require("path");

const PostsIO = require("./posts/index.js");
const Gallery = require("./gallery/index.js");

module.exports = class ContentManager {
  
  constructor(cms, cfg) {
    
  }

  static async init(cms, cfg) {
    let this_class = new module.exports(cms, cfg);
    let posts = this_class.posts = await PostsIO.init(cms, cfg.posts);
    let gallery = this_class.gallery = await Gallery.init(cms, cfg.gallery);

    cms.pages.serve_dirs("/content_management", path.resolve(__dirname, 'dist'), {
      auth: cms.admin.auth,
      globals_path: path.resolve(__dirname, 'globals'),
      name: "content management",
      required_rights: [ "content_management" ]
    });
  }
}

