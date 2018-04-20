'use strict'

var TR = require('./tr.js');

require('./theme.less');

module.exports = class {
  constructor(items_in_row, width, min_a) {
    this.element = document.createElement('table');
    this.element.classList.add('grid_ui');

    this.min_a = min_a;
    this.items_in_row = items_in_row;
    this.item_a = width/items_in_row-4;
    if (this.item_a < this.min_a) {
      this.item_a = this.min_a;
    }

    this.trs = [];
    this.tds = [];
    this.cur_tr = new TR(items_in_row);
    this.element.appendChild(this.cur_tr.element);
    this.trs.push(this.cur_tr);

  }

  resize(width) {
    if (width) {
      this.item_a = width/this.items_in_row-4;
      if (this.item_a < this.min_a) {
        this.item_a = this.min_a;
      }
    }

    for (var i = 0; i < this.tds.length; i++) {
      this.tds[i].style.width = this.item_a+"px";
      this.tds[i].style.height = this.item_a+"px";

      this.tds[i].style.minWidth = this.min_a+"px";
    }
  }

  add(item) {
    console.log(item, this.cur_tr.items, this.cur_tr.max_items);
    if (this.cur_tr.items == this.cur_tr.max_items) {
      this.cur_tr = new TR(this.items_in_row);
      this.element.appendChild(this.cur_tr.element);

      var td = document.createElement('td');
      td.appendChild(item);
      this.cur_tr.add(td);

      this.trs.push(this.cur_tr);
      this.tds.push(td);
      this.resize();
    } else {
      var td = document.createElement('td');
      td.appendChild(item);
      this.cur_tr.add(td);
      this.tds.push(td);
      this.resize()
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
