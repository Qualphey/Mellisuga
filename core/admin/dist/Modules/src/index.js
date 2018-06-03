const XHR = require('globals/utils/xhr_async.js');

const GridUI = require('globals/grid.ui/index.js');
const Page = require('./page.js');
const PageList = require('./page_list.js');

// new stuff

(async function() {
  try {
    let div = document.createElement('div');
    document.body.appendChild(div);

    function getWindowWidth() {
      let availWidth = window.screen.width * window.devicePixelRatio;
      if (window.innerWidth < availWidth) {
        return window.innerWidth;
      } else {
        return availWidth;
      }
    }


    let grid_ui = new GridUI(6, getWindowWidth(), 20, 150);
    function resize_grid() {
      let screenWidth = getWindowWidth();
      if (screenWidth < 720) {
        grid_ui.resize(screenWidth, true);
      } else {
        grid_ui.resize(screenWidth);
      }
    }
    div.appendChild(grid_ui.element);

    window.addEventListener('resize', resize_grid);

    let page_lists = await XHR.post('/mellisuga/modules.io', {
    /*  command: "select",
      method: "all_from_list",
      list: "pages-test"*/
      command: "select",
      method: "all"
    }, "access_token");

    for (let key in page_lists) {
      let page_list = new PageList(key, page_lists[key]);
      div.appendChild(page_list.element);
    }

  } catch (e) {
    console.error(e.stack);
  }
})();


var socket = require('socket.io-client')('http://127.0.0.1:9639');
console.log("CONNECTING TO http://127.0.0.1:9369");
socket.on('connect', function(){
  console.log("CONNECTED");
});

socket.on('webpack-done', function(stats){
  console.log(stats);
});

socket.on('webpack-err', function(err){
  console.error(err);
});

socket.on('disconnect', function(){
  console.log("DISCONNETED");
});
