
module.exports = class {
  constructor(db, config) {
    this.table = new db.Table('posts', {
      arrays: ['tags'],
      props: ['title']
    });
    this.config = config;
  }

  async init() {
    await this.table.init();
  }

  async all() {
    return await this.table.all();
  }

  async select(tags) {
    return await this.table.select_by_array("tags", tags);
  };

  async select_by_title(title) {
    return await this.table.select_by_property('title', title)
  }

  async create(data) {
    return await this.table.insert(data);
  }

  async edit(data) {
    var id = data.id;
    delete data.id;
    await this.table.update(data, id);
    console.log("post created");
  }

  async delete(data) {
    await this.table.delete(data.id);
  }
}
