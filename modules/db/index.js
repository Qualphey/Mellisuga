'use strict'

const fs = require("fs");
const path = require("path");

const PostgreSQL = require('pg');
const { Pool, Client } = PostgreSQL;

var nunjucks = require('nunjucks');

module.exports = class {
  constructor() {
    this.nunjucks_env = new nunjucks.Environment(new nunjucks.FileSystemLoader(__dirname, {
      autoescape: true,
      noCache: true
    }));
  }

  async init(db_name, db_pwd) {
    try {
      var init_client = new Client({
        user: global.cmb_config.db_super_user,
        password: global.cmb_config.db_super_pwd,
        host: global.cmb_config.host,
        database: 'postgres',
        port: 5432
      });
      init_client.connect();

      init_client.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
      })

      var exists = await init_client.query("SELECT datname FROM pg_catalog.pg_database WHERE lower(datname) = lower('"+db_name+"')");

      if (exists.rowCount == 0) {
        await init_client.query("CREATE DATABASE "+db_name+";");
        await init_client.query("REVOKE connect ON DATABASE "+db_name+" FROM PUBLIC;");
        await init_client.query("CREATE USER "+db_name+" WITH PASSWORD '"+db_pwd+"';");
        await init_client.query("GRANT ALL PRIVILEGES ON DATABASE "+db_name+" to "+db_name+";");
      }

      init_client.end()
        .then(() => console.log('initialisation db client has disconnected'))
        .catch(err => console.error('error during disconnection', err.stack))


      init_client = new Client({
        user: global.cmb_config.db_super_user,
        password: global.cmb_config.db_super_pwd,
        host: global.cmb_config.host,
        database: db_name,
        port: 5432
      });
      init_client.connect();

      init_client.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
      });

      await init_client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');

      init_client.end()
        .then(() => console.log('initialisation db client has disconnected'))
        .catch(err => console.error('error during disconnection', err.stack))

//+-+-+-+-+-+-+-+-+-+-+-+-+-

      const pool = new Pool({
        user: db_name,
        password: db_pwd,
        host: global.cmb_config.host,
        database: db_name,
        port: 5432
      });

      pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err)
        process.exit(-1)
      });

      const client = this.client = await pool.connect();

    } catch (e) { console.error(e.stack) }
  }

  get Table() {
    var db_class = this;
    return class {
      constructor(name, context) {
        this.name = name;
        context.table = name;
        this.sql = db_class.nunjucks_env.render('template.sql', context);
      }

      async init() {
        await db_class.client.query(this.sql).catch(e => console.error(e.stack));
      }

      async insert(obj) {
        try {
          var json = JSON.stringify(obj);
          var qstr = "EXECUTE "+this.name+"_insert('"+json+"'::jsonb)";
          return (await db_class.client.query(qstr)).rows[0].id;
        } catch (e) {
          console.error(e.stack);
          return false;
        }
      }

      async all(ids) {
        try {
          var qstr = "SELECT * FROM "+this.name;
          return (await db_class.client.query(qstr)).rows;
        } catch (e) {
          console.error(e.stack);
          return false;
        }
      }

      async select(ids) {
        try {
          var arr_str = '';
          for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            arr_str += "'"+id+"'::uuid";
            if (i < ids.length-1) {
              arr_str += ", ";
            }
          }
          var qstr = "EXECUTE "+this.name+"_select_by_ids(ARRAY["+arr_str+"])";
          return (await db_class.client.query(qstr)).rows;
        } catch (e) {
          console.error(e.stack);
          return false;
        }
      }

      async select_by_property(prop, value) {
        try {
          var qstr = "EXECUTE "+this.name+"_select_by_"+prop+"('"+value+"')";
          return (await db_class.client.query(qstr)).rows;
        } catch (e) {
          console.error(e.stack);
          return false;
        }
      }

      async select_by_array(array, tags) {
        try {
          var arr_str = '';
          for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            arr_str += "'"+tag+"'";
            if (i < tags.length-1) {
              arr_str += ", ";
            }
          }
          var qstr = "EXECUTE "+this.name+"_select_by_"+array+"(ARRAY["+arr_str+"])";
          return (await db_class.client.query(qstr)).rows;
        } catch (e) {
          console.error(e.stack);
          return false;
        }
      }

      async update(obj, id) {
        try {
          var json = JSON.stringify(obj);
          var qstr = "EXECUTE "+this.name+"_update_by_id('"+json+"'::jsonb, '"+id+"'::uuid)";
          await db_class.client.query(qstr);
          return true;
        } catch (e) {
          console.error(e.stack);
          return false;
        }
      }

      async delete(ids) {
        try {
          var arr_str = '';
          for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            arr_str += "'"+id+"'::uuid";
            if (i < ids.length-1) {
              arr_str += ", ";
            }
          }
          var qstr = "EXECUTE "+this.name+"_delete_by_ids(ARRAY["+arr_str+"])";
          return true;
        } catch (e) {
          console.error(e.stack);
          return false;
        }
      }
    }
  }

  async query(str) {
    return this.client.query(str);
  }
}
