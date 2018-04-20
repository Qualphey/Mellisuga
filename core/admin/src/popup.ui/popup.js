

module.exports = class {
  constructor(data) {
    this.element = document.createElement('div');
    this.element.classList.add("popup_ui");

    if (data.confirm) {

    }
  }

  destroy() {
    document.body.removeChild(this.element);
  }
}
