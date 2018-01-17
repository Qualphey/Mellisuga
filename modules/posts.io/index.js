
module.exports = class {
  constructor(app, db, config) {
    this.app = app;

    this.table = new db.Table('posts', {
      arrays: ['tags'],
      props: ['title']
    });
    this.config = config;

    var this_class = this;

    app.get("/posts.io", async function(req, res) {
      try {
        var data = JSON.parse(req.query.data);
        /*
          {
            command: string -> "all"|"select"|"select_by_title",
            title: "string",
            tags: ["string"]
          }
        */
        switch (data.command) {
          case 'all':
            var list = await this_class.all();
            res.send(JSON.stringify(list));
            break;
          case 'select':
            if (data.title) {
              var result = await this_class.select_by_title(data.title);
              res.send(JSON.stringify(result));
            } else if (data.tags) {
              var result = await this_class.select_by_tags(data.tags);
              res.send(JSON.stringify(result));
            }
            break;
          default:
            console.log("PagesIO: unknown command", data.command);
        }
      } catch(e) {
        console.error(e.stack);
      };
    });

    app.post(global.cmb_config.admin_path+"/posts.io", async function(req, res) {
      try {
        var data = JSON.parse(req.body.data);
        /*
          {
            command: string -> "create"|"edit"|"delete",
            title: "string",
            post: {
              title: "string",
              tags: ["string"],
              content: "string"
            },
            ids: ["UUID"]
          }
        */
        switch (data.command) {
          case 'create':
            if (data.post) {
              var json = await this_class.create(data.post);
              res.send(json);
            }
            break;
          case 'edit':
            if (data.post) {
              var json = await this_class.edit(data.post);
              res.send(json);
            }
            break;
          case 'delete':
            if (data.ids) {
              this_class.delete(data.ids);
              res.send("success");
            }
            break;
          default:
            console.log("PagesIO: unknown command", data.command);
        }
      } catch(e) {
        console.error(e.stack);
      };
    });

  }

  async init() {
    await this.table.init();
  }

// -- GET
  async all() {
    return await this.table.all();
  }

  async select_by_tags(tags) {
    return await this.table.select_by_array("tags", tags);
  };

  async select_by_title(title) {
    return await this.table.select_by_property('title', title)
  }

// -- POST
  async create(data) {
    // TODO : possibly need -> try {} catch ()
    var found = await this.select_by_title(data.title);

    var json;
    if (found.length == 0) {
      var result = await this.table.insert(data);
      json = JSON.stringify({
        id: result[0][0]
      });
    } else {
      json = JSON.stringify({
        err: "Post named `"+data.title+"` already exists!"
      });
    }
    return json;
  }

  async edit(data) {
    var id = data.id;
    delete data.id;
    await this.table.update(data, id);
    return "success";
  }

  async delete(ids) {
    console.log(ids);
    await this.table.delete(ids);
  }
}
