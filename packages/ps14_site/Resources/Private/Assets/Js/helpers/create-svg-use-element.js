// @see: https://florianbrinkmann.com/svg-use-element-javascript-5315/
xna.createSvgUseElement = function(href, attributes) {

  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'),
    use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

  if(typeof attributes !== 'undefined') {
    for(let [name, value] of Object.entries(attributes)) {
      svg.setAttribute(name, value);
    }
  }

  use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', href);
  svg.appendChild(use);

  return svg;
};
