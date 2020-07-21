var wickedElements = (function (exports) {
  'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /*! (c) Andrea Giammarchi - ISC */
  // borrowed from https://github.com/WebReflection/dom4/blob/master/src/dom4.js#L130
  var elementMatches = function (indexOf) {
    return 'matches' in document.documentElement ? function (selector) {
      return this.matches(selector);
    } : function (selector) {
      var el = this;
      return (el.matchesSelector || el.webkitMatchesSelector || el.khtmlMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector || el.oMatchesSelector || fallback).call(el, selector);
    };

    function fallback(selector) {
      var parentNode = this.parentNode;
      return !!parentNode && -1 < indexOf.call(parentNode.querySelectorAll(selector), this);
    }
  }([].indexOf);

  /*! (c) Andrea Giammarchi - ISC */
  var nodeContains = Node.prototype.contains || function contains(el) {
    return !!(el.compareDocumentPosition(this) & el.DOCUMENT_POSITION_CONTAINS);
  };

  // A Lame Promise fallback for IE
  var LIE = typeof Promise === 'undefined' ? function (fn) {
    var queue = [];
    var resolved = false;
    fn(resolve);
    return {
      then: then,
      "catch": function _catch() {}
    };

    function resolve() {
      resolved = true;
      queue.splice(0).forEach(then);
    }

    function then(fn) {
      resolved ? setTimeout(fn) : queue.push(fn);
      return this;
    }
  } : Promise;

  var create = Object.create,
      keys = Object.keys;
  var wickedElements = new WeakMap();
  var defined = new Map();
  var uid = '_' + Math.random();
  var connected = 'connected';
  var disconnected = 'dis' + connected;
  var lazy = new Set();
  var selectors = [];
  var components = [];
  var empty = [];
  var forEach = empty.forEach;

  var $ = function $(element) {
    return wickedElements.get(element) || empty;
  };

  var attrObserver = new MutationObserver(function (mutations) {
    for (var i = 0, length = mutations.length; i < length; i++) {
      $(mutations[i].target).forEach(onAttributeChanged, mutations[i]);
    }
  });
  new MutationObserver(function (mutations) {
    if (selectors.length) {
      for (var i = 0, length = mutations.length; i < length; i++) {
        var _mutations$i = mutations[i],
            addedNodes = _mutations$i.addedNodes,
            removedNodes = _mutations$i.removedNodes;
        forEach.call(addedNodes, onConnect);
        forEach.call(removedNodes, onDisconnect);
      }
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });

  var onConnect = function onConnect(element) {
    if (element.querySelectorAll) {
      upgradeDance(element, false);
      connectOrDisconnect.call(connected, element);
      forEach.call(element.querySelectorAll(selectors), connectOrDisconnect, connected);
    }
  };

  var onDisconnect = function onDisconnect(element) {
    if (element.querySelectorAll) {
      connectOrDisconnect.call(disconnected, element);
      forEach.call(element.querySelectorAll(selectors), connectOrDisconnect, disconnected);
    }
  };

  var upgradeChildren = function upgradeChildren(child) {
    selectors.forEach(match, child);
  };

  var upgradeDance = function upgradeDance(element, dispatchConnected) {
    if (element.querySelectorAll) {
      selectors.forEach(match, element);
      var children = element.querySelectorAll(selectors);
      forEach.call(children, upgradeChildren);

      if (dispatchConnected && nodeContains.call(element.ownerDocument, element)) {
        connectOrDisconnect.call(connected, element);
        forEach.call(children, connectOrDisconnect, connected);
      }
    }
  };

  var waitDefined = function waitDefined(selector) {
    var resolve;
    var entry = {
      promise: new LIE(function ($) {
        return resolve = $;
      }),
      resolve: resolve
    };
    defined.set(selector, entry);
    return entry;
  };

  var define = function define(selector, definition) {
    if (get(selector)) throw new Error('duplicated ' + selector);
    var listeners = [];
    var retype = create(null);

    for (var k = keys(definition), i = 0, length = k.length; i < length; i++) {
      var listener = k[i];

      if (/^on/.test(listener) && !/Options$/.test(listener)) {
        var options = definition[listener + 'Options'] || false;
        var lower = listener.toLowerCase();
        var type = lower.slice(2);
        listeners.push({
          type: type,
          options: options
        });
        retype[type] = listener;

        if (lower !== listener) {
          type = listener.slice(2, 3).toLowerCase() + listener.slice(3);
          retype[type] = listener;
          listeners.push({
            type: type,
            options: options
          });
        }
      }
    }

    if (listeners.length) {
      definition.handleEvent = function (event) {
        this[retype[event.type]](event);
      };
    }

    if (definition.attributeChanged) {
      var observerDetails = {
        attributes: true,
        attributeOldValue: true
      };
      var observedAttributes = definition.observedAttributes;
      if ((observedAttributes || empty).length) observerDetails.attributeFilter = observedAttributes;
      definition.observerDetails = observerDetails;
    }

    selectors.push(selector);
    components.push({
      listeners: listeners,
      definition: definition,
      wm: new WeakMap()
    });
    upgrade(document.documentElement);
    if (!lazy.has(selector)) (defined.get(selector) || waitDefined(selector)).resolve();
  };
  var defineAsync = function defineAsync(selector, callback, _) {
    var i = selectors.length;
    lazy.add(selector);
    define(selector, {
      init: function init() {
        if (lazy.has(selector)) {
          lazy["delete"](selector);
          callback().then(function (_ref) {
            var definition = _ref["default"];
            selectors.splice(i, 1);
            components.splice(i, 1);

            (_ || define)(selector, definition);
          });
        }
      }
    });
  };
  var get = function get(selector) {
    var i = selectors.indexOf(selector);
    return i < 0 ? void 0 : components[i].definition;
  };
  var upgrade = function upgrade(element) {
    if (selectors.length) upgradeDance(element, true);
  };
  var whenDefined = function whenDefined(selector) {
    return (defined.get(selector) || waitDefined(selector)).promise;
  };

  function connectOrDisconnect(element) {
    $(element).forEach(onConnectedOrDisconnected, this);
  }

  function init(handler, listeners, wm) {
    for (var i = 0, length = listeners.length; i < length; i++) {
      var _listeners$i = listeners[i],
          type = _listeners$i.type,
          options = _listeners$i.options;
      this.addEventListener(type, handler, options);
    }

    var observerDetails = handler.observerDetails;
    if (observerDetails) attrObserver.observe(this, observerDetails);
    wm.set(this, true);
    wickedElements.set(this, $(this).concat(handler));
    if (handler.init) handler.init();
  }

  function match(selector, i) {
    if (elementMatches.call(this, selector)) {
      var _components$i = components[i],
          definition = _components$i.definition,
          listeners = _components$i.listeners,
          wm = _components$i.wm;
      if (!wm.has(this)) init.call(this, create(definition, _defineProperty({
        element: {
          enumerable: true,
          value: this
        }
      }, uid, {
        writable: true,
        value: ''
      })), listeners, wm);
    }
  }

  function onAttributeChanged(handler) {
    var observerDetails = handler.observerDetails;

    if (observerDetails) {
      var attributeName = this.attributeName,
          oldValue = this.oldValue,
          target = this.target;
      var attributeFilter = observerDetails.attributeFilter;
      if (!attributeFilter || -1 < attributeFilter.indexOf(attributeName)) handler.attributeChanged(attributeName, oldValue, target.getAttribute(attributeName));
    }
  }

  function onConnectedOrDisconnected(handler) {
    var method = handler[this];

    if (method && handler[uid] != this) {
      handler[uid] = this;
      method.call(handler);
    }
  }

  exports.define = define;
  exports.defineAsync = defineAsync;
  exports.get = get;
  exports.upgrade = upgrade;
  exports.whenDefined = whenDefined;

  return exports;

}({}));
