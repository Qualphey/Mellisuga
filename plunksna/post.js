
module.exports = class {
  constructor(db, config) {
    this.db = db;
    this.config = config;
  }

  async all() {
    return await this.db.select("*", "posts");
  }

  async select(tags) {
    return await this.db.select("*", "posts", {
      tags: tags
    });
  };

  async create(data) {
    return await this.db.insert("posts(data)", [data]);
  }

  async edit(data) {
    var id = data.id;
    delete data.id;
    await this.db.update("posts", { data: data }, { id: id });
    console.log("post created");
  }

  async delete(data) {
    await this.db.delete("posts", { id: data.id });
  }
}
