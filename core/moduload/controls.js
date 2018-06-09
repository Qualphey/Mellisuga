

module.exports = class {
  constructor(cfg, cms) {
    let command_path = cfg.command_path;
    let auth = cfg.auth;
    let modules_io = cms.modules;

    let err_response = function(res, text) {
      res.send(JSON.stringify({
        err: text
      }));
    }

    cms.app.post(command_path, auth.orize, async function(req, res) {
      try {
        var data = JSON.parse(req.body.data);
        /*
          {
            command: "add"|"rm",
            name: "string" - needed on `add` and `rm` commands
          }
        */
        switch (data.command) {
          case 'select':
            switch (data.method) {
              case "all":
                res.send(JSON.stringify( modules_io.all() ));
                break;
              /*case "name":
                if (data.name && data.name != '') {
                  res.send(JSON.stringify( modules_io.select(data.name) ));

                } else {
                  res.send(JSON.stringify({ err: "Name parameter missing" }));
                }
                break;
              case "all_from_list":
                if (data.list && data.list != '') {
                  res.send(JSON.stringify( modules_io.all_from_list(data.list) ));
                } else {
                  res.send(JSON.stringify({ err: "List parameter missing" }));
                }
                break;
              case "name_from_list":
                if (data.list && data.list != '' && data.name && data.name != '') {
                  res.send(JSON.stringify( modules_io.select_from_list(data.list, data.name) ));
                } else {
                  res.send(JSON.stringify({ err: "List/Name parameter missing" }));
                }
                break;*/
              default:
                res.send(JSON.stringify({ err: "Invalid selection method: "+data.method }));
            }
            break;
          case 'add':
            if (data.name && data.name != '' && data.list && data.list != '') {
              let taget_list = modules_io.select_list_obj(data.list);
              res.send(JSON.stringify( await taget_list.add(data.name) ));
            } else {
              res.send(JSON.stringify({ err: "Name/List parameter missing" }));
            }
            break;
          case 'rm':
            console.log("rm", data.list, data.name);
            if (data.name && data.name != '' && data.list && data.list != '') {
              let taget_list = modules_io.select_list_obj(data.list);
              res.send(JSON.stringify( taget_list.remove(data.name) ));
            } else {
              res.send(JSON.stringify({ err: "Name/List parameter missing" }));
            }
            break;

          case 'reload':
            if (data.name && data.name != '' && data.list && data.list != '') {
              let taget_list = modules_io.select_list_obj(data.list);
              res.send(JSON.stringify( taget_list.reload(data.name) ));
            } else {
              res.send(JSON.stringify({ err: "Name/List parameter missing" }));
            }
            break;
          default:
            console.error("PagesIO: unknown command", data.command);
        }
      } catch (e) {
        console.error(e.stack);
      }
    });
  }
}
