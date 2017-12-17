'use strict'

const fs = require('fs');

module.exports = class {
  constructor(db, config) {
    this.db = db;
    this.config = config;
    this.config.page_template = fs.readFileSync(__dirname+'/default_template/index.html', 'utf8');
    this.config.context_template = fs.readFileSync(__dirname+'/default_template/context.json', 'utf8');
  }

  async all() {
    return await this.db.select("*", "pages");
  }

  async create(data) {
    var dir = this.config.pages_path+"/"+data.title+"/";
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }

/*    if (data.template) {

    } else {
      fs.writeFileSync(dir+"index.html", this.default_template.html);
      fs.writeFileSync(dir+"context.json", this.default_template.html);
      fs.writeFileSync(dir+"theme.css", this.default_template.html);
      fs.writeFileSync(dir+"main.js", this.default_template.html);
    }*/



    data.uri = encodeURIComponent(data.title)+".html";
    data.context_uri = encodeURIComponent(data.title)+".json";

    fs.writeFileSync(this.config.pages_path+"/"+data.uri, this.config.page_template);
    fs.writeFileSync(this.config.pages_path+"/"+data.context_uri, this.config.context_template);

    return await this.db.insert("pages(data)", [data]);
  }

  async edit(data) {
    console.log("overwrite ",data);
    fs.writeFileSync(this.config.pages_path+"/"+data.uri, data.html);
    fs.writeFileSync(this.config.pages_path+"/"+data.context_uri, data.context);
  }

  async delete(data) {
    // TODO : select by id from db to retrieve uri.
    // Because xhr received uri might be a threat
    await this.db.delete("pages", { id: data.id });
    fs.unlinkSync(this.config.pages_path+"/"+data.uri);
    fs.unlinkSync(this.config.pages_path+"/"+data.context_uri);
  }

  async compile_context(context) {
    if (context.posts) {
      var tags = context.posts.split(" ");
      var result = await this.db.select("*", "posts", {
        tags: tags
      });

      context.posts = result;
    }
    return context;
  }
}
