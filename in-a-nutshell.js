/**************************************************************
 *                  Wicked Elements Basics                    *
 **************************************************************/

// Define a behavior or class for any CSS selector
wickedElements.define('my-element', {behavior: '...'});

// Create an element (but those already live will be upgraded)
const myElement = document.createElement('my-element');

// Add it to the page
document.body.appendChild(myElement);

// Use, if you need it, Shadow DOM, or simply add content
// Remember: Shadow DOM is **NOT** a Custom Elements only thing
// you could attach a Shadow DOM to the document.body too!
myElement.innerHTML = '<h1>Hello Wicked Elements!</h1>';

// Give it props
myElement.myProp = {any: 'value'};

// Listen it
myElement.addEventListener('something', event => { /***/ });

/**************************************************************
 *                Wicked Elements lifecycle                   *
 **************************************************************/

wickedElements.define('.some-css-selector', {

  // instance created
  init(event) {
    // useful for initializing state,
    // attaching a shadow DOM.
  },

  // invoked when adding or moving into the DOM
  onconnected(event) {
    // Useful for running setup code.
    // Content *will be* fully parsed 🎉
  },

  // invoked when removing from the DOM
  ondisconnected(event) {
    // Useful for cleaning up code.
  },

  // aliased also as attributeFilter
  // Array of attribute names to observe
  // or, if omitted, *observe every attribute* 🎉
  observedAttributes: [],

  // invoked when adding, removing, or changing attrs
  // specified, or not, in observedAttributes
  onattributechanged(event) {
    const {attributeName, oldValue, newValue} = event;
    // ...
  }
});
