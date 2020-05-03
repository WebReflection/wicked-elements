function _defineProperty(a,b,c){return b in a?Object.defineProperty(a,b,{value:c,enumerable:!0,configurable:!0,writable:!0}):a[b]=c,a}/*! (c) Andrea Giammarchi - ISC */ // borrowed from https://github.com/WebReflection/dom4/blob/master/src/dom4.js#L130
var elementMatches=function(a){function b(b){var c=this.parentNode;return!!c&&-1<a.call(c.querySelectorAll(b),this)}return"matches"in document.documentElement?function(a){return this.matches(a)}:function(a){var c=this;return(c.matchesSelector||c.webkitMatchesSelector||c.khtmlMatchesSelector||c.mozMatchesSelector||c.msMatchesSelector||c.oMatchesSelector||b).call(c,a)}}([].indexOf),nodeContains=Node.prototype.contains||function(a){return!!(a.compareDocumentPosition(this)&a.DOCUMENT_POSITION_CONTAINS)},LIE="undefined"==typeof Promise?function(a){function b(a){return d?setTimeout(a):c.push(a),this}var c=[],d=!1;return a(function(){d=!0,c.splice(0).forEach(b)}),{then:b,catch:function(){}}}:Promise,create=Object.create,keys=Object.keys,wickedElements=new WeakMap,defined=new Map,uid="_"+Math.random(),connected="connected",disconnected="dis"+connected,selectors=[],components=[],empty=[],forEach=empty.forEach,$=function(a){return wickedElements.get(a)||empty},attrObserver=new MutationObserver(function(a){for(var b=0,c=a.length;b<c;b++)$(a[b].target).forEach(onAttributeChanged,a[b])});/*! (c) Andrea Giammarchi - ISC */new MutationObserver(function(a){if(selectors.length)for(var b=0,c=a.length;b<c;b++){var d=a[b],e=d.addedNodes,f=d.removedNodes;forEach.call(e,onConnect),forEach.call(f,onDisconnect)}}).observe(document,{childList:!0,subtree:!0});var onConnect=function(a){a.querySelectorAll&&(upgradeDance(a,!1),connectOrDisconnect.call(connected,a),forEach.call(a.querySelectorAll(selectors),connectOrDisconnect,connected))},onDisconnect=function(a){a.querySelectorAll&&(connectOrDisconnect.call(disconnected,a),forEach.call(a.querySelectorAll(selectors),connectOrDisconnect,disconnected))},upgradeChildren=function(a){selectors.forEach(match,a)},upgradeDance=function(a,b){if(a.querySelectorAll){selectors.forEach(match,a);var c=a.querySelectorAll(selectors);forEach.call(c,upgradeChildren),b&&nodeContains.call(a.ownerDocument,a)&&(connectOrDisconnect.call(connected,a),forEach.call(c,connectOrDisconnect,connected))}},waitDefined=function(a){var b,c={promise:new LIE(function(a){return b=a}),resolve:b};return defined.set(a,c),c},define=function(a,b){if(get(a))throw new Error("duplicated "+a);for(var c,d=[],e=create(null),f=keys(b),g=0,h=f.length;g<h;g++)if(c=f[g],/^on/.test(c)&&!/Options$/.test(c)){var j=b[c+"Options"]||!1,k=c.toLowerCase(),l=k.slice(2);d.push({type:l,options:j}),e[l]=c,k!==c&&(l=c.slice(2,3).toLowerCase()+c.slice(3),e[l]=c,d.push({type:l,options:j}))}if(d.length&&(b.handleEvent=function(a){this[e[a.type]](a)}),b.attributeChanged){var m={attributes:!0,attributeOldValue:!0},n=b.observedAttributes;(n||empty).length&&(m.attributeFilter=n),b.observerDetails=m}selectors.push(a),components.push({listeners:d,definition:b,wm:new WeakMap}),upgrade(document.documentElement),(defined.get(a)||waitDefined(a)).resolve()},get=function(a){var b=selectors.indexOf(a);return 0>b?void 0:components[b].definition},upgrade=function(a){selectors.length&&upgradeDance(a,!0)},whenDefined=function(a){return(defined.get(a)||waitDefined(a)).promise};function connectOrDisconnect(a){$(a).forEach(onConnectedOrDisconnected,this)}function init(a,b,c){for(var d=0,e=b.length;d<e;d++){var f=b[d],g=f.type,h=f.options;this.addEventListener(g,a,h)}var j=a.observerDetails;j&&attrObserver.observe(this,j),c.set(this,!0),wickedElements.set(this,$(this).concat(a)),a.init&&a.init()}function match(a,b){if(elementMatches.call(this,a)){var c=components[b],d=c.definition,e=c.listeners,f=c.wm;f.has(this)||init.call(this,create(d,_defineProperty({element:{enumerable:!0,value:this}},uid,{writable:!0,value:""})),e,f)}}function onAttributeChanged(a){var b=a.observerDetails;if(b){var c=this.attributeName,d=this.oldValue,e=this.target,f=b.attributeFilter;(!f||-1<f.indexOf(c))&&a.attributeChanged(c,d,e.getAttribute(c))}}function onConnectedOrDisconnected(a){var b=a[this];b&&a[uid]!=this&&(a[uid]=this,b.call(a))}export{define,get,upgrade,whenDefined};
