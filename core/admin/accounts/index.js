const bcrypt = require('bcryptjs');

module.exports = class {
  constructor(cmbird) {
    let app = cmbird.app, table = cmbird.admin.auth.table;
    this.app = app;

    this.table = table;

    var this_class = this;
    console.log("ADMINS");

    app.post(cmbird.config.admin_path+"/admin_accounts.io", cmbird.admin.auth.orize_gen(["super_admin"]), async function(req, res) {
      try {
        let data;
        try {
          data = JSON.parse(req.body.data);
        } catch (e) {
          data = req.body.data;
        }

        var command = data.command;
        data = data.data
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
        switch (command) {
          case "all":
            var auras = await table.select(['email', 'super', 'cfg', 'creator']);
            res.send(JSON.stringify(auras));
            break;
          case "add":

            const existing = await table.select(
              ["email"],
              "email = $1",
              [data.email]
            );

            if (existing.length > 0) {
              res.send("EMAIL ALREADY IN USE!");
            } else {
              var salt = bcrypt.genSaltSync(10);
              data.password = bcrypt.hashSync(data.password, salt);
              console.log(data);
              if (data.cfg === "") {
                data.cfg = "{}";
              }
              await table.insert(data);
              res.send("success");
            }
            break;
          case "rm":
          console.log("REMOVE", data.email);
            await table.delete(
              "email = $1",
              [data.email]
            );
            res.send("success");
            break;
          case "edit":
            try {
              JSON.parse(data.cfg);
              await table.update(
                { super: data.super, cfg: data.cfg },
                "email = $1",
                [data.email]
              );
              res.send("success");
            } catch (e) {
              res.send(e.message);
            }
            break;
          default:
            console.error("Unknown command:", data.command);
        }
      } catch(e) {
        console.error(e.stack);
      };
    });

  }

  static async init(app, table) {
    try {

      return new module.exports(app, table);
    } catch (e) {
      console.error(e.stack);
      return false;
    }
  }
}
