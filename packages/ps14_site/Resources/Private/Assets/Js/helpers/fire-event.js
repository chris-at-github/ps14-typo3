xna.fireEvent = function(name, parameter, node) {

  if(typeof parameter === 'undefined') {
    parameter = {};
  }

  if(typeof node === 'undefined') {
    node = document;
  }

  node.dispatchEvent(new CustomEvent(name, {detail: parameter}));
};
