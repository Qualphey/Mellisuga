require("./theme.css");

module.exports = class {
  constructor(dom, direction) {
    this.element = document.createElement("div");
    this.element.classList.add("split_ui");
    dom.appendChild(this.element);

    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    this.min_piece_width = 50;
    this.min_piece_height = 50;

    this.list = [];
    this.direction = direction;
  }

  split(pieces) {
    if (this.direction == "horizontal") {
      this.pieces = pieces;
      var split_div_width = Math.floor(this.width/pieces);
      for (var p = 0; p < pieces; p++) {
        var piece_width = split_div_width;
        if (p > 0) {
          let resize_line = document.createElement("div");
          resize_line.classList.add("split_ui_horizontal_line");
          this.element.appendChild(resize_line);
          piece_width -= 3;

          var startX;

          var this_class = this;

          resize_line.addEventListener("mousedown", function(e) {
            startX = e.clientX;
            this_class.element.addEventListener('mousemove', resize_drag);
          });

          this.element.addEventListener('mouseup', function(e) {
            this_class.element.removeEventListener('mousemove', resize_drag);
          });

          function resize_drag(e) {
            var deltaX = e.clientX-startX;
            startX = e.clientX;

            var target_left = resize_line.previousSibling;
            var target_right = resize_line.nextSibling;
            if (target_left.offsetWidth+deltaX > 0 && target_right.offsetWidth-deltaX > 0) {
              var left_width = target_left.offsetWidth+deltaX;
              var right_width_dec = 0;
              if (left_width < this_class.min_piece_width) {
                right_width_dec = this_class.min_piece_width-left_width;
                left_width = this_class.min_piece_width;
              }

              var right_width = target_right.offsetWidth-deltaX;
              var left_width_dec = 0;
              if (right_width < this_class.min_piece_width) {
                left_width_dec = this_class.min_piece_width-right_width;
                right_width = this_class.min_piece_width;
              }

              target_left.style.width = left_width-left_width_dec+"px";
              target_right.style.width = right_width-right_width_dec+"px";
            } else {
              startX -= deltaX;
            }
          }
        }
        var split_div = document.createElement("div");
        split_div.classList.add("split_ui_horizontal");
        split_div.style.width = piece_width+"px";
        this.element.appendChild(split_div);
        this.list.push(split_div);
      }
    }
  }

  auto_resize() {
    var old_width = this.width;
    this.width = this.element.offsetWidth;
    var delta_width = this.width - old_width;
    this.height = this.element.offsetHeight;

    if (this.direction == "horizontal") {
      var piece_delta_width = delta_width/this.pieces;
      var next_delta = 0;
      for (var p = 0; p < this.pieces; p++) {
        var new_width;
        if (piece_delta_width > 0) {
          if (p == this.pieces-1) {
            new_width = this.list[p].offsetWidth+Math.ceil(piece_delta_width);
          } else {
            new_width = this.list[p].offsetWidth+Math.floor(piece_delta_width);
          }
        } else if (piece_delta_width < 0) {
          if (p == this.pieces-1) {
            new_width = this.list[p].offsetWidth+Math.floor(piece_delta_width);
          } else {
            new_width = this.list[p].offsetWidth+Math.ceil(piece_delta_width);
          }
        } else {
          new_width = this.list[p].offsetWidth;
        }

        this.list[p].style.width = new_width+"px";

        if (new_width < this.min_piece_width) {
          next_delta = this.min_piece_width-new_width;
          new_width = this.min_piece_width;
          this.list[p].style.width = new_width+"px";
        } else {
          this.list[p].style.width = new_width-next_delta+"px";
          next_delta = 0;
        }
      }

      if (next_delta > 0) {
        for (var p = 0; p < this.pieces; p++) {
          var new_width = this.list[p].offsetWidth-next_delta;

          if (new_width < this.min_piece_width) {
            next_delta = this.min_piece_width-new_width;
            new_width = this.min_piece_width;
            this.list[p].style.width = new_width+"px";
          } else {
            this.list[p].style.width = new_width+"px";
            next_delta = 0;
            break;
          }
        }
      }
    }
  }
}
