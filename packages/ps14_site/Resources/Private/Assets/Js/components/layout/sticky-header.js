(function () {
  'use strict';

  xna.on('documentLoaded', function() {
    const bodyClass = 'is--sticky-header';

    // Scroll Down|Up
    document.addEventListener('indicateToTopBodyClass', function() {
      if(window.scrollY > 0) {
        document.body.classList.add(bodyClass);

      } else {
        document.body.classList.remove(bodyClass);
      }
    });

    document.addEventListener('scroll', function() {
      xna.fireEvent('indicateToTopBodyClass');
    });

    document.addEventListener('stickyHeaderScrollToElement', function(event) {
      const stickyHeaderOffset= getComputedStyle(document.body).getPropertyValue('--sticky-header--offset');
      const targetElement = document.querySelector(event.detail.targetSelector);

      if(targetElement !== null) {
        setTimeout(function() {
          window.scroll(0, (targetElement.offsetTop - parseInt(stickyHeaderOffset)));
        }, 0);
      }
    });

    xna.fireEvent('indicateToTopBodyClass');

    // Hash aus URL auslesen
    window.addEventListener('load', function() {
      if(window.location.hash !== '') {
        xna.fireEvent('stickyHeaderScrollToElement', { targetSelector: window.location.hash });
      }
    });

    // alle Ankerlinks auf der aktuellen Seite abfangen
    document.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function(event) {
        const href = link.getAttribute('href');

        if(href.indexOf('#') === 0) {
          xna.fireEvent('stickyHeaderScrollToElement', { targetSelector: href });
          event.preventDefault();
        }
      });
    });
  });
})();
