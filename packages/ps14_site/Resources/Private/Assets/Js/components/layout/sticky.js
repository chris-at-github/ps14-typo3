(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    // Scroll to contact
    if(document.querySelector('.sticky--element-contact') !== null) {
      document.querySelector('.sticky--element-contact .sticky--icon').addEventListener('click', function(event) {
        let node = this;
        let target = node.getAttribute('data-target');

        // Nur wenn das Target-Element auf der Seite vorhanden ist, ansonsten wird der Link ausfuehrt
        if(document.querySelector(target) !== null) {
          let frame = document.querySelector(target).closest('.ce-frame');
          let position = xna.getElementPosition(frame);

          xna.scrollTo(position.y, 250);
          event.preventDefault();
        }
      });
    }

    // Scroll Down|Up
    document.addEventListener('indicateToTopBodyClass', function() {
      let bodyClass = 'is--totop-down';

      if(window.scrollY >= 225) {
        document.body.classList.add(bodyClass);
      } else {
        document.body.classList.remove(bodyClass);
      }
    });

    if(document.querySelector('.sticky--element-totop') !== null) {
      let throttle = false;

      document.querySelector('.sticky--element-totop .sticky--icon').addEventListener('click', function(event) {
        let bodyClass = 'is--totop-down';
        let scrollToY = 0;

        if(document.body.classList.contains(bodyClass) === false) {
          scrollToY = 225;
        }

        xna.scrollTo(scrollToY, 250);
        event.preventDefault();
      });

      document.addEventListener('scroll', function() {
        if(throttle === false) {
          window.requestAnimationFrame(function() {
            xna.fireEvent('indicateToTopBodyClass');
            throttle = false;
          });

          throttle = true;
        }
      });

      xna.fireEvent('indicateToTopBodyClass');
    }

    // document.querySelectorAll('.sticky--element').forEach(function(node, index) {
    // 	let trigger = node.querySelector('.sticky--icon'),
    // 		offCanvas = node.querySelector('.sticky--off-canvas'),
    // 		close = document.querySelector('.sticky--close');
    //
    // 	// Focus auf Elemente im ausgeblendeten Zustand verhindern
    // 	offCanvas.querySelectorAll('button, input, a').forEach(function(node) {
    // 		node.setAttribute('tabindex', '-1');
    // 	});
    //
    // 	// Off-Canvas einblenden
    // 	node.addEventListener('stickyElementActivate', function() {
    // 		node.classList.add('is--active');
    //
    // 		// Off-Canvas als geoeffnet markieren
    // 		offCanvas.setAttribute('aria-hidden', 'false');
    //
    // 		// Focus auf Elemente ermoeglichen
    // 		offCanvas.querySelectorAll('button, input, a').forEach(function(node) {
    // 			node.setAttribute('tabindex', '0');
    // 		});
    // 	});
    //
    // 	// Off-Canvas ausblenden
    // 	node.addEventListener('stickyElementDeactivate', function() {
    // 		node.classList.add('is--closing');
    //
    // 		// Off-Canvas als geoeffnet markieren
    // 		offCanvas.setAttribute('aria-hidden', 'true');
    //
    // 		// Focus auf Elemente ermoeglichen
    // 		offCanvas.querySelectorAll('button, input, a').forEach(function(node) {
    // 			node.setAttribute('tabindex', '-1');
    // 		});
    //
    // 		setTimeout(function() {
    // 			node.classList.remove('is--active');
    // 			node.classList.remove('is--closing');
    // 		}, 350);
    // 	});
    //
    // 	// Switch zum Ein- und Ausblenden (Klick auf den Trigger)
    // 	trigger.addEventListener('click', function(event) {
    // 		if(node.classList.contains('is--active') === false) {
    // 			xna.fireEvent('stickyElementActivate', null, node);
    //
    // 		} else {
    // 			xna.fireEvent('stickyElementDeactivate', null, node);
    // 		}
    //
    // 		event.preventDefault();
    // 	});
    //
    // 	// Schliessen Button
    // 	close.addEventListener('click', function(event) {
    // 		xna.fireEvent('stickyElementDeactivate', null, node);
    // 		event.preventDefault();
    // 	});
    // });
    //
    // // bei ESC schliessen
    // document.addEventListener('keydown', function(event) {
    // 	if(event.code === 'Escape') {
    // 		document.querySelectorAll('.sticky--element.is--active').forEach(function(node) {
    // 			xna.fireEvent('stickyElementDeactivate', null, node);
    // 		});
    // 	}
    // });
    //
    // // Focus nicht mehr im aktiven Sticky Element
    // document.addEventListener('keyup', function(event) {
    // 	if(event.code === 'Tab') {
    // 		document.querySelectorAll('.sticky--element.is--active').forEach(function(node) {
    // 			if(node.contains(event.target) === false) {
    // 				xna.fireEvent('stickyElementDeactivate', null, node);
    // 			}
    // 		});
    // 	}
    // });
    //
    // let bodyClass = 'is--search-widget',
    // 	container = document.querySelector('.search-widget--field'),
    // 	trigger = document.querySelector('.search-widget--link'),
    // 	field = document.querySelector('.search-widget--keyword'),
    // 	close = document.querySelector('.search-widget--close');
    //
    // // Absicherung wenn im Template der Header ausgeblendet ist
    // if(container === null || trigger === null || field === null || close === null) {
    // 	return;
    // }
    //
    // document.addEventListener('searchWidgetActivate', function() {
    // 	document.body.classList.add(bodyClass);
    //
    // 	// Trigger als geoeffnet markieren
    // 	trigger.setAttribute('aria-expanded', 'true');
    //
    // 	// Focus auf Elemente ermoeglichen
    // 	container.querySelectorAll('button, input').forEach(function(node) {
    // 		node.setAttribute('tabindex', '0');
    // 	});
    //
    // 	// Focus auf Inputfeld setzen
    // 	field.focus();
    // });
    //
    // document.addEventListener('searchWidgetDeactivate', function() {
    // 	document.body.classList.remove(bodyClass);
    //
    // 	// Trigger als geschlossen markieren
    // 	trigger.setAttribute('aria-expanded', 'false');
    //
    // 	// Focus auf Elemente verhindern
    // 	container.querySelectorAll('button, input').forEach(function(node) {
    // 		node.setAttribute('tabindex', '-1');
    // 	});
    // });
    //
    // trigger.addEventListener('click', function(event) {
    // 	if(document.body.classList.contains(bodyClass) === false) {
    // 		xna.fireEvent('searchWidgetActivate');
    // 	}
    //
    // 	event.preventDefault();
    // });
    //
    // close.addEventListener('click', function(event) {
    // 	xna.fireEvent('searchWidgetDeactivate');
    // 	event.preventDefault();
    // });
    //
    // // bei ESC schliessen
    // document.addEventListener('keydown', function(event) {
    // 	if(event.code === 'Escape' && document.body.classList.contains(bodyClass) === true) {
    // 		xna.fireEvent('searchWidgetDeactivate');
    // 	}
    // });
    //
    // // Focus nicht mehr im Such-Widget
    // document.addEventListener('keyup', function(event) {
    // 	if(event.code === 'Tab' && container.contains(event.target) === false) {
    // 		xna.fireEvent('searchWidgetDeactivate');
    // 	}
    // });
  });
})();
