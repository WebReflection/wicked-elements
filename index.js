self.wickedElements = (function (exports) {
  'use strict';

  var set = new Set();
  var observer = new MutationObserver(function (records) {
    set.forEach(invoke, records);
  });
  observer.observe(document, {
    subtree: true,
    childList: true
  });
  set.observer = observer;

  function invoke(callback) {
    callback(this, observer);
  }

  var wm = new WeakMap();
  var observer$1 = set.observer;

  var attributeChanged = function attributeChanged(records) {
    var _loop = function _loop(i, length) {
      var _records$i = records[i],
          target = _records$i.target,
          attributeName = _records$i.attributeName,
          oldValue = _records$i.oldValue;
      var newValue = target.getAttribute(attributeName);
      wm.get(target).a[attributeName].forEach(function (attributeChangedCallback) {
        attributeChangedCallback.call(target, attributeName, oldValue, newValue);
      });
    };

    for (var i = 0, length = records.length; i < length; i++) {
      _loop(i);
    }
  };

  var invoke$1 = function invoke(nodes, key) {
    for (var i = 0, length = nodes.length; i < length; i++) {
      var target = nodes[i];
      if (wm.has(target)) wm.get(target)[key].forEach(call, target);
      invoke(target.children || [], key);
    }
  };

  var mainLoop = function mainLoop(records) {
    for (var i = 0, length = records.length; i < length; i++) {
      var _records$i2 = records[i],
          addedNodes = _records$i2.addedNodes,
          removedNodes = _records$i2.removedNodes;
      invoke$1(addedNodes, 'c');
      attributeChanged(sao.takeRecords());
      invoke$1(removedNodes, 'd');
    }
  };

  var sao = new MutationObserver(attributeChanged);

  var set$1 = function set(target) {
    var sets = {
      a: {},
      c: new Set(),
      d: new Set()
    };
    wm.set(target, sets);
    return sets;
  };

  set.add(mainLoop);
  var asCustomElement = (function (target, _ref) {
    var connectedCallback = _ref.connectedCallback,
        disconnectedCallback = _ref.disconnectedCallback,
        observedAttributes = _ref.observedAttributes,
        attributeChangedCallback = _ref.attributeChangedCallback;
    mainLoop(observer$1.takeRecords());

    var _ref2 = wm.get(target) || set$1(target),
        a = _ref2.a,
        c = _ref2.c,
        d = _ref2.d;

    if (observedAttributes) {
      sao.observe(target, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: observedAttributes
      });
      observedAttributes.forEach(function (attributeName) {
        (a[attributeName] || (a[attributeName] = new Set())).add(attributeChangedCallback);
        if (target.hasAttribute(attributeName)) attributeChangedCallback.call(target, attributeName, null, target.getAttribute(attributeName));
      });
    }

    if (disconnectedCallback) d.add(disconnectedCallback);

    if (connectedCallback) {
      c.add(connectedCallback); // if (target.isConnected) // No IE11/Edge support

      if (!(target.ownerDocument.compareDocumentPosition(target) & target.DOCUMENT_POSITION_DISCONNECTED)) connectedCallback.call(target);
    }

    return target;
  });

  function call(back) {
    back.call(this);
  }

  var Lie = typeof Promise === 'function' ? Promise : function (fn) {
    var queue = [],
        resolved = 0;
    fn(function () {
      resolved = 1;
      queue.splice(0).forEach(then);
    });
    return {
      then: then
    };

    function then(fn) {
      return resolved ? setTimeout(fn) : queue.push(fn), this;
    }
  };
  var utils = (function (query, config, defined, setup) {
    // exports
    var get = function get(selector) {
      var i = query.indexOf(selector);
      return i < 0 ? void 0 : config[i].o;
    };

    var upgrade = function upgrade(node) {
      query.forEach(setup, node);
    };

    var whenDefined = function whenDefined(selector) {
      if (!(selector in defined)) {
        var _,
            $ = new Lie(function ($) {
          _ = $;
        });

        defined[selector] = {
          _: _,
          $: $
        };
      }

      return defined[selector].$;
    }; // util


    var setupList = function setupList(nodes) {
      for (var i = 0, length = nodes.length; i < length; i++) {
        upgrade(nodes[i]);
      }
    };

    set.add(function (records) {
      for (var i = 0, length = records.length; i < length; i++) {
        setupList(records[i].addedNodes);
      }
    });
    return {
      get: get,
      upgrade: upgrade,
      whenDefined: whenDefined,
      $: setupList
    };
  });

  var create = Object.create,
      keys = Object.keys;
  var config = [];
  var query = [];
  var defined = {};
  var lazy = new Set();
  var wicked = new WeakMap();

  var _utils = utils(query, config, defined, function (selector, i) {
    var querySelectorAll = this.querySelectorAll;

    if (querySelectorAll) {
      if ((this.matches || this.webkitMatchesSelector || this.msMatchesSelector).call(this, selector)) {
        var _config$i = config[i],
            m = _config$i.m,
            l = _config$i.l,
            o = _config$i.o;
        if (!m.has(this)) init(this, m, l, o);
      }

      setupList(querySelectorAll.call(this, query));
    }
  }),
      get = _utils.get,
      upgrade = _utils.upgrade,
      whenDefined = _utils.whenDefined,
      setupList = _utils.$;

  var delegate = function delegate(method) {
    return function () {
      method.apply(wicked.get(this), arguments);
    };
  };

  var init = function init(value, wm, listeners, definition) {
    var handler = create(definition, {
      element: {
        enumerable: true,
        value: value
      }
    });
    wm.set(value, 0);
    wicked.set(value, handler);

    for (var i = 0, length = listeners.length; i < length; i++) {
      value.addEventListener(listeners[i].t, handler, listeners[i].o);
    }

    if (handler.init) handler.init();
    asCustomElement(value, definition);
  };

  var define = function define(selector, definition) {
    if (get(selector)) throw new Error('duplicated: ' + selector);
    var listeners = [];
    var retype = create(null);

    for (var k = keys(definition), i = 0, length = k.length; i < length; i++) {
      var key = k[i];
      if (/^(?:connected|disconnected|attributeChanged)$/.test(key)) definition[key + 'Callback'] = delegate(definition[key]);else if (/^on/.test(key) && !/Options$/.test(key)) {
        var options = definition[key + 'Options'] || false;
        var lower = key.toLowerCase();
        var type = lower.slice(2);
        listeners.push({
          t: type,
          o: options
        });
        retype[type] = key;

        if (lower !== key) {
          type = key.slice(2, 3).toLowerCase() + key.slice(3);
          retype[type] = key;
          listeners.push({
            t: type,
            o: options
          });
        }
      }
    }

    if (listeners.length) {
      definition.handleEvent = function (event) {
        this[retype[event.type]](event);
      };
    }

    query.push(selector);
    config.push({
      m: new WeakMap(),
      l: listeners,
      o: definition
    });
    setupList(document.querySelectorAll(selector));
    whenDefined(selector);
    if (!lazy.has(selector)) defined[selector]._();
  };
  var defineAsync = function defineAsync(selector, callback, _) {
    lazy.add(selector);
    define(selector, {
      init: function init() {
        if (lazy.has(selector)) {
          lazy["delete"](selector);
          callback().then(function (_ref) {
            var definition = _ref["default"];
            var i = query.indexOf(selector);
            query.splice(i, 1);
            config.splice(i, 1);

            (_ || define)(selector, definition);
          });
        }
      }
    });
  };

  exports.define = define;
  exports.defineAsync = defineAsync;
  exports.get = get;
  exports.upgrade = upgrade;
  exports.whenDefined = whenDefined;

  return exports;

}({}));
