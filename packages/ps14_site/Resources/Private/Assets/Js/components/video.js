// No Scroll Kompontente fuer das Ausblenden der Scrollbars auf dem Body Element
// Feuert die Events scrolllock.activate und scrolllock.deactivate mit der entsprechenden Scrollbar-Breite und hoert auf das
// Event noScrollToggle um das Verhalten von ausserhalb zu steuern
(function () {
  'use strict';

  xna.on('documentLoaded', function() {
    document.querySelectorAll('.video').forEach(function(container) {
      const player = container.querySelector('.video__source');
      const playButton = container.querySelector('.video__play-button');

      let playerInitialized = false;

      player.addEventListener('click', () => {
        if(player.hasAttribute('controls') === false) {
          if(player.paused === true) {
            player.play();
          } else {
            player.pause();
          }
        }
      });

      if(playButton !== null) {
        playButton.addEventListener('click', () => {
          if(player.paused === true) {
            player.play();
          } else {
            player.pause();
          }
        });
      }

      player.addEventListener('canplay', function resetOnload() {
        player.currentTime = 0;
        player.removeEventListener('canplay', resetOnload); // Eventlistener entfernen, um Mehrfachaufrufe zu vermeiden
      });

      player.addEventListener('play', () => {
        container.classList.add('video--played');
        container.classList.remove('video--paused');

        if(playerInitialized === false) {
          playerInitialized = true;
          player.currentTime = 0;
        }

        if(container.classList.contains('video--preview-image')) {
          container.classList.remove('video--preview-image');
        }
      });

      player.addEventListener('pause', () => {
        container.classList.add('video--paused');
        container.classList.remove('video--played');
      });

      // Autoplay (stumm) startet oft, bevor dieses Modul geladen ist: das Play-Event ist dann schon vorbei
      if(player.paused === false) {
        player.dispatchEvent(new Event('play'));
      }
    });
  });
})();
