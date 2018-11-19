# wickedElements

Components for the DOM as you've never seen before, bringing the [regularElements](https://github.com/WebReflection/regular-elements) goodness to a component based world.

  * no polyfills needed, it works [down to IE9](https://webreflection.github.io/wicked-elements/test/)
  * lightweight as in [~2K lightweight](https://unpkg.com/wicked-elements)
  * CPU & RAM friendly (100% based on [handleEvent](https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38) through prototypal inheritance)
  * components can exist at any time (past, present, future)
  * no issues with classes, it works well with composed behaviors
  * you can define multiple behaviors, per same DOM element, through the power of CSS selectors
  * lazy load any component at any time: all their states are uniquely private per selector and per node (of two selector matche the same element, each selector will represent a component a part, without ever directly interfering with the other)

```js
wickedElements.define('[is="wicked-element"]', {

  // always triggered once a node is live
  // always right before onconnected and only once,
  // ideal to setup anything as one off operation
  init: function (event) {
    // the context is actually a private object
    // that inherits the component definition
    // literally: Object.create(component)
    this.el = event.currentTarget;
    // accordingly, you can attach any property
    // and even if public, these won't ever leak
    // (unless you decide to leak the component)
    this._rando = Math.random();
    // you can invoke directly any method
    this.render();
  },

  // regularElements hooks available
  onconnected(event) { ... },
  ondisconnected(event) { ... },
  onattributechanged(event) { ... }

  // and any ogther event too
  onclick(event) { ... },

  // works well with any 3rd parts library
  render() {
    this.html`<p>I am rando ${this._rando}</p>`;
  },

  // any object literal syntax available out of the box
  // it's 100% based on prototypal inheritance
  get html() {
    return hyperHTML.bind(this.el);
  }
});
```