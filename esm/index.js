/**
 * ISC License
 *
 * Copyright (c) 2018, Andrea Giammarchi, @WebReflection
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 * REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 * INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 * LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE
 * OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 * PERFORMANCE OF THIS SOFTWARE.
 */

import WeakSet from '@ungap/weakset';
import regularElements from 'regular-elements';

// minifier friendly constants
var ATTRIBUTE_FILTER = 'attributeFilter';
var OBSERVED_ATTRIBUTES = 'observedAttributes';
var ONDISCONNECTED = 'ondisconnected';
var ONATTRIBUTECHANGED = 'onattributechanged';

// one off scoped shortcut
var create = Object.create;
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;

// NOTE: the component is not returned,
//       only its initial definition.
//       This works well in terms of security
//       so that a component prototype won't be
//       exposed directly through the API.
var wickedElements = create(regularElements, {
  define: {
    value: function (selector, component) {
      var ws = new WeakSet;
      var definition = {onconnected: setup};
      var isClass = typeof component === 'function';
      var proto = isClass ? component.prototype : component;
      if (ONDISCONNECTED in proto)
        definition[ONDISCONNECTED] = setup;
      if (ONATTRIBUTECHANGED in proto) {
        definition[ONATTRIBUTECHANGED] = setup;
        definition[ATTRIBUTE_FILTER] =
          (isClass ?
            component[OBSERVED_ATTRIBUTES] :
            proto[OBSERVED_ATTRIBUTES]) ||
          proto[ATTRIBUTE_FILTER] || [];
      }
      addIfNeeded(proto, 'init', init);
      addIfNeeded(proto, 'handleEvent', handleEvent);
      regularElements.define(selector, definition);
      function setup(event) {
        var el = event.currentTarget;
        var type = event.type;
        el.removeEventListener(type, setup);
        if (!ws.has(el)) {
          ws.add(el);
          bootstrap(
            isClass ? new component : create(proto),
            proto, event, el, 'on' + type
          );
        }
      }
    }
  }
});

export default wickedElements;

function addIfNeeded(component, key, value) {
  if (!(key in component))
    defineProperty(component, key, {value: value});
}

function bootstrap(handler, proto, event, el, method) {
  for (var
    key,
    invoke = false,
    keys = getOwnPropertyNames(proto),
    i = 0, length = keys.length; i < length; i++
  ) {
    key = keys[i];
    if (key.slice(0, 2) === 'on') {
      el.addEventListener(key.slice(2), handler, false);
      if (key === method)
        invoke = !invoke;
    }
  }
  handler.init(event);
  if (invoke)
    handler.handleEvent(event);
}

function handleEvent(event) {
  var type = 'on' + event.type;
  if (type in this)
    this[type](event);
}

function init(event) {
  this.el = event.currentTarget;
}
