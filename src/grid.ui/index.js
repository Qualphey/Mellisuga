'use strict'

var TR = require('./tr.js');

module.exports = class {
  constructor() {
    this.element = document.createElement('table');
    this.element.classList.add('dynamic_table');

    this.trs = [];
    this.cur_tr = new TR();
    this.element.appendChild(this.cur_tr.element);
    this.trs.push(this.cur_tr);

  }

  add(item) {
    if (this.cur_tr.items == this.cur_tr.max_items) {
      this.cur_tr = new TR();
      this.element.appendChild(this.cur_tr.element);

      var td = document.createElement('td');
      td.appendChild(item);
      this.cur_tr.add(td);

      this.trs.push(this.cur_tr);
    } else {
      var td = document.createElement('td');
      td.appendChild(item);
      this.cur_tr.add(td);
    }
  }

  remove(item) {
    for (var t = 0; t < this.trs.length; t++) {
      var tr = this.trs[t];
      if (tr.contains(item)) {
        tr.remove(item.parentNode);
        if (tr.items == 0 && t > 0) {
          this.element.removeChild(tr.element);
          this.trs.splice(t, 1);
          this.cur_tr = this.trs[t-1];
        } else if (tr.items == tr.max_items-1) {
          this.track(t+1);
        }
      }
    }
  }

  track(t) {
    if (t < this.trs.length) {
      var tr = this.trs[t];
      if (tr.items > 0) {
        var td = tr.tds[0];
        tr.remove(td);
        this.trs[t-1].add(td);
        if (tr.items == tr.max_items-1) {
          this.track(t+1);
        }
      } else {
        this.element.removeChild(this.trs[t].element);
        this.trs.splice(t, 1);
        this.cur_tr = this.trs[t-1];
      }
    }
  }
}
