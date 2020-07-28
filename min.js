self.wickedElements=function(e){"use strict";var t=new Set,n=new MutationObserver((function(e){t.forEach(r,e)}));function r(e){e(this,n)}n.observe(document,{subtree:!0,childList:!0}),t.observer=n;var a=new WeakMap,o=t.observer,i=function(e){for(var t=function(t,n){var r=e[t],o=r.target,i=r.attributeName,c=r.oldValue,u=o.getAttribute(i);a.get(o).a[i].forEach((function(e){e.call(o,i,c,u)}))},n=0,r=e.length;n<r;n++)t(n)},c=function e(t,n,r,o){for(var i=0,c=t.length;i<c;i++){var u=t[i];r.has(u)||!o&&!("querySelectorAll"in u)||(r.add(u),a.has(u)&&a.get(u)[n].forEach(d,u),e(u.querySelectorAll("*"),n,r,!0))}},u=function(e){for(var t=new Set,n=new Set,r=0,a=e.length;r<a;r++){var o=e[r],u=o.addedNodes,s=o.removedNodes;c(u,"c",t,!1),i(l.takeRecords()),c(s,"d",n,!1)}},l=new MutationObserver(i);t.add(u);var s=function(e,t){var n=t.connectedCallback,r=t.disconnectedCallback,i=t.observedAttributes,c=t.attributeChangedCallback;u(o.takeRecords());var s=a.get(e)||function(e){var t={a:{},c:new Set,d:new Set};return a.set(e,t),t}(e),d=s.a,f=s.c,h=s.d;return i&&(l.observe(e,{attributes:!0,attributeOldValue:!0,attributeFilter:i}),i.forEach((function(t){(d[t]||(d[t]=new Set)).add(c),e.hasAttribute(t)&&c.call(e,t,null,e.getAttribute(t))}))),r&&h.add(r),n&&(f.add(n),e.ownerDocument.compareDocumentPosition(e)&e.DOCUMENT_POSITION_DISCONNECTED||n.call(e)),e};function d(e){e.call(this)}var f="function"==typeof Promise?Promise:function(e){var t=[],n=0;return e((function(){n=1,t.splice(0).forEach(r)})),{then:r};function r(e){return n?setTimeout(e):t.push(e),this}},h=Object.create,v=Object.keys,b=[],w=[],g={},p=new Set,S=new WeakMap,m=function(e,n,r,a){var o=function(e,t){for(var n,r=0,a=e.length;r<a;)n=e[r++],!t.has(n)&&"querySelectorAll"in n&&(t.add(n),i(n,t))},i=function(t,r){for(var i=0,c=e.length;i<c;)(t.matches||t.webkitMatchesSelector||t.msMatchesSelector).call(t,e[i])&&a(t,n[i]),i++;c&&o(t.querySelectorAll(e),r)};return t.add((function(e){for(var t=new Set,n=0,r=e.length;n<r;n++)o(e[n].addedNodes,t)})),{get:function(t){var r=e.indexOf(t);return r<0?void 0:n[r].o},upgrade:function(e){i(e,new Set)},whenDefined:function(e){if(!(e in r)){var t,n=new f((function(e){t=e}));r[e]={_:t,$:n}}return r[e].$},$:o}}(w,b,g,(function(e,t){var n=t.m,r=t.l,a=t.o;if(!n.has(e)){var o=h(a,{element:{enumerable:!0,value:e}});n.set(e,0),S.set(e,o);for(var i=0,c=r.length;i<c;i++)e.addEventListener(r[i].t,o,r[i].o);o.init&&o.init(),s(e,a)}})),O=m.get,k=m.upgrade,E=m.whenDefined,C=m.$,y=function(e){return function(){e.apply(S.get(this),arguments)}},A=function(e,t){if(O(e))throw new Error("duplicated: "+e);for(var n=[],r=h(null),a=v(t),o=0,i=a.length;o<i;o++){var c=a[o];if(/^(?:connected|disconnected|attributeChanged)$/.test(c))t[c+"Callback"]=y(t[c]);else if(/^on/.test(c)&&!/Options$/.test(c)){var u=t[c+"Options"]||!1,l=c.toLowerCase(),s=l.slice(2);n.push({t:s,o:u}),r[s]=c,l!==c&&(s=c.slice(2,3).toLowerCase()+c.slice(3),r[s]=c,n.push({t:s,o:u}))}}n.length&&(t.handleEvent=function(e){this[r[e.type]](e)}),w.push(e),b.push({m:new WeakMap,l:n,o:t}),C(document.querySelectorAll(e),new Set),E(e),p.has(e)||g[e]._()};return e.define=A,e.defineAsync=function(e,t,n){p.add(e),A(e,{init:function(){p.has(e)&&(p.delete(e),t().then((function(t){var r=t.default,a=w.indexOf(e);w.splice(a,1),b.splice(a,1),(n||A)(e,r)})))}})},e.get=O,e.upgrade=k,e.whenDefined=E,e}({});