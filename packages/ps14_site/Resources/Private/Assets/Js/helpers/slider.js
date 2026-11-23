/**
 * CSS Lazyload durch setzen der Klasse slider--initialized
 *
 * @param {Element} node
 */
xna.addSliderInitializedClass = function(node) {
  node.querySelector('.slider').classList.add('slider--initialized');
};

/**
 * Focus auf Kindelemente bereinigen
 *
 * @param {Element} node
 * @param {Object} slider
 */
xna.fixFocusInSlider = function(node, slider) {
  node.querySelectorAll('.tns-item').forEach(function(item) {

    // Focus auf geklonte Eintraege verhindern
    if(item.classList.contains('tns-slide-cloned') === true) {
      item.querySelectorAll('a, button').forEach(function(element) {
        element.setAttribute('tabindex', '-1');
      });
    } else {
      item.removeAttribute('aria-hidden');
    }

    // Beim Fokusieren eines Links / Buttons innerhalb eines Eintrags immer zu diesem Eintrag springen
    item.querySelectorAll('a, button').forEach(function(element) {
      element.addEventListener('focus', function() {
        slider.goTo(item.getAttribute('data-index'));
      });
    });
  });
};

/**
 * Aria Attribute in den Controls bereinigen
 *
 * @param {Element} node
 * @param {Element} controls
 */
xna.fixSliderControls = function(node, controls) {
  if(controls !== null) {
    controls.removeAttribute('tabindex');
    controls.removeAttribute('aria-label');
  }
};

/**
 * Aria Attribute in der Navigation bereinigen
 *
 * @param {Element} node
 * @param {Element} navigation
 */
xna.fixSliderNavigation = function(node, navigation) {
  // Slider Navigation wieder fixen
  if(navigation !== null) {
    navigation.querySelector('ul').removeAttribute('aria-label');

    navigation.querySelectorAll('li').forEach(function(item) {
      item.removeAttribute('aria-label');
    });
  }
};

/**
 * Aria Attribute in der Navigation bereinigen
 *
 * @param {Element} node
 * @param {Element} container
 */
xna.fixSliderSliderHeight = function(node, container) {
  let maxHeight = 0;
  node.querySelectorAll('.tns-item').forEach(function(item) {
    if(item.offsetHeight > maxHeight) {
      maxHeight = item.offsetHeight;
      container.style.minHeight = item.offsetHeight + 'px';
    }
  });
};
