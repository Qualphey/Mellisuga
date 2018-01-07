
const Page = require('./page.js');
const Post = require('./post.js');

module.exports = class {
  constructor(db, config) {
    this.Post = new Post(db, config);
    this.Post.init();
  }
};
