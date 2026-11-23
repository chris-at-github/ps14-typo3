(function () {
  'use strict';

  xna.on('documentLoaded', function() {
    let body = document.querySelector('body');

    document.querySelectorAll('#header .hamburger').forEach(function(node) {
      node.addEventListener('click', function() {
        body.classList.toggle('is--off-canvas-active');

        // Scrollbars ausblenden
        xna.fireEvent('scrolllock.toggle');
      }, false);
    });
  });
})();
