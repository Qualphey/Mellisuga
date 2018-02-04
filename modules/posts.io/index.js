
module.exports = class {
  constructor(app, table, config) {
    this.app = app;

    this.table = table;
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
              console.log("RESPONSE", json);
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
            console.log("DELETE");
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

  static async init(app, aura, config) {
    try {
      var table = await aura.table('posts', {
        columns: {
          title: 'text',
          content: 'text',
          tags: 'text[]'
        }
      });
      return new module.exports(app, table, config);
    } catch (e) {
      console.log(e);
      return false;
    }
  }

// -- GET
  async all() {
    try {
      console.log("ALL POST");
      var posts = await this.table.select('*');
      return posts;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async select_by_tags(tags) {
    try {
    console.log("TAG POST", tags);
      var found = await this.table.select(
        "*", "tags && $1", [tags]
      );
      console.log("FOUND", found);
      return found;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  async select_by_title(title) {
    try {
    console.log("TITLE POST");
      return await this.table.select(
        '*', "title = $1", [title]
      );
    } catch (e) {
      console.log(e);
      return false;
    }
  }

// -- POST
  async create(data) {
    try {
      // TODO : possibly need -> try {} catch ()
      console.log("CREATING POST");
      var found = await this.select_by_title(data.title);

      console.log("FOUND", found);

      var json;
      if (found.length == 0) {
        var result = await this.table.insert(data);
        json = JSON.stringify({
          id: result
        });
      } else {
        json = JSON.stringify({
          err: "Post named `"+data.title+"` already exists!"
        });
      }
      return json;
    } catch (e) {
      console.log(e);
      return false;
    }

  }

  async edit(data) {
    try {
      var id = data.id;
      delete data.id;
      console.log("EDIT POST", data);
      await this.table.update(data, "id = $1", [id]);
      return "success";
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async delete(ids) {
    try {
      if (ids) {
        var where = '';
        for (var i = 0; i < ids.length; i++) {
          if (i > 0) {
            where += ' OR id = $'+(i+1);
          } else {
            where += 'id = $'+(i+1);
          }
        }
        console.log(where);
        await this.table.delete(where, ids);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
