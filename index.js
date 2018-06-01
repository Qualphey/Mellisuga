'use strict'

const CORE = require('./core/index.js');

module.exports = class {
  static async init(cfg) {
    try {
      return await CORE.init(cfg);
    } catch (e) {
      console.error(e);
      return undefined;
    }
}
