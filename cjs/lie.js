'use strict';
// A Lame Promise fallback for IE
const LIE = typeof Promise === 'undefined' ?
                    function (fn) {
                      var queue = [];
                      var resolved = false;
                      fn(resolve);
                      return {then, catch() {}};
                      function resolve() {
                        resolved = true;
                        queue.splice(0).forEach(then);
                      }
                      function then(fn) {
                        resolved ? setTimeout(fn) : queue.push(fn);
                        return this;
                      }
                    } :
                    Promise;
exports.LIE = LIE;
