## New in V3

Using [as-custom-element](https://github.com/WebReflection/as-custom-element#readme) and sharing most of the [regular-elements](https://github.com/WebReflection/regular-elements#readme) logic.


## V3 Breaking/Changes

As Custom Elements require mandatory `observedAttributes` array to work, mostly for performance reasons, and as observing all attributes changes is rarely a good practice or a valid use case, and yet it's still possible to attach your own _MutationObserver_ on any `init()` to do so, simply defining `attributeChanged` without a defined set of `observedAttributes` to monitor is not part of this library anymore.


## New in V2.2

Addded `defineAsync` method, so that definitions can land asynchronously, on demand.

```js
// main file
import {defineAsync} from 'wicked-elements';

defineAsync('.my-comp', () => import('/js/components/my-comp.js'));

// /js/components/my-comp.js
export default {
  init() {
    this.element.textContent = 'hello there!';
  }
};
```

## V2 Breaking/Changes

There was asymmetry with native Custom Elements `attributeChangedCallback(name, oldValue, newValue)` which has now been fixed.

Before, `attributeChanged(name, newValue, oldValue)` was the behavior, in V2 is aligned with native Custom Elements, so it's now `attributeChanged(name, oldValue, newValue)`.


## V1 Breaking/Changes

  * **half of the size**, _wickedElements_ is now less than 1.5K, more like 1.1K in its ES2015 compatible environments version (see [new.js](./new.js) file)
  * _wickedElements_ requires **zero polyfills** whatsoever: everything is provided, and granted to work, out of the box
  * _wickedElements_ has been tested, and works as is in **IE11 and** in **every** other **Desktop or Mobile browser** compatible with `WeakMap` and `MutationObserver`.
  * the v0 `style` feature has been **removed**, as coupling styles within JS, same way you'd do by including a CSS file, didn't really add much value
  * **dropped classes** as definition, just pass an object literal
  * `this.element` automatically provided and already available in the `init`
  * direct `connected`, `disconnected`, and `attributeChanged` invokes (no more event driven)
