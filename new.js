var wickedElements=function(e){"use strict";function t(e){return this.matches(e)}var n=Node.prototype.contains;const o="undefined"==typeof Promise?function(e){var t=[],n=!1;return e((function(){n=!0,t.splice(0).forEach(o)})),{then:o,catch(){}};function o(e){return n?setTimeout(e):t.push(e),this}}:Promise,{create:i,freeze:r,keys:s}=Object,l=new WeakMap,c=new Map,a="_"+Math.random(),u=[],h=[],d=[],{forEach:f}=d,p=e=>l.get(e)||d,b=new MutationObserver(e=>{for(let t=0,{length:n}=e;t<n;t++)p(e[t].target).forEach(S,e[t])});new MutationObserver(e=>{if(u.length)for(let t=0,{length:n}=e;t<n;t++){const{addedNodes:n,removedNodes:o}=e[t];f.call(n,m),f.call(o,v)}}).observe(document,{childList:!0,subtree:!0});const m=e=>{e.querySelectorAll&&(w(e,!1),O.call("connected",e),f.call(e.querySelectorAll(u),O,"connected"))},v=e=>{e.querySelectorAll&&(O.call("disconnected",e),f.call(e.querySelectorAll(u),O,"disconnected"))},g=e=>{u.forEach(M,e)},w=(e,t)=>{if(e.querySelectorAll){u.forEach(M,e);const o=e.querySelectorAll(u);f.call(o,g),t&&n.call(e.ownerDocument,e)&&(O.call("connected",e),f.call(o,O,"connected"))}},y=e=>{let t;const n={promise:new o(e=>t=e),resolve:t};return c.set(e,n),n},E=e=>{const t=u.indexOf(e);return t<0?void 0:h[t].definition},A=e=>{u.length&&w(e,!0)};function O(e){p(e).forEach(D,this)}function q(e,t,n){for(let n=0,{length:o}=t;n<o;n++){const{type:o,options:i}=t[n];this.addEventListener(o,e,i)}const{observerDetails:o}=e;o&&b.observe(this,o),n.set(this,!0),l.set(this,p(this).concat(e)),e.init&&e.init()}function M(e,n){if(t.call(this,e)){const{definition:e,listeners:t,wm:o}=h[n];o.has(this)||q.call(this,i(e,{element:{enumerable:!0,value:this},[a]:{writable:!0,value:""}}),t,o)}}function S(e){const{observerDetails:t}=e;if(t){const{attributeName:n,oldValue:o,target:i}=this,{attributeFilter:r}=t;(!r||-1<r.indexOf(n))&&e.attributeChanged(n,i.getAttribute(n),o)}}function D(e){const t=e[this];t&&e[a]!=this&&(e[a]=this,t.call(e))}return e.define=(e,t)=>{if(E(e))throw new Error("duplicated "+e);const n=[],o=i(null);for(let e=s(t),i=0,{length:r}=e;i<r;i++){let r=e[i];if(/^on/.test(r)){const e=t[r+"Options"]||!1,i=r.toLowerCase();let s=i.slice(2);n.push({type:s,options:e}),o[s]=r,i!==r&&(s=r.slice(2,3).toLowerCase()+r.slice(3),o[s]=r,n.push({type:s,options:e}))}}if(n.length&&(t.handleEvent=function(e){this[o[e.type]](e)}),t.attributeChanged){const e={attributes:!0,attributeOldValue:!0},{observedAttributes:n}=t;(n||d).length&&(e.attributeFilter=n),t.observerDetails=e}u.push(e),h.push({listeners:n,definition:r(t),wm:new WeakMap}),A(document.documentElement),(c.get(e)||y(e)).resolve()},e.get=E,e.upgrade=A,e.whenDefined=e=>(c.get(e)||y(e)).promise,e}({});
