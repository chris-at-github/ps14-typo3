(function () {
  'use strict';

  xna.on('documentLoaded', function() {
    document.querySelectorAll('.readmore-container').forEach(function(container) {
      let button = container.querySelector('button');
      let body = container.querySelector('.readmore-container--body');
      let collapse = container.querySelector('.readmore-container--collapse');

      button.addEventListener('click', function(event) {
        collapse.style.maxHeight = (body.offsetHeight + 1) + 'px'; // + 1px damit es bei halben Pixeln nicht kleiner wird
        container.classList.add('readmore-container-open');

        setTimeout(function() {
          collapse.style.maxHeight = body.offsetHeight + 'px';
        }, 0);

        setTimeout(function() {
          container.classList.add('readmore-container-opened');
          container.classList.remove('readmore-container-open');
          collapse.removeAttribute('style');
        }, 350);

        event.preventDefault();
      });
    });
  });
})();
