# wickedElements 🧙

<sup>**Social Media Photo by [Jonatan Pie](https://unsplash.com/@r3dmax) on [Unsplash](https://unsplash.com/)**</sup>

An _all inclusive_ ~1.4K library to handle any element as if it was a Custom Element.

```js
import {define, defineAsync, get, upgrade, whenDefined} from 'wicked-elements';
const {define, defineAsync, get, upgrade, whenDefined} = require('wicked-elements');
```

```html
<script src="https://unpkg.com/wicked-elements">
  // as global variable
  wickedElements.{define, get, upgrade, whenDefined};
</script>
```

### All versions changes

Please read [VERSIONS.md](./VERSIONS.md) to know more about historical changes, including the breaking one.


## API

Exact same [customElements API](https://html.spec.whatwg.org/multipage/custom-elements.html#dom-window-customelements), with the following differences:

  * `wickedElements.get(CSS)` returns the component definition, which should be an object literal, or a combination of definitions (i.e. `Object.assign({}, BaseDefinition, OverwritesDefinition)`)
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
    disconnected() {
      // if you'd like to remove the handler from the associated element
      // you can release it and never be notified again about anything
      //  * all listeners removed
      //  * all lifecycle events will stop working
      // Please note: there is no coming back from this point
      this.release();
    },

    // invokes `attributeChanged` if any of these attributes is changed, set, removed
    observedAttributes: ['data-thing', 'value'],
    attributeChanged(name, oldValue, newValue) {},

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

## F.A.Q.

<details>
  <summary>
    <strong>Can I use 3rd parts libraries to render content?</strong>
  </summary>
  <div>

  Sure thing! Following a <a href="https://github.com/WebReflection/lighterhtml#readme">lighterhtml</a> integration example, also <a href="https://codepen.io/WebReflection/pen/qBdOzWj?editors=0010">live in CodePen</a>:

```js
import {render, html, svg} from 'lighterhtml';
const LighterHTML = {
  html() { return render(this.element, html.apply(null, arguments)); },
  svg() { return render(this.element, svg.apply(null, arguments)); }
};

import {define} from 'wicked-elements';
define('.my-component', {
  ...LighterHTML,
  init() { this.render(); },
  render() {
    this.html`<h3>Hello 👋</h3>`;
  }
});
```
  </div>
</details>

<details>
  <summary>
    <strong>Can I haz <em>hooks</em> too?</strong>
  </summary>
  <div>

  You can either check **[hookedElements](https://github.com/WebReflection/hooked-elements#readme)** for an out-of-the-box solution, or you could use <a href="https://github.com/WebReflection/augmentor#readme">augmentor</a>, which is just perfect for this use case 😉, which is indeed exactly what _hookedElements_ use (it's just automatically integrated).

  Test it <a href="https://codepen.io/WebReflection/pen/poJjXPg?editors=0010">live on CodePen</a>.

```js
import {augmentor, useState} from 'augmentor';
import {define} from 'wicked-elements';
define('button.counter', {
  init() {
    // augment once any method, and that's it 🦄
    this.render = augmentor(this.render.bind(this));
    this.render();
  },
  render() {
    const [counter, update] = useState(0);
    const {element} = this;
    element.onclick = () => update(counter + 1);
    element.textContent = `${counter} clicks`;
  }
});
```

  </div>
</details>

<details>
  <summary>
    <strong>Any basic example to play with?</strong>
  </summary>
  <div>

  This is a classic one, the <a href="https://webcomponents.dev/edit/kfZrGZ2SZwBu0opTJqL9">WebComponents.dev click counter</a>, also in <a href="https://codepen.io/WebReflection/pen/JjdYyxj">in CodePen</a>.

  </div>
</details>

<details>
  <summary>
    <strong>Any other example?</strong>
  </summary>
  <div>

Sure. Here any element with a `disabled` class will effectively become disabled.

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

Once a definition is known, even same DOM nodes can be handled by multiple definitions/behaviors.

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

Each definition/behavior will provide a new instance of such definition (definition as prototype), meaning there are no conflicts between definitions, and each wicked instance deals with what its prototype object had at the time of definition.

  </div>
</details>

<details>
  <summary>
    <strong>Any caveat/hint to consider?</strong>
  </summary>
  <div>

Same as Custom Elements suffer name-clashing, so that you can have only one `custom-element` definition per page, wicked definitions also could clash if the name is too generic.

It is a good practice to ensure, somehow, your definitions are namespaced, or unique enough, if you're after portability.

```js
wickedElements.define('[data-wicked="my-proj-name-table"]', {
  // unique(ish) definition what will likely not clash with others
});
```

Using `data-wicked="..."` is convenient to also be sure a single element would represent the definition and nothing else, as you cannot have multiple values within an `element.dataset.wicked`, or better, you can serve these components via Server Side Rendering and reflect their special powers via JS once their definition lands on the client, which can be at any given time.

Using a runtime unique class/attribute name also grants behaviors and definitions won't clash, but portability of each wicked behavior could be compromised.

  </div>
</details>

<details>
  <summary>
    <strong>My element doesn't become wicked, what should I do?</strong>
  </summary>
  <div>

  There are cases where an element might not become <em>wicked</em>, such as when the element class changes at runtime, and after the definition occurs.

```js
wickedElements.define('.is-wicked', {
  init() {
    this.element.classList.remove('not-wicked-yet');
    console.log(this.element, 'is now wicked 🎉');
  }
});

const later = document.querySelector('.not-wicked-yet');
later.classList.add('is-wicked');
// ... nothing happens ...
```

For obvious performance reasons, the `MutationObserver` doesn't trigger per each possible class change in the DOM, but fear not, like it is for <a href="https://html.spec.whatwg.org/multipage/custom-elements.html#dom-customelementregistry-upgrade">customElements.upgrade(element)</a>, you can always upgrade one or more elements via `wickedElements.upgrade(element)`.

```js
wickedElements.upgrade(later);
// console.log ...
// <div class="is-wicked"></div> is now wicked 🎉
```

If you'd like to upgrade many elements at once, you can always pass their top-most container, and let the library do the rest.

```js
// upgrade all wicked definitions at once 👍
wickedElements.upgrade(document.documentElement);
```

Don't worry though, elements that were already wicked won't be affected by an upgrade, so that each `init()` is still granted to execute only once per fresh new element, and never again.

  </div>
</details>
