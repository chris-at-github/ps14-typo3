// @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#polyfill
if(typeof Object.entries !== 'function') {
  Object.entries = function(obj) {
    var properties = Object.keys(obj),
      i = properties.length,
      result = new Array(i); // preallocate the Array
    while(i --) {
      result[i] = [properties[i], obj[properties[i]]];
    }

    return result;
  };
}
