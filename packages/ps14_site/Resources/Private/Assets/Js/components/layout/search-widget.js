(function () {
  'use strict';

  xna.on('documentLoaded', function() {
    let bodyClass = 'is--search-widget',
      container = document.querySelector('.search-widget--field'),
      trigger = document.querySelector('.search-widget--link'),
      field = document.querySelector('.search-widget--keyword'),
      close = document.querySelector('.search-widget--close');

    // Absicherung wenn im Template der Header ausgeblendet ist
    if(container === null || trigger === null || field === null || close === null) {
      return;
    }

    document.addEventListener('searchWidgetActivate', function() {
      document.body.classList.add(bodyClass);

      // Trigger als geoeffnet markieren
      trigger.setAttribute('aria-expanded', 'true');

      // Focus auf Elemente ermoeglichen
      container.querySelectorAll('button, input').forEach(function(node) {
        node.setAttribute('tabindex', '0');
      });

      // Focus auf Inputfeld setzen
      field.focus();
    });

    document.addEventListener('searchWidgetDeactivate', function() {
      document.body.classList.remove(bodyClass);

      // Trigger als geschlossen markieren
      trigger.setAttribute('aria-expanded', 'false');

      // Focus auf Elemente verhindern
      container.querySelectorAll('button, input').forEach(function(node) {
        node.setAttribute('tabindex', '-1');
      });
    });

    trigger.addEventListener('click', function(event) {
      if(document.body.classList.contains(bodyClass) === false) {
        xna.fireEvent('searchWidgetActivate');
      }

      event.preventDefault();
    });

    close.addEventListener('click', function(event) {
      xna.fireEvent('searchWidgetDeactivate');
      event.preventDefault();
    });

    // bei ESC schliessen
    document.addEventListener('keydown', function(event) {
      if(event.code === 'Escape' && document.body.classList.contains(bodyClass) === true) {
        xna.fireEvent('searchWidgetDeactivate');
      }
    });

    // Focus nicht mehr im Such-Widget
    document.addEventListener('keyup', function(event) {
      if(event.code === 'Tab' && container.contains(event.target) === false) {
        xna.fireEvent('searchWidgetDeactivate');
      }
    });
  });
})();
