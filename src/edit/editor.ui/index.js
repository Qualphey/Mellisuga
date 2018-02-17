const XHR = require("../../utils/xhr.js");
const XHRA = require("../../utils/xhr_async.js");
const WindowUI = require("../window.ui/index.js");
const SplitUI = require("../split.ui/index.js");

require("./theme.css")

const Session = require("./session.js");

module.exports = class {
  constructor(target, dir, iframe, pathname) {
    this.window = new WindowUI({
      DOM: document.body,
      title: "Editor",
      resize_cb: function() {
        split.auto_resize();
      }
    });
    global.editor_window = this.window;
    this.window.content.style.overflow = "hidden";

    var split = this.split = new SplitUI(this.window.content, "horizontal");
    split.split(2);

    var global_local_switch = document.createElement("button");
    global_local_switch.innerHTML = "Global";
    global_local_switch.classList.add('global_local_switch');
    this.split.list[0].appendChild(global_local_switch);

    var webpack_button = document.createElement("button");
    webpack_button.innerHTML = ".";
    webpack_button.classList.add('webpack_button');
    this.split.list[0].appendChild(webpack_button);

    var state = false;
    webpack_button.style.border = "solid 1px #FF0000";

    webpack_button.addEventListener('click', async function(e) {
      var chstate = (state != true);
      state = await XHRA.post("pages.io", {
        command: "webpack",
        on: chstate,
        name: dir
      });

      if (state) {
        webpack_button.style.border = "solid 1px #00FF00";
      } else {
        webpack_button.style.border = "solid 1px #FF0000";
      }
    })
    var local_session = new Session(target, dir, iframe, pathname);
    this.append_session_elements(local_session);
    var global_session = new Session("globals", ".", iframe, pathname);

    var this_class = this;
    global_local_switch.addEventListener("click", function(e) {
      if (global_local_switch.innerHTML == "Global") {
        local_session.destroy();
        this_class.append_session_elements(global_session);
        global_local_switch.innerHTML = "Local";
      } else {
        global_session.destroy();
        this_class.append_session_elements(local_session);
        global_local_switch.innerHTML = "Global";
      }
    });
  }

  append_session_elements(session) {
    var treefm = session.treefm;
    var tabs = session.tabs;

    this.split.list[0].appendChild(treefm.element);
    this.split.list[1].style.overflow = "hidden";
    this.split.list[1].appendChild(tabs.element);
  }

  destroy() {
    this.window.destroy();
  }
}
