'use strict';
// borrowed from https://github.com/WebReflection/dom4/blob/master/src/dom4.js#L361
var contains = document.contains || function (el) {
  while (el && el !== this) el = el.parentNode;
  return this === el;
};

Object.defineProperty(exports, '__esModule', {value: true}).default = contains;
