'use strict';
const asCustomElement = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('as-custom-element'));
const utils = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('@webreflection/elements-utils'));

const {create, keys} = Object;

const config = [];
const query = [];
const defined = {};
const lazy = new Set;
const wicked = new WeakMap;

const {
  get, upgrade, whenDefined,
  _: matches, $: setupList
} = utils(
  query, config, defined,
  (value, i, parsed) => {
    if (matches(value, query[i])) {
      const {m, l, o} = config[i];
      if (!m.has(value)) {
        const handler = create(o, {
          element: {enumerable: true, value}
        });
        m.set(value, 0);
        wicked.set(value, handler);
        for (let i = 0, {length} = l; i < length; i++)
          value.addEventListener(l[i].t, handler, l[i].o);
        if (handler.init)
          handler.init();
        asCustomElement(value, o);
      }
    }
    setupList(value.querySelectorAll(query), parsed);
  }
);

const delegate = method => function () {
  method.apply(wicked.get(this), arguments);
};

const define = (selector, definition) => {
  if (get(selector))
    throw new Error('duplicated: ' + selector);
  const listeners = [];
  const retype = create(null);
  for (let k = keys(definition), i = 0, {length} = k; i < length; i++) {
    const key = k[i];
    if (/^(?:connected|disconnected|attributeChanged)$/.test(key))
      definition[key + 'Callback'] = delegate(definition[key]);
    else if (/^on/.test(key) && !/Options$/.test(key)) {
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
  config.push({m: new WeakMap, l: listeners, o: definition});
  setupList(document.querySelectorAll(selector), new Set);
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
          const i = query.indexOf(selector);
          query.splice(i, 1);
          config.splice(i, 1);
          (_ || define)(selector, definition);
        });
      }
    }
  });
};
exports.defineAsync = defineAsync;

exports.get = get;
exports.upgrade = upgrade;
exports.whenDefined = whenDefined;
