xna.getElementPosition = function(node) {
  let	element = document.scrollingElement || document.documentElement,
    position = {
      x: 0,
      y: 0
    };

  if(node !== null) {
    position.y = (node.getBoundingClientRect().y || node.getBoundingClientRect().top) + element.scrollTop;
    position.x = (node.getBoundingClientRect().x || node.getBoundingClientRect().left) + element.scrollLeft; // noch nicht getestet
  }

  return position;
}
