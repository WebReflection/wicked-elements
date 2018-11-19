var indexOf = [].indexOf;

// borrowed from https://github.com/WebReflection/dom4/blob/master/src/dom4.js#L130
var matches = 'matches' in document.documentElement ?
  function (el, selector) {
    return el.matches(selector);
  } :
  function (el, selector) {
    return (
      el.matchesSelector ||
      el.webkitMatchesSelector ||
      el.khtmlMatchesSelector ||
      el.mozMatchesSelector ||
      el.msMatchesSelector ||
      el.oMatchesSelector ||
      fallback
    ).call(el, selector);
  };

export default matches;

function fallback(selector) {
  var parentNode = this.parentNode;
  return !!parentNode && -1 < indexOf.call(
    parentNode.querySelectorAll(selector),
    this
  );
}
