# wickedElements

<sup>**Social Media Photo by [Jonatan Pie](https://unsplash.com/@r3dmax) on [Unsplash](https://unsplash.com/)**</sup>

An _all inclusive_ ~1.3K library to handle any element as if it was a Custom Element.

```js
import {define, get, upgrade, whenDefined} from 'wicked-elements';
const {define, get, upgrade, whenDefined} = require('wicked-elements');
```

```html
<script src="https://unpkg.com/wicked-elements">
  // as global variable
  wickedElements.{define, get, upgrade, whenDefined};
</script>
```


## V1 Breaking/Changes

  * **half of the size**, _wickedElements_ is now less than 1.5K, more like 1.1K in its ES2015 compatible environments version (see [new.js](./new.js) file)
  * _wickedElements_ requires **zero polyfills** whatsoever: everything is provided, and granted to work, out of the box
  * _wickedElements_ has been tested, and works as is in **IE11 and** in **every** other **Desktop or Mobile browser** compatible with `WeakMap` and `MutationObserver`.
  * the v0 `style` feature has been **removed**, as coupling styles within JS, same way you'd do by including a CSS file, didn't really add much value
  * **dropped classes** as definition, just pass an object literal
  * `this.element` automatically provided and already available in the `init`
  * direct `connected`, `disconnected`, and `attributeChanged` invokes (no more event driven)


## API

Exact same [customElements API](https://html.spec.whatwg.org/multipage/custom-elements.html#dom-window-customelements), with the following differences:

  * `wickedElements.get(CSS)` returns the _frozen_ component definition, which should be an object literal, or a combination of definitions (i.e. `Object.assign({}, BaseDefinition, OverwritesDefinition)`)
  * `wickedElements.define(CSS, definition)` accepts any _CSS_ selector, where the more specific it is, the better.
  
The `definition` is a literal object with optional helpers/utilities described as such:

```js
wickedElements.define(
  // a unique, specific, CSS selector that will become wicked
  '[data-wicked="my-component"]',
  {
    // a one-off, `constructor` like, initialization,
    // the right place to populate node content, add listeners, or setup components
    init() {
      // the element that is related to this wicked instance will be always
      // reachable through `this.element`, even without an `init()` method
      this.element;
      // always points, in every other method, to the DOM element related
      // to this wicked element/component
    },

    // Custom Elements like callbacks, without the redundant `Callback` suffix
    connected() {},
    disconnected() {},
    attributeChanged(name, value, oldValue) {},

    // as optional property used only if `attributeChanged` is defined,
    // it will eventually confine `attributeChanged(...)` calls
    // by monitoring only a well known set of attributes
    observedAttributes: ['data-thing', 'value'],
    // if omitted, or empty array, will notify all attributes changes

    // zero, one, or more, listeners, automatically setup per each component
    // the context of each method-listener will be the wicked instance,
    // not the element itself, but you can reach event.currentTarget or this.element
    // at any time within the code
    onClick(event) {},
    onCustomEvent(event) {}
    // if defined camelCase, events will be attached both lowercase
    // and also camelCase, so that element.dispatch(new CustomEvent('customEvent'))
    // or element.dispatch(new CustomEvent('customevent')) will both work.
    // the `event.type` will be the one dispatched, i.e. `click` or `customEvent`
    // or even `customevent`.

    // any property with an `Options` suffix, will be used to add the listener,
    // so that special cases like `{once: true}`, `true` to capture, and others,
    // can be easily addressed through the definition. By default, options is `false`.
    onClickOptions: {once: true}
  }
);
```


## Examples

Following some basic component example to better understand few use cases.


### A Component that can disable itself

Any element with a `disabled` class will effectively become disabled.

```js
wickedElements.define('.disabled', {
  init() {
    const {element} = this;

    // if the element has its native way to be disabled, return
    if ('disabled' in element)
      return;

    // otherwise define the behavior
    Object.defineProperty(element, 'disabled', {
      get: () => element.hasAttribute('disabled'),
      set: value => {
        if (value) {
          element.style.cssText = this.disabled;
          element.setAttribute('disabled', '');
        }
        else {
          element.style.cssText = '';
          element.removeAttribute('disabled');
        }
      }
    });

    // if the element was live, just trigger/ensure its status
    element.disabled = element.disabled;
  },
  // the style to attach to disabled elements
  disabled: `
    pointer-events: none;
    opacity: 0.5;
  `
});
```


### An extra component based on disabled state

This example is simply to demonstrate that once a definition is known, even same DOM nodes can be handled by multiple definitions.

As example, here we are addressing all elements that will eventually have a `[disabled]` attribute.

```js
wickedElements.define('[disabled]', {
  onMouseOver() {
    const {element} = this;
    // as elements can be promoted but never come back,
    // which is the same that happens to Custom Elements definitions,
    // we can check these elements are still disabled, per each mouseover event
    if (element.disabled) {
      element.style.visibility = 'hidden';
    }
  },
  onMouseOut() {
    this.element.style.visibility = 'visible';
  }
});
```

Each definition will provide a new instance of such definition (definition as prototype), meaning there are no conflicts between definitions, and each wicked instance deals with what its prototype object had at the time of definition.


### A portable component

Same as Custom Elements suffer name-clashing, so that you can have only one `custom-element` definition per page, wicked definitions also could clash if the name is too generic.

It is a good practice to ensure, somehow, your definitions are namespaced, or unique enough, if you're after portability.

```js
wickedElements.define('[data-wicked="my-proj-name-table"]', {
  // unique(ish) definition what will likely not clash with others
});
```

Using `data-wicked="..."` is convenient to also be sure a single element would represent the definition and nothing else, as you cannot have multiple values within an `element.dataset.wicked`, or better, you can serve these components via Server Side Rendering and reflect their special powers via JS once their definition lands on the client, which can be at any given time.

Using a runtime unique class/attribute name also grants behaviors and definitions won't clash, but portability of each wicked behavior could be compromised.
