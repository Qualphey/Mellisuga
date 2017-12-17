
const Page = require('./page.js');
const Post = require('./post.js');

module.exports = class {
  constructor(db, config) {
    this.Page = new Page(db, config);
    this.Post = new Post(db, config);
  }
};
