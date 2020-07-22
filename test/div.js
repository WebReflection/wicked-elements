let i = 0;

export default {
  init() {
    const {className} = this.element;
    this.element.textContent = `loaded ${className} ${++i}`;
  }
};
