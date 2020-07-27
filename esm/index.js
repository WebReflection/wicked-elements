import asCustomElement from 'as-custom-element';
import sdo from 'shared-document-observer';

const {create, keys} = Object;

const config = [];
const query = [];
const defined = {};
const lazy = new Set;
const wicked = new WeakMap;

const delegate = method => function () {
  method.apply(wicked.get(this), arguments);
};

const init = (value, wm, listeners, definition) => {
  const handler = create(definition, {
    element: {enumerable: true, value}
  });
  for (let i = 0, {length} = listeners; i < length; i++)
    value.addEventListener(listeners[i].t, handler, listeners[i].o);
  if (handler.init)
    handler.init();
  wicked.set(value, handler);
  wm.set(asCustomElement(value, definition), 0);
};

const setupList = nodes => {
  query.forEach.call(nodes, upgrade);
};

const upgradeNodes = ({addedNodes}) => {
  setupList(addedNodes);
};

const Lie = typeof Promise === 'function' ? Promise : function (fn) {
  let queue = [], resolved = false;
  fn(() => {
    resolved = true;
    queue.splice(0).forEach(then);
  });
  return {then, catch() { return this; }};
  function then(fn) {
    return (resolved ? setTimeout(fn) : queue.push(fn)), this;
  }
};

sdo.add(records => {
  records.forEach(upgradeNodes);
});

export const define = (selector, definition) => {
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
  setupList(document.querySelectorAll(selector));
  whenDefined(selector);
  if (!lazy.has(selector))
    defined[selector]._();
};

export const defineAsync = (selector, callback, _) => {
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

export const get = selector => {
  const i = query.indexOf(selector);
  return i < 0 ? void 0 : config[i].o;
};

export const upgrade = node => {
  query.forEach(setup, node);
};

export const whenDefined = selector => {
  if (!(selector in defined)) {
    let _, $ = new Lie($ => { _ = $; });
    defined[selector] = {_, $};
  }
  return defined[selector].$;
};

function setup(selector, i) {
  const {querySelectorAll} = this;
  if (querySelectorAll) {
    if ((
      this.matches ||
      this.webkitMatchesSelector ||
      this.msMatchesSelector
    ).call(this, selector)) {
      const {m, l, o} = config[i];
      if (!m.has(this))
        init(this, m, l, o);
    }
    setupList(querySelectorAll.call(this, query));
  }
}
