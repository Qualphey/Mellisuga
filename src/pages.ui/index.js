'use strict'

const XHR = require('../utils/xhr.js');
const Page = require('./page.js');

require('./style.less');
var html = require('./body.html');

module.exports = class {
  constructor(div) {
    div.innerHTML = html;
    div.classList.add('pages');

    this.list = div.querySelector(".list_display");

    var this_class = this;
    XHR.get('/pages', null, function() {
      var pages = JSON.parse(this.responseText);

      var table = div.querySelector('#pages_edit');

      var trs = [];
      var cur_tr = create_tr();

      function create_tr() {

        var tr = document.createElement('tr');
        tr.items = 0;
        tr.max_items = 6;
        tr.tds = [];

        tr.add = function(item) {
          var td = document.createElement('td');

          td.appendChild(item);

          if (tr.items == tr.max_items) {
            tr = create_tr();
            tr.appendChild(td);
            tr.tds.push(td);
            tr.items++;
          } else {
            tr.appendChild(td);
            tr.tds.push(td);
            tr.items++;
          }
        }

        function track_tr(trs, i) {
          if (i < trs.length) {
            if (trs[i].items > 0) {
              var ele = trs[i].tds[0];

              var item_index = trs[i].tds.indexOf(ele);
              trs[i].tds.splice(item_index, 1);
              trs[i].removeChild(ele);
              trs[i].items--;

              trs[i-1].appendChild(ele);
              trs[i-1].tds.push(ele);
              trs[i-1].items++;


              if (trs[i].items == tr.max_items-1) {
                track_tr(trs, i+1);
              }
            } else {
              table.removeChild(trs[i]);
              trs.splice(i, 1);
              tr = trs[i-1];
            }
          }
        }

        tr.rem = function(item) {
          for (var t = 0; t < trs.length; t++) {
            if (trs[t].contains(item)) {
              var item_index = trs[t].tds.indexOf(item.parentNode);
              trs[t].tds.splice(item_index, 1);
              trs[t].removeChild(item.parentNode);
              trs[t].items--;
              if (trs[t].items == 0 && t > 0) {
                table.removeChild(trs[t]);
                trs.splice(t, 1);
                tr = trs[t-1];
              } else if (trs[t].items == tr.max_items-1) {
                track_tr(trs, t+1);
              }
            }
          }

        }
        table.appendChild(tr);

        trs.push(tr);
        return tr;
      }

      for (let p = 0; p < pages.length; p++) {
        var page = new Page(pages[p], cur_tr);
        cur_tr.add(page.element);
//        this_class.list.appendChild();
      }

      var add_page_btn = document.createElement("div");
      add_page_btn.classList.add("list_item");
      add_page_btn.classList.add("add_item");
      add_page_btn.addEventListener("click", new_page);
      cur_tr.add(add_page_btn);

      var text = document.createElement("h3");
      text.innerHTML = "++";
      add_page_btn.appendChild(text);

      function new_page(e) {
        var input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Title";
        add_page_btn.innerHTML = "";
        add_page_btn.appendChild(input);
        input.focus();
        input.addEventListener('keyup', function (e) {
          if (e.keyCode == 13) {
            var data = {
              title: input.value
            }

            XHR.get(global.config.admin_path+'/new_page', data, function() {
              var res = JSON.parse(this.responseText);
              if (res.err) {
                console.log(res.err);
              } else {
                var page = new Page({
                  id: res.id,
                  data: {
                    title: data.title,
                    uri: encodeURIComponent(input.value)+".html",
                    context_uri: encodeURIComponent(input.value)+".json"
                  }
                }, cur_tr);

                cur_tr.rem(add_page_btn);
                cur_tr.add(page.element);
                cur_tr.add(add_page_btn);
                input.focus();
                input.value = '';
              }
            });
          }
        });
        add_page_btn.removeEventListener("click", new_page);
      }
    });
  }

}
