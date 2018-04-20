

require("./sheet.css");
var html = require(__dirname+"/body.html");


var min_width = 181;
var min_height = 65;

var init_width = 680;
var init_height = 360;

module.exports = class {
  constructor(cfg) {
    this.element = document.createElement("div");
    this.element.innerHTML = html;
    this.element.style.minWidth = min_width+"px";
    this.element.style.minHeight = min_height+"px";
    this.element.style.width = init_width+"px";
    this.element.style.height = init_height+"px";
    this.element.classList.add('window_mod');
    this.element.classList.add('container_rgb');
    cfg.DOM.appendChild(this.element);

    this.visible = true;
    this.DOM = cfg.DOM;
    this.resize_cb = cfg.resize_cb;

    var this_class = this;

    this.titlebar = this.element.querySelector('.window_mod_titlebar');
    this.titlebar.innerHTML = cfg.title;
    this.titlebar.addEventListener('mousedown', function(e) {
      if (!this_class.maximized) {
        window_mod_move(e);
      }
    });


    var minimize = this.element.querySelector('.window_mod_hide');
    minimize.addEventListener("click", function(e) {
      this_class.hide();
    });

    var maximize = this.element.querySelector('.window_mod_min_max_imize');
    maximize.addEventListener("click", function(e) {
      if (this_class.maximized) {
        this_class.minimize();
      } else {
        this_class.maximize();
      }
    });


    this.content = this.element.querySelector('.window_mod_content');

    this.resize_controls = this.element.querySelector('.window_mod_resize_controls');

    this.element.N = this.element.querySelector('.resizeN');
    this.element.NE = this.element.querySelector('.resizeNE');
    this.element.E = this.element.querySelector('.resizeE');
    this.element.SE = this.element.querySelector('.resizeSE');
    this.element.S = this.element.querySelector('.resizeS');
    this.element.SW = this.element.querySelector('.resizeSW');
    this.element.W = this.element.querySelector('.resizeW');
    this.element.NW = this.element.querySelector('.resizeNW');

    this.mouse_div = document.createElement('div');
    this.mouse_div.classList.add('mouse_div');

    cfg.DOM.appendChild(this.mouse_div);


    var fresh = true;
    function window_mod_init(win) {
      if (fresh) {
        this_class.element = win;

        fresh = false;
      }

    }

    function div_up(next) {
      let up_cb = function(e) {
        this_class.mouse_div.style.display = "none";
        next();
        this_class.mouse_div.removeEventListener('mouseup', up_cb);
      }

      this_class.mouse_div.addEventListener('mouseup', up_cb);
    }

    function window_mod_move(event) {
      var title = event.target;

      this_class.element.startX = event.clientX - this_class.element.offsetLeft;
      this_class.element.startY = event.clientY - this_class.element.offsetTop;
      document.documentElement.addEventListener('mousemove', drag);
      this_class.mouse_div.style.display = "block";
      div_up(stopDrag);

      function drag(e) {
        var eClientX = e.clientX;
        var eClientY = e.clientY;

        var nX = (eClientX - this_class.element.startX);
        var nX2 = nX + this_class.element.offsetWidth;

        if (nX < 0) nX = 0;
        if (nX2 > window.innerWidth) {
          nX = window.innerWidth - this_class.element.offsetWidth;
        }

        this_class.element.style.left = nX + 'px';

        var nY = (eClientY - this_class.element.startY);
        var nY2 = nY + this_class.element.offsetHeight;

        if (nY < 0) nY = 0;
        if (nY2 > window.innerHeight) {
          nY = window.innerHeight - this_class.element.offsetHeight;
        }

        this_class.element.style.top = nY + 'px';
      }

      function stopDrag(e) {
        console.log('stop');
        document.documentElement.removeEventListener('mousemove', drag);
      }

    }

    // RESZ

    var startX, startY, startWidth, startHeight, curTarget, curFollower;
    var make = function(target, directions, cb) {
      if (directions == '*') {
        makeN(target);
        makeNE(target);
        makeE(target);
        makeSE(target);
        makeS(target);
        makeSW(target);
        makeW(target);
        makeNW(target);
      } else if (Array.isArray(directions)) {
        directions.forEach(function(d) {
          switch (d) {
            case 'N':
              makeN(target);
              break;
            case 'NE':
              makeNE(target);
              break;
            case 'E':
              makeE(target);
              break;
            case 'SE':
              makeSE(target);
              break;
            case 'S':
              makeS(target);
              break;
            case 'SW':
              makeSW(target);
              break;
            case 'W':
              makeW(target);
              break;
            case 'NW':
              makeNW(target);
              break;
            default:
              console.log('cmResizable: Invalid direction: "'+d+'"');
              console.log('NW N NE');
              console.log('W  +  E');
              console.log('SW S SE');
          }
        });
      }

      var screen_padding = 10;

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeN(target) {
        var element = this_class.element.N;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop;
          startHeight = target.offsetHeight;
          document.documentElement.addEventListener('mousemove', dragN);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragN);
        });

        function dragN(e) {
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;

          var nHeight = (startHeight + startY - eClientY);
          if (nHeight > min_height) {
            curTarget.style.top = (startY + eClientY - startY) + 'px';
            curTarget.style.height = nHeight + 'px';
            if (curFollower) {
              curFollower.style.top = (startY + eClientY - startY) + 'px';
              curFollower.style.height = (startHeight + startY - eClientY) + 'px';
            }
          }

          cb();
        }

        function stopDragN(e) {
          document.documentElement.removeEventListener('mousemove', dragN);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeNE(target) {
        var element = this_class.element.NE;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop;
          startX = target.offsetLeft + target.offsetWidth;
          startHeight = target.offsetHeight;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragNE);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragNE);
        });

        function dragNE(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          if (eClientX > window.innerWidth-screen_padding) {
            eClientX = window.innerWidth;
          };
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;

          var nHeight = (startHeight + startY - eClientY);
          if (nHeight > min_height) {
            curTarget.style.top = (startY + eClientY - startY) + 'px';
            curTarget.style.height = (startHeight + startY - eClientY) + 'px';
            if (curFollower) {
              curFollower.style.top = (startY + eClientY - startY) + 'px';
              curFollower.style.height = (startHeight + startY - eClientY) + 'px';
            }
          }

          curTarget.style.width = (startWidth + eClientX - startX) + 'px';
          if (curFollower) {
            curFollower.style.width = (startWidth + eClientX - startX) + 'px';
          }

          cb();
        }

        function stopDragNE(e) {
          document.documentElement.removeEventListener('mousemove', dragNE);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeE(target) {
        var element = this_class.element.E;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startX = target.offsetLeft + target.offsetWidth;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragE);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragE);
        });

        function dragE(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          if (eClientX > window.innerWidth-screen_padding) {
            eClientX = window.innerWidth;
          };

          curTarget.style.width = (startWidth + eClientX - startX) + 'px';
          if (curFollower) {
            curFollower.style.width = (startWidth + eClientX - startX) + 'px';
          }
          cb();
        }

        function stopDragE(e) {
          document.documentElement.removeEventListener('mousemove', dragE);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeSE(target) {
        var element = this_class.element.SE;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop + target.offsetHeight;
          startX = target.offsetLeft + target.offsetWidth;
          startHeight = target.offsetHeight;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragSE);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragSE);
        });

        function dragSE(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          if (eClientX > window.innerWidth-screen_padding) {
            eClientX = window.innerWidth;
          };
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;
          if (eClientY > window.innerHeight-screen_padding) {
            eClientY = window.innerHeight;
          };

          curTarget.style.height = (startHeight + eClientY - startY) + 'px';
          curTarget.style.width = (startWidth + eClientX - startX) + 'px';
          if (curFollower) {
            curFollower.style.height = (startHeight + eClientY - startY) + 'px';
            curFollower.style.width = (startWidth + eClientX - startX) + 'px';
          }
          cb();
        }

        function stopDragSE(e) {
          document.documentElement.removeEventListener('mousemove', dragSE);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeS(target) {
        var element = this_class.element.S;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop + target.offsetHeight;
          startHeight = target.offsetHeight;
          document.documentElement.addEventListener('mousemove', dragS);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragS);
        });

        function dragS(e) {
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;
          if (eClientY > window.innerHeight-screen_padding) {
            eClientY = window.innerHeight;
          };

          curTarget.style.height = (startHeight + eClientY - startY) + 'px';
          if (curFollower) {
            curFollower.style.height = (startHeight + eClientY - startY) + 'px';
          }

          cb();
        }

        function stopDragS(e) {
          document.documentElement.removeEventListener('mousemove', dragS);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeSW(target) {
        var element = this_class.element.SW;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop + target.offsetHeight;
          startX = target.offsetLeft;
          startHeight = target.offsetHeight;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragSW);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragSW);
        });

        function dragSW(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;
          if (eClientY > window.innerHeight-screen_padding) {
            eClientY = window.innerHeight;
          };

          curTarget.style.height = (startHeight + eClientY - startY) + 'px';
          if (curFollower) {
            curFollower.style.height = (startHeight + eClientY - startY) + 'px';
          }

          var nWidth = (startWidth + startX - eClientX);
          if (nWidth > min_width) {
            curTarget.style.width = (startWidth + startX -eClientX) + 'px';
            curTarget.style.left = (startX + eClientX - startX) + 'px';
            if (curFollower) {
              curFollower.style.width = (startWidth + startX -eClientX) + 'px';
              curFollower.style.left = (startX + eClientX - startX) + 'px';
            }
          }

          cb();
        }

        function stopDragSW(e) {
          document.documentElement.removeEventListener('mousemove', dragSW);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeW(target) {
        var element = this_class.element.W;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startX = target.offsetLeft;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragW);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragW);
        });

        function dragW(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;

          var nWidth = (startWidth + startX - eClientX);
          if (nWidth > min_width) {
            curTarget.style.width = (startWidth + startX - eClientX) + 'px';
            curTarget.style.left = (startX + eClientX - startX) + 'px';
            if (curFollower) {
              curFollower.style.width = (startWidth + startX -eClientX) + 'px';
              curFollower.style.left = (startX + eClientX - startX) + 'px';
            }
          }
          cb();
        }

        function stopDragW(e) {
          document.documentElement.removeEventListener('mousemove', dragW);
          curFollower = 0;
        }
      }

    //.-'-.-'-.-'-.-'-.-'-.-'-.-'-.-'
      function makeNW(target) {
        var element = this_class.element.NW;

        element.addEventListener('mousedown', function(e) {
          curTarget = target;
          startY = target.offsetTop;
          startHeight = target.offsetHeight;
          startX = target.offsetLeft;
          startWidth = target.offsetWidth;
          document.documentElement.addEventListener('mousemove', dragNW);
          this_class.mouse_div.style.display = "block";
          div_up(stopDragNW);
        });

        function dragNW(e) {
          var eClientX = e.clientX;
          if (eClientX < screen_padding) eClientX = 0;
          var eClientY = e.clientY;
          if (eClientY < screen_padding) eClientY = 0;

          var nHeight = (startHeight + startY - eClientY);
          if (nHeight > min_height) {
            curTarget.style.top = (startY + eClientY - startY) + 'px';
            curTarget.style.height = (startHeight + startY - eClientY) + 'px';
            if (curFollower) {
              curFollower.style.top = (startY + eClientY - startY) + 'px';
              curFollower.style.height = (startHeight + startY - eClientY) + 'px';
            }
          }

          var nWidth = (startWidth + startX - eClientX);
          if (nWidth > min_width) {
            curTarget.style.width = (startWidth + startX -eClientX) + 'px';
            curTarget.style.left = (startX + eClientX - startX) + 'px';
            if (curFollower) {
              curFollower.style.width = (startWidth + startX -eClientX) + 'px';
              curFollower.style.left = (startX + eClientX - startX) + 'px';
            }
          }

          cb();
        }

        function stopDragNW(e) {
          document.documentElement.removeEventListener('mousemove', dragNW);
          curFollower = 0;
        }
      }
    }

    //+++ NodeList forEach hack.
    var arrayMethods = Object.getOwnPropertyNames( Array.prototype );

    arrayMethods.forEach( attachArrayMethodsToNodeList );

    function attachArrayMethodsToNodeList(methodName) {
      if(methodName !== 'length') {
        NodeList.prototype[methodName] = Array.prototype[methodName];
      }
    };

    //+++ isArray Check
    if (!Array.isArray) {
      Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      };
    }

    make(this_class.element, '*', cfg.resize_cb);
  }

  maximize() {
    if (!this.maximized) {
      this.mem_layout = {
        width: this.element.offsetWidth,
        height: this.element.offsetHeight,
        top: this.element.offsetTop,
        left: this.element.offsetLeft
      }
        console.log(this.mem_layout);

      this.element.style.width = "auto";
      this.element.style.height = "auto";
      this.element.style.top = 0;
      this.element.style.left = 0;
      this.element.style.right = 0;
      this.element.style.bottom = 0;

      this.element.removeChild(this.resize_controls);

      this.maximized = true;

      this.resize_cb();
    }
  }

  minimize() {
    if (this.maximized) {
      console.log(this.mem_layout);
      this.element.style.width = this.mem_layout.width+"px";
      this.element.style.height = this.mem_layout.height+"px";
      this.element.style.top = this.mem_layout.top+"px";
      this.element.style.left = this.mem_layout.left+"px";
      this.element.style.right = "auto";
      this.element.style.bottom = "auto";

      this.element.appendChild(this.resize_controls);

      this.resize_controls.style.display = "auto";

      this.maximized = false;

      this.resize_cb();
    }
  }

  dipslay() {
    if (!this.visible) {
      this.DOM.appendChild(this.element);
      this.visible = true;
    }
  }

  hide() {
    if (this.visible) {
      this.DOM.removeChild(this.element);
      this.visible = false;
    }
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
