(function () {
  'use strict';

  xna.on('documentLoaded', function() {
    let container = document.querySelector('.search--form-keyword-container'),
      field = document.querySelector('.search--form-keyword'),
      close = document.querySelector('.search--form-keyword-reset');

    document.addEventListener('search.typein', function() {
      if(field.value !== '') {
        container.classList.add('is--search-keyword');
        close.setAttribute('aria-hidden', 'false');

      } else {
        container.classList.remove('is--search-keyword');
        close.setAttribute('aria-hidden', 'true');
      }
    });

    // 1. beim Seiten laden
    xna.fireEvent('search.typein');

    // 2. beim Tippen
    field.addEventListener('keyup', function() {
      xna.fireEvent('search.typein');
    });

    // 3. Aendern z.B. Paste
    field.addEventListener('change', function() {
      xna.fireEvent('search.typein');
    });
  });
})();
