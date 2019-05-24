var wickedElements = wickedElements || (function (Object) {
  'use strict';

  var assign = Object.assign;

  function matches (selector) {
    return this.matches(selector);
  }

  /*! (c) Andrea Giammarchi */
  function attributechanged(poly) {  var Event = poly.Event;
    return function observe(node, attributeFilter) {
      var options = {attributes: true, attributeOldValue: true};
      var filtered = attributeFilter instanceof Array && attributeFilter.length;
      if (filtered)
        options.attributeFilter = attributeFilter.slice(0);
      try {
        (new MutationObserver(changes)).observe(node, options);
      } catch(o_O) {
        options.handleEvent = filtered ? handleEvent : attrModified;
        node.addEventListener('DOMAttrModified', options, true);
      }
      return node;
    };
    function attrModified(event) {
      dispatchEvent(event.target, event.attrName, event.prevValue);
    }
    function dispatchEvent(node, attributeName, oldValue) {
      var event = new Event('attributechanged');
      event.attributeName = attributeName;
      event.oldValue = oldValue;
      event.newValue = node.getAttribute(attributeName);
      node.dispatchEvent(event);
    }
    function changes(records) {
      for (var record, i = 0, length = records.length; i < length; i++) {
        record = records[i];
        dispatchEvent(record.target, record.attributeName, record.oldValue);
      }
    }
    function handleEvent(event) {
      if (-1 < this.attributeFilter.indexOf(event.attrName))
        attrModified(event);
    }
  }

  /*! (c) Andrea Giammarchi */
  function disconnected(poly) {  var CONNECTED = 'connected';
    var DISCONNECTED = 'dis' + CONNECTED;
    var Event = poly.Event;
    var WeakSet = poly.WeakSet;
    var notObserving = true;
    var observer = null;
    return function observe(node) {
      if (notObserving) {
        notObserving = !notObserving;
        observer = new WeakSet;
        startObserving(node.ownerDocument);
      }
      observer.add(node);
      return node;
    };
    function startObserving(document) {
      var dispatched = {};
      dispatched[CONNECTED] = new WeakSet;
      dispatched[DISCONNECTED] = new WeakSet;
      try {
        (new MutationObserver(changes)).observe(
          document,
          {subtree: true, childList: true}
        );
      }
      catch(o_O) {
        var timer = 0;
        var records = [];
        var reschedule = function (record) {
          records.push(record);
          clearTimeout(timer);
          timer = setTimeout(
            function () {
              changes(records.splice(timer = 0, records.length));
            },
            0
          );
        };
        document.addEventListener(
          'DOMNodeRemoved',
          function (event) {
            reschedule({addedNodes: [], removedNodes: [event.target]});
          },
          true
        );
        document.addEventListener(
          'DOMNodeInserted',
          function (event) {
            reschedule({addedNodes: [event.target], removedNodes: []});
          },
          true
        );
      }
      function changes(records) {
        for (var
          record,
          length = records.length,
          i = 0; i < length; i++
        ) {
          record = records[i];
          dispatchAll(record.removedNodes, DISCONNECTED, CONNECTED);
          dispatchAll(record.addedNodes, CONNECTED, DISCONNECTED);
        }
      }
      function dispatchAll(nodes, type, counter) {
        for (var
          node,
          event = new Event(type),
          length = nodes.length,
          i = 0; i < length;
          (node = nodes[i++]).nodeType === 1 &&
          dispatchTarget(node, event, type, counter)
        );
      }
      function dispatchTarget(node, event, type, counter) {
        if (observer.has(node) && !dispatched[type].has(node)) {
          dispatched[counter].delete(node);
          dispatched[type].add(node);
          node.dispatchEvent(event);
          /*
          // The event is not bubbling (perf reason: should it?),
          // hence there's no way to know if
          // stop/Immediate/Propagation() was called.
          // Should DOM Level 0 work at all?
          // I say it's a YAGNI case for the time being,
          // and easy to implement in user-land.
          if (!event.cancelBubble) {
            var fn = node['on' + type];
            if (fn)
              fn.call(node, event);
          }
          */
        }
        for (var
          // apparently is node.children || IE11 ... ^_^;;
          // https://github.com/WebReflection/disconnected/issues/1
          children = node.children || [],
          length = children.length,
          i = 0; i < length;
          dispatchTarget(children[i++], event, type, counter)
        );
      }
    }
  }

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

  var poly = {Event: CustomEvent, WeakSet: WeakSet};
  var contains = document.contains || function (el) {
    while (el && el !== this) el = el.parentNode;
    return this === el;
  };

  var bootstrap = true;

  var query = [];
  var config = [];
  var waiting = {};
  var known = {};

  var regularElements = {
    define: function (selector, options) {
      if (bootstrap) {
        bootstrap = false;
        init(document);
      }
      var type = typeof selector;
      if (type === 'string') {
        if (get(selector))
          throw new Error('duplicated: ' + selector);
        query.push(selector);
        config.push(options || {});
        ready();
        if (selector in waiting) {
          var cfg = get(selector);
          if (cfg) {
            waiting[selector](cfg);
            delete waiting[selector];
          }
        }
      } else {
        if (type !== "object" || selector.nodeType !== 1)
          throw new Error('undefinable: ' + selector);
        setupListeners(selector, options || {});
      }
    },
    get: get,
    whenDefined: function (selector) {
      return Promise.resolve(
        get(selector) ||
        new Promise(function ($) {
          waiting[selector] = $;
        })
      );
    }
  };

  // passing along regularElements as poly for Event and WeakSet
  var lifecycle = disconnected(poly);
  var observe = {
    attributechanged: attributechanged(poly),
    connected: lifecycle,
    disconnected: lifecycle
  };

  function changes(records) {
    for (var i = 0, length = records.length; i < length; i++)
      setupList(records[i].addedNodes, false);
  }

  function get(selector) {
    var i = query.indexOf(selector);
    return i < 0 ? null : assign({}, config[i]);
  }

  function init(doc) {
    try {
      (new MutationObserver(changes))
        .observe(doc, {subtree: true, childList: true});
    }
    catch(o_O) {
      doc.addEventListener(
        'DOMNodeInserted',
        function (e) {
          changes([{addedNodes: [e.target]}]);
        },
        false
      );
    }
    if (doc.readyState !== 'complete')
      doc.addEventListener('DOMContentLoaded', ready, {once: true});
  }

  function ready() {
    if (query.length)
      setupList(document.querySelectorAll(query), true);
  }

  function setup(node) {
    setupList(node.querySelectorAll(query), true);
    for (var ws, css, i = 0, length = query.length; i < length; i++) {
      css = query[i];
      ws = known[css] || (known[css] = new WeakSet);
      if (!ws.has(node) && matches.call(node, query[i])) {
        ws.add(node);
        setupListeners(node, config[i]);
      }
    }
  }

  function setupList(nodes, isElement) {
    for (var node, i = 0, length = nodes.length; i < length; i++) {
      node = nodes[i];
      if (isElement || node.nodeType === 1)
        setup(node);
    }
  }

  function setupListener(node, options, type, dispatch) {
    var method = options['on' + type];
    if (method) {
      observe[type](node, options.attributeFilter)
        .addEventListener(type, method, false);
      if (dispatch && contains.call(document, node))
        node.dispatchEvent(new CustomEvent(type));
    }
  }

  function setupListeners(node, options) {
    setupListener(node, options, 'attributechanged', false);
    setupListener(node, options, 'disconnected', false);
    setupListener(node, options, 'connected', true);
  }

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

  // minifier friendly constants
  var ONDISCONNECTED = 'ondisconnected';
  var ONATTRIBUTECHANGED = 'onattributechanged';

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
  var wickedElements = wickedElements || create(regularElements, {
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
        addIfNeeded(proto, 'init', init$1);
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
            bootstrap$1(
              isClass ? new component : create(proto),
              events, event, el, type
            );
          }
        }
      }
    }
  });

  function addIfNeeded(component, key, value) {
    if (!(key in component))
      defineProperty(component, key, {value: value});
  }

  function bootstrap$1(handler, events, event, el, method) {
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

  function init$1(event) {
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

  

  return wickedElements;

}(Object));
