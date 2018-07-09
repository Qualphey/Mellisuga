
module.exports = class {
  constructor() {
    this.jwt_secret = crypto.randomBytes(64).toString('hex');
    this.cookie_secret = crypto.randomBytes(64).toString('hex');
  }
};
