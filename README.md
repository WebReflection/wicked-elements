# wickedElements

<sup>**Social Media Photo by [Jonatan Pie](https://unsplash.com/@r3dmax) on [Unsplash](https://unsplash.com/)**</sup>

[![Build Status](https://travis-ci.com/WebReflection/wicked-elements.svg?branch=master)](https://travis-ci.com/WebReflection/wicked-elements) [![Greenkeeper badge](https://badges.greenkeeper.io/WebReflection/wicked-elements.svg)](https://greenkeeper.io/) ![WebReflection status](https://offline.report/status/webreflection.svg)

Bringing the [regularElements](https://github.com/WebReflection/regular-elements) goodness to a component based world.

  * no polyfills needed for IE11+, it [optionally](https://github.com/WebReflection/regular-elements/#compatibility) works [even in IE9](https://webreflection.github.io/wicked-elements/test/)
  * lightweight as in [~2K lightweight](https://unpkg.com/wicked-elements)
  * CPU & RAM friendly <sup><sub>(100% based on [handleEvent](https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38) through prototypal inheritance)</sub></sup>
  * components can exist at any time <sup><sub>(past, present, future)</sub></sup>
  * no issues with classes, it works well with composed behaviors
  * you can use classes if you like anyway, just pass one instead of a literal!
  * you can use wicked elements as an alternative custom elements polyfill in combination with own element names (e.g. `my-wicked-element`)
  * you can define multiple behaviors, per same DOM element, through the power of CSS selectors
  * lazy load any component at any time: all their states are uniquely private per selector and per node
  * either `attributeFilter` or `observedAttributes` can be used to observe specific attributes

### How to

  * as CDN global object, via `<script src="https://unpkg.com/wicked-elements"></script>`
  * as ESM module, via `import wickedElements from 'wicked-elements'`
  * as CJS module, via `const wickedElements = require('wicked-elements');`

### API

Same `regularElements` API, meaning same `customElements` API.

```js
// either via classes (ES2015+)
// wickedElements.define('.is-wicked-element', class { ... });
// or literals (ES5+)
wickedElements.define('.is-wicked-element', {

  // always triggered once a node is live (even with classes)
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
  onconnected(event) {},
  ondisconnected(event) {},
  onattributechanged(event) {},

  // and any other event too
  // just prefix a method with `on` and it will
  // be automatically setup for listening
  onclick(event) {},

  // if there is a style, it'll be injected only once per component
  // inherited styles won't get injected, and classes needs
  // a static get style() { return '...'; } if this behavior is needed
  style: `
    .is-wicked-element {
      border: 2px solid silver;
    }
  `,

  // works well with any 3rd parts library
  // WARNING: THIS IS JUST AS EXAMPLE,
  //          YOU DON'T NEED hyperHTML
  //          TO USE THIS LIBRARY!
  //          THE NODE CAN BE ANY NODE
  //          AND ALREADY POPULATED WITH CONTENT
  render() {
    this.html`<p>I am rando ${this._rando}</p>`;
  },

  // any object literal syntax available out of the box
  // it's 100% based on prototypal inheritance
  get html() {
    return hyperHTML.bind(this.el);
  }
});

// you can also attach the wicked element behaviour to
// custom element names without needing customElements
wickedElements.define('wicked-element', {
  // ...
});

// or even ...
wickedElements.define('[is="wicked-element"]', {
  // ...
});

```

### Attributes

These are examples to listen to specific attributes:

```js
// with JS literals
wickedElements.define('...', {
  // ...
  observedAttributes: ['only', 'these'],
  // **OR**
  attributeFilter: ['only', 'these']
  // ...
});

// with ES classes
wickedElements.define('...', class {
  // ...
  static get observedAttributes() {
    return ['only', 'these'];
  }
  // **OR**
  get attributeFilter() {
    return ['only', 'these'];
  }
  // ...
});

```

Bear in mind, if the array is empty all attributes changes will be nitified.
