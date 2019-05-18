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
var ONDISCONNECTED = 'ondisconnected';
var ONATTRIBUTECHANGED = 'onattributechanged';

// craete RegExp
var RE = /^([a-z0-9-]+)?(#[a-z0-9-]+)?((?:\.[a-z0-9-]+)+)?(\[.+\])?$/;

// one off scoped shortcut
var create = Object.create;
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getPrototypeOf = Object.getPrototypeOf;
var hasOwnProperty = Object.hasOwnProperty;
var root = Object.prototype;

// NOTE: the component is not returned,
//       only its initial definition.
//       This works well in terms of security
//       so that a component prototype won't be
//       exposed directly through the API.
var wickedElements = create(regularElements, {
  create: {
    value: function (selector) {
      return selector2element.apply(null, RE.exec(selector));
    }
  },
  define: {
    value: function (selector, component) {
      var ws = new WeakSet;
      var definition = {onconnected: setup};
      var isClass = typeof component === 'function';
      var proto = isClass ? component.prototype : component;
      var events = getEvents(proto);
      if (ONDISCONNECTED in proto)
        definition[ONDISCONNECTED] = setup;
      if (ONATTRIBUTECHANGED in proto) {
        definition[ONATTRIBUTECHANGED] = setup;
        definition.attributeFilter =
          (isClass ?
            component.observedAttributes :
            proto.observedAttributes) ||
          proto.attributeFilter || [];
      }
      addIfNeeded(proto, 'init', init);
      addIfNeeded(proto, 'handleEvent', handleEvent);
      regularElements.define(selector, definition);
      if (hasOwnProperty.call(component, 'style'))
        injectStyle(component.style);
      function setup(event) {
        var el = event.currentTarget;
        var type = event.type;
        el.removeEventListener(type, setup, false);
        if (!ws.has(el)) {
          ws.add(el);
          bootstrap(
            isClass ? new component : create(proto),
            events, event, el, type
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

function bootstrap(handler, events, event, el, method) {
  var init = false;
  var i = 0;
  var length = events.length;
  while (i < length) {
    var evt = events[i++];
    el.addEventListener(evt.type, handler, evt.options);
    init = (init || evt.type === method);
  }
  handler.init(event);
  if (init)
    handler.handleEvent(event);
}

function getEvents(proto) {
  var events = [];
  while (proto && proto !== root) {
    var keys = getOwnPropertyNames(proto);
    var i = 0;
    var length = keys.length;
    while (i < length) {
      var key = keys[i++];
      if (key.slice(0, 2) === 'on' && key.slice(-7) !== 'Options')
        events.push({
          type: key.slice(2),
          options: proto[key + 'Options'] || false
        });
    }
    proto = getPrototypeOf(proto);
  }
  return events;
}

function handleEvent(event) {
  var type = 'on' + event.type;
  if (type in this)
    this[type](event);
}

function init(event) {
  this.el = event.currentTarget;
}

function injectStyle(cssText) {
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet)
    style.styleSheet.cssText = cssText;
  else
    style.textContent = cssText;
  (document.head || document.querySelector('head')).appendChild(style);
}

function selector2element(_, tag, id, classes, attributes) {
  var el = document.createElement(tag || 'div');
  if (id)
    el.id = id.slice(1);
  if (classes)
    el.className = classes.replace(/\./g, ' ').slice(1);
  if (attributes) {
    var re = /\[(.+?)\]/g;
    var match;
    while (match = re.exec(attributes)) {
      var all = match[1];
      var i = all.indexOf('=');
      var key = i < 0 ? all : all.slice(0, i);
      var value = i < 0 ? true : all.slice(i + 1).replace(/^('|")?(.+)\1$/, '$2');
      if (key === 'class')
        key = 'className';
      if (key in el)
        el[key] = value;
      else
        el.setAttribute(key, i < 0 ? '' : value);
    }
  }
  return el;
}
