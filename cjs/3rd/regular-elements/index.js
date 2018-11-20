'use strict';
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

const Event = (m => m.__esModule ? m.default : m)(require('./poorly/event.js'));
const WeakSet = (m => m.__esModule ? m.default : m)(require('./poorly/weakset.js'));
const assign = (m => m.__esModule ? m.default : m)(require('./poorly/assign.js'));

const contains = (m => m.__esModule ? m.default : m)(require('./poly/contains.js'));
const matches = (m => m.__esModule ? m.default : m)(require('./poly/matches.js'));

const attributechanged = (m => m.__esModule ? m.default : m)(require('./3rd/attributechanged.js'));
const disconnected = (m => m.__esModule ? m.default : m)(require('./3rd/disconnected.js'));

var bootstrap = true;

var query = [];
var config = [];
var waiting = {};
var known = {};

var regularElements = {
  Event: Event,
  WeakSet: WeakSet,
  assign: assign,
  document: document,
  define: function (selector, options) {
    if (bootstrap) {
      bootstrap = false;
      init(regularElements.document);
    }
    var type = typeof selector;
    if (type === 'string') {
      if (-1 < query.indexOf(selector))
        throw new Error('duplicated: ' + selector);
      query.push(selector);
      config.push(options || {});
      ready();
      if (selector in waiting) {
        waiting[selector](config[config.length - 1]);
        delete waiting[selector];
      }
    } else {
      if (type !== "object" || selector.nodeType !== 1)
        throw new Error('undefinable: ' + selector);
      setupListeners(selector, options || {});
    }
  },
  get: function (selector) {
    var i = query.indexOf(selector);
    return i < 0 ? null : assign({}, config[i]);
  },
  whenDefined: function (selector) {
    return Promise.resolve(
      regularElements.get(selector) ||
      new Promise(function ($) {
        waiting[selector] = $;
      })
    );
  }
};

// passing along regularElements as poly for Event and WeakSet
var lifecycle = disconnected(regularElements);
var observe = {
  attributechanged: attributechanged(regularElements),
  connected: lifecycle,
  disconnected: lifecycle
};

Object.defineProperty(exports, '__esModule', {value: true}).default = regularElements;
exports.regularElements = regularElements;
exports.assign = assign;
exports.Event = Event;
exports.WeakSet = WeakSet;

function changes(records) {
  for (var i = 0, length = records.length; i < length; i++)
    setupList(records[i].addedNodes, false);
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
    setupList(regularElements.document.querySelectorAll(query), true);
}

function setup(node) {
  setupList(node.querySelectorAll(query), true);
  for (var ws, css, i = 0, length = query.length; i < length; i++) {
    css = query[i];
    ws = known[css] || (known[css] = new WeakSet);
    if (!ws.has(node) && matches(node, query[i])) {
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
    if (dispatch && contains.call(regularElements.document, node))
      node.dispatchEvent(new Event(type));
  }
}

function setupListeners(node, options) {
  setupListener(node, options, 'attributechanged', false);
  setupListener(node, options, 'disconnected', false);
  setupListener(node, options, 'connected', true);
}
