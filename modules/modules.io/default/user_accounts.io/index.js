const bcrypt = require('bcryptjs');

module.exports = class {
  constructor(app, table, config) {
    this.app = app;

    this.table = table;
    this.config = config;

    var this_class = this;
    console.log("USERS");

    app.post(global.cmb_config.admin_path+"/user_accounts.io", async function(req, res) {
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
            var auras = await table.select(['email', 'super', 'rights', 'creator']);
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
            break
          default:
            console.error("Unknown command:", data.command);
        }
      } catch(e) {
        console.error(e.stack);
      };
    });

  }

  static async init(app, table, config) {
    try {
      return new module.exports(app, table, config);
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
