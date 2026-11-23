// @see: https://stackoverflow.com/a/6021027
xna.addQueryString = function(uri, key, value) {
  let re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  let separator = uri.indexOf('?') !== -1 ? '&' : '?';

  if(uri.match(re)) {
    return uri.replace(re, '$1' + key + "=" + value + '$2');

  }	else {
    return uri + separator + key + '=' + value;
  }
};
