(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    // Slider
    if(typeof(tns) === 'function') {
      document.querySelectorAll('.ce-hero-slider').forEach(function(node) {

        // Event CeHero_BeforeSliderInitialize ausfuehren
        xna.fireEvent('CeHero_BeforeSliderInitialize', {node: node});

        // Controls | Navigation anzeigen
        let controls = node.querySelector('.slider--controls .slider--controls-inner');
        let navigation = node.querySelector('.slider--navigation .slider--navigation-inner');

        let slider = tns({
          container: node.querySelector('.slider--container'),
          mode: 'gallery',
          center: false,
          loop: true,
          autoWidth: false,
          items: 1,
          gutter: 0,
          speed: 1000,
          autoplay: true,
          autoplayTimeout: 6500,
          autoplayButtonOutput: false,
          animateIn: 'tns-fadeIn',
          animateOut: 'tns-fadeOut',
          controls: (controls !== null),
          controlsContainer: controls,
          nav: (navigation !== null),
          navContainer: (navigation !== null ? navigation.querySelector('ul') : false),
          onInit: function() {
            xna.addSliderInitializedClass(node);
            xna.fixFocusInSlider(node, slider);
            xna.fixSliderControls(node, controls);
            xna.fixSliderNavigation(node, navigation);
          }
        });

        // Event CeGallery_AfterSliderInitialize ausfuehren
        xna.fireEvent('CeHero_AfterSliderInitialize', {node: node, slider: slider});
      });
    }

    // bestehende Padding auslesen und Scrollbar-Breite auf alle Container addieren
    document.addEventListener('CeHero_Video_Play_Pause', function(event) {
      let node = event.detail.node;
      let video = node.querySelector('video');

      if(video.paused === true) {
        video.play();

        node.classList.add('hero--video-played');
        node.classList.remove('hero--video-paused');

      } else {
        video.pause();

        node.classList.add('hero--video-paused');
        node.classList.remove('hero--video-played');
      }
    });

    // Video in Hero
    document.querySelectorAll('.hero--video').forEach(function(node) {
      let video = node.querySelector('video');
      let control = node.querySelector('.hero--video-control-play');

      if(video !== null && control !== null) {
        video.addEventListener('click', function(event) {
          xna.fireEvent('CeHero_Video_Play_Pause', {node: node});
          event.preventDefault();
        });

        control.addEventListener('click', function(event) {
          xna.fireEvent('CeHero_Video_Play_Pause', {node: node});
          event.preventDefault();
        });
      }
    });
  });
})();
