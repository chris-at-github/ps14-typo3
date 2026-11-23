// No Scroll Kompontente fuer das Ausblenden der Scrollbars auf dem Body Element
// Feuert die Events scrolllock.activate und scrolllock.deactivate mit der entsprechenden Scrollbar-Breite und hoert auf das
// Event noScrollToggle um das Verhalten von ausserhalb zu steuern
(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    document.addEventListener('scrolllock.toggle', function() {

      // Breite der Scrollbars ausrechnen
      let scrollbarWidth = window.innerWidth - document.body.clientWidth;

      if(document.body.classList.contains('is--scroll-lock') === true) {
        document.body.classList.remove('is--scroll-lock');
        xna.fireEvent('scrolllock.deactivate');

      } else {
        document.body.classList.add('is--scroll-lock');
        xna.fireEvent('scrolllock.activate', { scrollbarWidth: scrollbarWidth });
      }
    });

    // bestehende Padding auslesen und Scrollbar-Breite auf alle Container addieren
    document.addEventListener('scrolllock.activate', function(event) {
      document.querySelectorAll('.container-outer, .ce-frame--outer').forEach(function(node) {
        node.style.paddingRight = event.detail.scrollbarWidth + parseInt(xna.getCssProperty(node, 'padding-right')) + 'px';
      });
    });

    // gesetzte Paddings (per Style-Attribute) entfernen
    document.addEventListener('scrolllock.deactivate', function() {
      document.querySelectorAll('.container-outer, .ce-frame--outer').forEach(function(node) {
        node.removeAttribute('style');
      });
    });
  });
})();
