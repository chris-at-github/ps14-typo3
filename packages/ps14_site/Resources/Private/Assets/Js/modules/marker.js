(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    // Slider
    if(typeof(tns) === 'function') {

      document.querySelectorAll('.marker--layout-image-aside-slider').forEach(function(node) {

        // Controls | Navigation anzeigen
        let container = node.querySelector('.marker--legend-slider');
        let navigation = node.querySelector('.slider--navigation .slider--navigation-inner');

        tns({
          container: container,
          mode: 'gallery',
          center: false,
          loop: false,
          // autoWidth: false,
          items: 1,
          gutter: 0,
          speed: 1000,
          autoplay: false,
          autoplayTimeout: 6500,
          autoplayButtonOutput: false,
          animateIn: 'tns-fadeIn',
          animateOut: 'tns-fadeOut',
          controls: false,
          nav: true,
          navContainer: navigation.querySelector('ul'),
          onInit: function() {
            xna.addSliderInitializedClass(node);
            xna.fixSliderSliderHeight(node, container);
          }
        });

        window.addEventListener('resize', function() {
          xna.fixSliderSliderHeight(node, container);
        });
      });
    }
  });
})();
