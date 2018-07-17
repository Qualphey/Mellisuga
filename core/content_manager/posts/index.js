
module.exports = class {
  constructor(table, cmbird) {
    let app = this.app = cmbird.app;
    const path_prefix = "/content-manager";

    this.table = table;

    let this_class = this;

    app.get("/posts", async function(req, res) {
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

    app.post(path_prefix+"/posts", async function(req, res) {
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

  static async init(cmbird) {
    try {
      let table = await cmbird.aura.table('posts', {
        columns: {
          id: 'uuid',
          title: 'text',
          content: 'text',
          tags: 'text[]'
        }
      });
      return new module.exports(table, cmbird);
    } catch (e) {
      console.error(e.stack);
      return false;
    }
  }

// -- GET
  async all() {
    try {
      var posts = await this.table.select('*');
      return posts;
    } catch (e) {
      console.error(e.stack);
      return false;
    }
  }

  async select_by_tags(tags) {
    try {
      var found = await this.table.select(
        "*", "tags && $1", [tags]
      );
      return found;
    } catch (e) {
      console.error(e.stack);
      return false;
    }
  };

  async select_by_title(title) {
    try {
      return await this.table.select(
        '*', "title = $1", [title]
      );
    } catch (e) {
      console.error(e.stack);
      return false;
    }
  }

// -- POST
  async create(data) {
    try {
      var found = await this.select_by_title(data.title);

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
      console.error(e.stack);
      return false;
    }

  }

  async edit(data) {
    try {
      var id = data.id;
      delete data.id;
      await this.table.update(data, "id = $1", [id]);
      return "success";
    } catch (e) {
      console.error(e.stack);
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
        await this.table.delete(where, ids);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error(e.stack);
      return false;
    }
  }
}
