
module.exports = class {
  constructor() {
    this.interval = setInterval(function() {
      console.log("                    - TESTRON 3000 -");
    }, 1000);
  }

  static async init() {
    try {
      return new module.exports();
    } catch (e) {
      console.error(e.stack);
      return undefined;
    }
  }

  destroy() {
    console.log("DESTROYED");
    clearInterval(this.interval);
  }
}
