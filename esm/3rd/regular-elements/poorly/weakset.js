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

var $WeakSet;

try {
  $WeakSet = (new WeakSet).constructor;
} catch(o_O) {
  try {
    // IE11 apparently has WeakMap but no WeakSet
    o_O = ($WeakSet = new WeakMap && function () {
      this.$ = new WeakMap;
    }).prototype;
    o_O.add = function (O) {
      this.$.set(O, 0);
      return this;
    };
    o_O.has = function (O) {
      return this.$.has(O);
    };
    o_O.delete = function (O) {
      return this.$.delete(O);
    };
  } catch(o_O) {
    // all other browsers
    var i = 0;
    o_O = ($WeakSet = function () {
      this.$ = ['__', Math.random(), i++, '__'].join('ws');
    }).prototype;
    o_O.add = function (O) {
      if (!this.has(O))
        Object.defineProperty(O, this.$, {value:true, configurable:true});
      return this;
    };
    o_O.has = function (O) {
      return this.hasOwnProperty.call(O, this.$);
    };
    o_O.delete = function (O) {
      return delete O[this.$];
    };
  }
}

export default $WeakSet;
