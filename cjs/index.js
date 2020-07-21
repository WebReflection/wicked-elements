'use strict';
const matches = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('@ungap/element-matches'));
const contains = (m => m.__esModule ? /* istanbul ignore next */ m.default : /* istanbul ignore next */ m)(require('@ungap/node-contains'));

const {LIE} = require('./lie.js');

const {create, keys} = Object;
const wickedElements = new WeakMap;
const defined = new Map;

const uid = '_' + Math.random();
const connected = 'connected';
const disconnected = 'dis' + connected;

const lazy = new Set;
const selectors = [];
const components = [];

const empty = [];
const {forEach} = empty;

const $ = element => wickedElements.get(element) || empty;

const attrObserver = new MutationObserver(mutations => {
  for (let i = 0, {length} = mutations; i < length; i++)
    $(mutations[i].target).forEach(onAttributeChanged, mutations[i]);
});

new MutationObserver(mutations => {
  if (selectors.length) {
    for (let i = 0, {length} = mutations; i < length; i++) {
      const {addedNodes, removedNodes} = mutations[i];
      forEach.call(addedNodes, onConnect);
      forEach.call(removedNodes, onDisconnect);
    }
  }
}).observe(document, {childList: true, subtree: true});

const onConnect = element => {
  if (element.querySelectorAll) {
    upgradeDance(element, false);
    connectOrDisconnect.call(connected, element);
    forEach.call(
      element.querySelectorAll(selectors),
      connectOrDisconnect,
      connected
    );
  }
};

const onDisconnect = element => {
  if (element.querySelectorAll) {
    connectOrDisconnect.call(disconnected, element);
    forEach.call(
      element.querySelectorAll(selectors),
      connectOrDisconnect,
      disconnected
    );
  }
};

const upgradeChildren = child => {
  selectors.forEach(match, child);
};

const upgradeDance = (element, dispatchConnected) => {
  if (element.querySelectorAll) {
    selectors.forEach(match, element);
    const children = element.querySelectorAll(selectors);
    forEach.call(children, upgradeChildren);
    if (dispatchConnected && contains.call(element.ownerDocument, element)) {
      connectOrDisconnect.call(connected, element);
      forEach.call(children, connectOrDisconnect, connected);
    }
  }
};

const waitDefined = selector => {
  let resolve;
  const entry = {
    promise: new LIE($ => (resolve = $)),
    resolve
  };
  defined.set(selector, entry);
  return entry;
};

const define = (selector, definition) => {
  if (get(selector))
    throw new Error('duplicated ' + selector);
  const listeners = [];
  const retype = create(null);
  for (let k = keys(definition), i = 0, {length} = k; i < length; i++) {
    let listener = k[i];
    if (/^on/.test(listener) && !/Options$/.test(listener)) {
      const options = definition[listener + 'Options'] || false;
      const lower = listener.toLowerCase();
      let type = lower.slice(2);
      listeners.push({type, options});
      retype[type] = listener;
      if (lower !== listener) {
        type = listener.slice(2, 3).toLowerCase() + listener.slice(3);
        retype[type] = listener;
        listeners.push({type, options});
      }
    }
  }
  if (listeners.length) {
    definition.handleEvent = function (event) {
      this[retype[event.type]](event);
    };
  }
  if (definition.attributeChanged) {
    const observerDetails = {attributes: true, attributeOldValue: true};
    const {observedAttributes} = definition;
    if ((observedAttributes || empty).length)
      observerDetails.attributeFilter = observedAttributes;
    definition.observerDetails = observerDetails;
  }
  selectors.push(selector);
  components.push({
    listeners,
    definition,
    wm: new WeakMap
  });
  upgrade(document.documentElement);
  if (!lazy.has(selector))
    (defined.get(selector) || waitDefined(selector)).resolve();
};
exports.define = define;

const defineAsync = (selector, callback, _) => {
  const i = selectors.length;
  lazy.add(selector);
  define(selector, {
    init() {
      if (lazy.has(selector)) {
        lazy.delete(selector);
        callback().then(({default: definition}) => {
          selectors.splice(i, 1);
          components.splice(i, 1);
          (_ || define)(selector, definition);
        });
      }
    }
  });
};
exports.defineAsync = defineAsync;

const get = selector => {
  const i = selectors.indexOf(selector);
  return i < 0 ? void 0 : components[i].definition;
};
exports.get = get;

const upgrade = element => {
  if (selectors.length)
    upgradeDance(element, true);
};
exports.upgrade = upgrade;

const whenDefined = selector => (
  defined.get(selector) ||
  waitDefined(selector)
).promise;
exports.whenDefined = whenDefined;

function connectOrDisconnect(element) {
  $(element).forEach(onConnectedOrDisconnected, this);
}

function init(handler, listeners, wm) {
  for (let i = 0, {length} = listeners; i < length; i++) {
    const {type, options} = listeners[i];
    this.addEventListener(type, handler, options);
  }
  const {observerDetails} = handler;
  if (observerDetails)
    attrObserver.observe(this, observerDetails);
  wm.set(this, true);
  wickedElements.set(this, $(this).concat(handler));
  if (handler.init)
    handler.init();
}

function match(selector, i) {
  if (matches.call(this, selector)) {
    const {definition, listeners, wm} = components[i];
    if (!wm.has(this))
      init.call(
        this,
        create(definition, {
          element: {enumerable: true, value: this},
          [uid]: {writable: true, value: ''}
        }),
        listeners,
        wm
      );
  }
}

function onAttributeChanged(handler) {
  const {observerDetails} = handler;
  if (observerDetails) {
    const {attributeName, oldValue, target} = this;
    const {attributeFilter} = observerDetails;
    if (!attributeFilter || -1 < attributeFilter.indexOf(attributeName))
      handler.attributeChanged(
        attributeName,
        oldValue,
        target.getAttribute(attributeName)
      );
  }
}

function onConnectedOrDisconnected(handler) {
  const method = handler[this];
  if (method && handler[uid] != this) {
    handler[uid] = this;
    method.call(handler);
  }
}
