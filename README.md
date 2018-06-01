# Mellisuga #

#### a lightweight NodeJS based content management system that aims for flexibility, performance, stability and ease of use. ####

##### also [Mellisuga is a genus of hummingbirds](https://github.com/user/repo/blob/branch/other_file.md) #####



### Installation ###

`npm install cmbird`

Though you also need to install `PostgreSQL` database.

### Basic usage ###

```javascript
var CMS = require("cmbird");
var cms = new CMS({
  host : '127.0.0.1',
  port : 9639,
  db_user : 'postgres', // or any other database user with super permissions
  db_pwd: 'password',
  app_path : __dirname
});
```

#### WARNING: This is an experimental version. There might be serious security vulnerabilities and bugs. Reported issues and calaborators appreciated. ####
