// @see: https://stackoverflow.com/a/3955238
xna.emptyNode = function(node) {
  while(node.lastElementChild) {
    node.removeChild(node.lastElementChild);
  }
};
