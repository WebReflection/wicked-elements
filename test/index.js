require('basichtml').init();

const wickedElements = require('../cjs').default;

wickedElements.define('literal', {
  observedAttributes: ['test'],
  init: function (event) {
    this.el = event.currentTarget;
  },
  onclick: function (event) {
    log(event.type);
  },
  onconnected: function (event) {
    log(event.type);
  },
  ondisconnected: function (event) {
    log(event.type);
  },
  onattributechanged: function (event) {
    log(event.type);
  }
});

wickedElements.define('whatever', {
  onconnected: function (event) {
    log(event.type);
  },
  ondisconnected: function (event) {
    log(event.type);
  }
});

wickedElements.define('.literal', {
  init: function (event) {
    this.el = event.currentTarget;
  },
  onclick: function (event) {
    log(event.type);
  },
  onconnected: function (event) {
    log(event.type);
  },
  onattributechanged: function () {}
});

wickedElements.define('class', class {
  static get observedAttributes() { return ['test']; }
  init(event) {
    this.el = event.currentTarget;
  }
  onclick(event) {
    log(event.type);
  }
  onconnected(event) {
    log(event.type);
  }
  ondisconnected(event) {
    log(event.type);
  }
  onattributechanged(event) {
    log(event.type);
  }
});

wickedElements.define('.class', class {
  get attributeFilter() { return ['test']; }
  onattributechanged(event) {
    log(event.type);
  }
});

var el = document.createElement('div');
document.body.appendChild(el);
var event = document.createEvent('Event');
event.initEvent('DOMNodeInserted', false, false);
event.target = el;
document.dispatchEvent(event);
