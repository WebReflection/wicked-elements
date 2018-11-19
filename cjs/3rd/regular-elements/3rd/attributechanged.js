'use strict';
/*! (c) Andrea Giammarchi */
function attributechanged(poly) {'use strict';
  var Event = poly.Event;
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
Object.defineProperty(exports, '__esModule', {value: true}).default = attributechanged;
