(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    // Modal anzeigen
    document.addEventListener('valuesModalOpen', function(event) {

      let modal = document.getElementById(event.detail.modalIdentifier);

      // Modal einblenden
      modal.setAttribute('aria-hidden', 'false');

      // Scrollbars ausblenden
      xna.fireEvent('scrolllock.toggle');

      // Modal-Klasse auf dem Body
      document.body.classList.add('is--modal-open');
      //

      // Modal oeffnen
      MicroModal.show('ce-kist-values__modal-container', {
        onShow: function() {
        },
        onClose: function() {
          xna.fireEvent('valuesModalClosing');
        }
      });
    });

    // Modal ausblenden
    document.addEventListener('valuesModalClosing', function(event) {

      // Dokumenten-Klasse
      document.body.classList.add('is--modal-closing');
      document.body.classList.remove('is--modal-open');

      // Scrollbars einblenden
      xna.fireEvent('scrolllock.toggle');

      setTimeout(function() {
        xna.fireEvent('valuesModalClose', {modalIdentifier: event.detail.modalIdentifier});
      }, 350);
    });

    // Modal fuer geschlossen
    document.addEventListener('valuesModalClose', function() {

      // Dokumenten-Klasse
      document.body.classList.remove('is--modal-closing');

      let modal = document.querySelector('.ce-kist-values__modal[aria-hidden=false]');

      if(modal !== null) {
        modal.setAttribute('aria-hidden', 'true');
      }
    });

    MicroModal.init();

    document.querySelectorAll('.ce-kist-values__item button').forEach(function(node) {
      node.addEventListener('click', function() {
        xna.fireEvent('valuesModalOpen', {modalIdentifier: this.getAttribute('aria-controls')});
      });
    });

    document.querySelectorAll('.ce-kist-values__modal .modal--close').forEach(function(node) {
      node.addEventListener('click', function(event) {
        xna.fireEvent('valuesModalClosing');
        event.preventDefault();
      });
    });
  });
})();
