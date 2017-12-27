'use strict'

module.exports = class {
  constructor() {
    this.element = document.createElement('tr');
    this.items = 0;
    this.max_items = 6;
    this.tds = [];

  }

  add(td) {
    this.tds.push(td);
    this.items++;
    this.element.appendChild(td);
  }

  remove(td) {
    var td_index = this.tds.indexOf(td);
    this.tds.splice(td_index, 1);
    this.items--;
    this.element.removeChild(td);
  }

  contains(td) {
    return this.element.contains(td);
  }
}
