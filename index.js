self.wickedElements = (function (exports) {
  'use strict';

  var asCE = (function (selectors, root) {
    var wm = new WeakMap();

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

    var invoke = function invoke(nodes, key, parsed, noCheck) {
      for (var i = 0, length = nodes.length; i < length; i++) {
        var target = nodes[i];

        if (!parsed.has(target) && (noCheck || 'querySelectorAll' in target)) {
          parsed.add(target);
          if (wm.has(target)) wm.get(target)[key].forEach(call, target);
          if (selectors.length) invoke(target.querySelectorAll(selectors), key, parsed, true);
        }
      }
    };

    var mainLoop = function mainLoop(records) {
      for (var i = 0, length = records.length; i < length; i++) {
        var _records$i2 = records[i],
            addedNodes = _records$i2.addedNodes,
            removedNodes = _records$i2.removedNodes;
        invoke(addedNodes, 'c', new Set(), false);
        attributeChanged(sao.takeRecords());
        invoke(removedNodes, 'd', new Set(), false);
      }
    };

    var set = function set(target) {
      var sets = {
        a: {},
        c: new Set(),
        d: new Set()
      };
      wm.set(target, sets);
      return sets;
    };

    var sao = new MutationObserver(attributeChanged);
    var sdo = new MutationObserver(mainLoop);
    sdo.observe(root, {
      childList: true,
      subtree: true
    });
    return function (target, _ref) {
      var connectedCallback = _ref.connectedCallback,
          disconnectedCallback = _ref.disconnectedCallback,
          observedAttributes = _ref.observedAttributes,
          attributeChangedCallback = _ref.attributeChangedCallback;
      mainLoop(sdo.takeRecords());

      var _ref2 = wm.get(target) || set(target),
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
        c.add(connectedCallback);
        if (!(target.ownerDocument.compareDocumentPosition(target) & target.DOCUMENT_POSITION_DISCONNECTED)) connectedCallback.call(target);
      }

      return target;
    };
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
  var utils = (function (root, query, config, defined, setup) {
    // exports
    var get = function get(selector) {
      var i = query.indexOf(selector);
      return i < 0 ? void 0 : config[i].o;
    };

    var upgrade = function upgrade(node) {
      upgradeNode(node, new Set(), true);
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


    var setupList = function setupList(nodes, parsed, noCheck) {
      for (var node, i = 0, length = nodes.length; i < length; i++) {
        node = nodes[i];

        if (!parsed.has(node) && (noCheck || 'querySelectorAll' in node)) {
          parsed.add(node);
          upgradeNode(node, parsed, true);
        }
      }
    };

    var upgradeAll = function upgradeAll(node, parsed, noCheck) {
      if (query.length) setupList(node.querySelectorAll(query), parsed, noCheck);
    };

    var upgradeNode = function upgradeNode(node, parsed, noCheck) {
      for (var i = 0, length = query.length; i < length; i++) {
        if ((node.matches || node.webkitMatchesSelector || node.msMatchesSelector).call(node, query[i])) setup(node, config[i]);
      }

      upgradeAll(node, parsed, noCheck);
    };

    addEventListener('DOMContentLoaded', upgradeAll.bind(null, root, new Set(), true), {
      once: 1
    });
    return {
      get: get,
      upgrade: upgrade,
      whenDefined: whenDefined,
      $: setupList,
      _: asCE(query, root)
    };
  });

  var create = Object.create,
      keys = Object.keys;
  var config = [];
  var query = [];
  var defined = {};
  var lazy = new Set();
  var wicked = new WeakMap();

  var _utils = utils(document, query, config, defined, function (value, _ref) {
    var m = _ref.m,
        l = _ref.l,
        o = _ref.o;

    if (!m.has(value)) {
      var handler = create(o, {
        element: {
          enumerable: true,
          value: value
        }
      });
      m.set(value, 0);
      wicked.set(value, handler);

      for (var i = 0, length = l.length; i < length; i++) {
        value.addEventListener(l[i].t, handler, l[i].o);
      }

      if (handler.init) handler.init();
      asCustomElement(value, o);
    }
  }),
      get = _utils.get,
      upgrade = _utils.upgrade,
      whenDefined = _utils.whenDefined,
      setupList = _utils.$,
      asCustomElement = _utils._;

  var delegate = function delegate(method) {
    return function () {
      method.apply(wicked.get(this), arguments);
    };
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
    setupList(document.querySelectorAll(selector), new Set(), true);
    whenDefined(selector);
    if (!lazy.has(selector)) defined[selector]._();
  };
  var defineAsync = function defineAsync(selector, callback, _) {
    lazy.add(selector);
    define(selector, {
      init: function init() {
        if (lazy.has(selector)) {
          lazy["delete"](selector);
          callback().then(function (_ref2) {
            var definition = _ref2["default"];
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
