# Mellisuga #

#### a lightweight NodeJS based content management system that aims for flexibility, performance, stability and ease of use. ####

##### also [Mellisuga is a genus of hummingbirds](https://en.wikipedia.org/wiki/Mellisuga) #####

###### WARNING: This is an experimental version. There might be serious security vulnerabilities and bugs. Reported issues and calaborators appreciated. ######

### Installation ###

`npm install mellisuga`

You also need to install `PostgreSQL` database.

### Basic usage ###

```javascript
var Mellisuga = require("mellisuga");

(async function() {
  try {
    let cms = await Mellisuga.init({
      host: '127.0.0.1',
      port: 8080,
      db_user: 'postgres',
      db_pwd: 'password',
      app_path: __dirname
    });
  } catch (e) {
    console.error(e.stack);
  }
})();
```
