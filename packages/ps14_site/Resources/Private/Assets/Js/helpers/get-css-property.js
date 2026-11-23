xna.getCssProperty = function(node, property) {
  return window.getComputedStyle(node, null).getPropertyValue(property);
}
