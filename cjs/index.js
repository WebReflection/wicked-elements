'use strict';
const Lie = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('@webreflection/lie'));
const QSAO = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('qsa-observer'));

const {create, keys} = Object;

const attributes = new WeakMap;
const lazy = new Set;

const query = [];
const config = {};
const defined = {};

const attributeChangedCallback = (records, o) => {
  for (let h = attributes.get(o), i = 0, {length} = records; i < length; i++) {
    const {target, attributeName, oldValue} = records[i];
    const newValue = target.getAttribute(attributeName);
    h.attributeChanged(attributeName, oldValue, newValue);
  }
};

const set = (value, m, l, o) => {
  const handler = create(o, {element: {enumerable: true, value}});
  for (let i = 0, {length} = l; i < length; i++)
    value.addEventListener(l[i].t, handler, l[i].o);
  m.set(value, handler);
  if (handler.init)
    handler.init();
  const {observedAttributes} = o;
  if (observedAttributes) {
    const mo = new MutationObserver(attributeChangedCallback);
    mo.observe(value, {
      attributes: true,
      attributeOldValue: true,
      attributeFilter: observedAttributes.map(attributeName => {
        if (value.hasAttribute(attributeName))
          handler.attributeChanged(
            attributeName,
            null,
            value.getAttribute(attributeName)
          );
        return attributeName;
      })
    });
    attributes.set(mo, handler);
  }
  return handler;
};

const {drop, flush, parse} = QSAO({
  query,
  handle(element, connected, selector) {
    const {m, l, o} = config[selector];
    const handler = m.get(element) || set(element, m, l, o);
    const method = connected ? 'connected' : 'disconnected';
    if (method in handler)
      handler[method]();
  }
});

const get = selector => (config[selector] || attributes).o;
exports.get = get;

const define = (selector, definition) => {
  if (-1 < query.indexOf(selector))
    throw new Error('duplicated: ' + selector);
  flush();
  const listeners = [];
  const retype = create(null);
  for (let k = keys(definition), i = 0, {length} = k; i < length; i++) {
    const key = k[i];
    if (/^on/.test(key) && !/Options$/.test(key)) {
      const options = definition[key + 'Options'] || false;
      const lower = key.toLowerCase();
      let type = lower.slice(2);
      listeners.push({t: type, o: options});
      retype[type] = key;
      if (lower !== key) {
        type = key.slice(2, 3).toLowerCase() + key.slice(3);
        retype[type] = key;
        listeners.push({t: type, o: options});
      }
    }
  }
  if (listeners.length) {
    definition.handleEvent = function (event) {
      this[retype[event.type]](event);
    };
  }
  query.push(selector);
  config[selector] = {m: new WeakMap, l: listeners, o: definition};
  parse(document.querySelectorAll(selector));
  whenDefined(selector);
  if (!lazy.has(selector))
    defined[selector]._();
};
exports.define = define;

const defineAsync = (selector, callback, _) => {
  lazy.add(selector);
  define(selector, {
    init() {
      if (lazy.has(selector)) {
        lazy.delete(selector);
        callback().then(({default: definition}) => {
          query.splice(query.indexOf(selector), 1);
          drop(document.querySelectorAll(selector));
          (_ || define)(selector, definition);
        });
      }
    }
  });
};
exports.defineAsync = defineAsync;

const upgrade = element => {
  if (query.length) {
    flush();
    parse([element]);
  }
};
exports.upgrade = upgrade;

const whenDefined = selector => {
  if (!(selector in defined)) {
    let _, $ = new Lie($ => { _ = $; });
    defined[selector] = {_, $};
  }
  return defined[selector].$;
};
exports.whenDefined = whenDefined;
