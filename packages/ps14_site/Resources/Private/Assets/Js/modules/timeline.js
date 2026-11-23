(function () {
  'use strict';

  xna.on('documentLoaded', function() {
    let getContainerPositionTop = function(container) {
      return (window.scrollY + container.getBoundingClientRect().top) - window.outerHeight;
    }

    let getIndicatorMaxHeight = function(container, items) {
      let indicatorMaxHeight = container.getBoundingClientRect().height;

      // maximal bis zum letzten Element scrollen
      indicatorMaxHeight = indicatorMaxHeight - items[items.length - 1].offsetHeight;

      return indicatorMaxHeight;
    }

    let getItemsPositionTop = function(container, items) {
      let itemsPositionTop = [];

      items.forEach(function(item) {
        itemsPositionTop.push({
          node: item,
          top:  (window.scrollY + item.getBoundingClientRect().top) - window.outerHeight
        });
      });

      return itemsPositionTop;
    }

    document.querySelectorAll('.ce-timeline').forEach(function(node) {

      let offset = 0,
        container = node.querySelector('.ce-history__container'),
        indicator = node.querySelector('.ce-history__indicator'),
        scrollPosition = 0,
        containerScrollPositionBefore = 0,
        ticking = false,
        items = container.querySelectorAll('.ce-history-item');

      // beim Laden im Viewport keine Animation
      node.classList.add('ce-timeline--static');

      if(items.length === 0) {
        return;
      }

      let containerPositionTop = getContainerPositionTop(container);
      let itemsPositionTop = getItemsPositionTop(container, items);
      let indicatorMaxHeight = getIndicatorMaxHeight(container, items);

      let onInitialize = function() {

        // initiale Hoehe berechnen
        scrollPosition = window.scrollY;

        // direkt rendern
        render();

        setTimeout(function() {

          // Offset wieder an Viewport anpassen
          offset = 300;

          // nun wieder animieren wenn die Elemente in den Viewport kommen
          node.classList.remove('ce-timeline--static');
        }, 100);
      }

      let onScrolling = function() {
        scrollPosition = window.scrollY;

        // nur beim runterscrollen rendern
        if(ticking === false) {
          window.requestAnimationFrame(function() {
            if(scrollPosition >= containerPositionTop) {
              render();
            }

            ticking = false;
          });

          ticking = true;
        }
      };

      let onResize = function() {
        if(ticking === false) {
          window.requestAnimationFrame(function() {

            // Positionen und Hoehen neu berechnen
            containerScrollPositionBefore = 0;
            containerPositionTop = getContainerPositionTop(container);
            itemsPositionTop = getItemsPositionTop(container, items);
            indicatorMaxHeight = getIndicatorMaxHeight(container, items);

            // Sichtbarkeit der Eintraege zuruecksetzen
            items.forEach(function(item) {
              item.classList.remove('ce-history-item--visible');
            });

            // Darstellung neu berechnen
            render();

            ticking = false;
          });

          ticking = true;
        }
      };

      let render = function() {
        let containerScrollPosition = (scrollPosition - containerPositionTop) - offset;

        // keine Veraenderungen mehr wenn nach oben gescrollt wird
        if(containerScrollPositionBefore >= containerScrollPosition) {
          return;
        }

        if(containerScrollPosition > indicatorMaxHeight) {
          containerScrollPosition = indicatorMaxHeight;
        }

        if(containerScrollPosition <= indicatorMaxHeight) {
          containerScrollPositionBefore = Math.floor(containerScrollPosition);
          indicator.style.height = Math.floor(containerScrollPosition)  + 'px';
        }

        itemsPositionTop.forEach(function(itemPositionTop) {
          if((scrollPosition - offset) >= itemPositionTop.top) {
            itemPositionTop.node.classList.add('ce-history-item--visible');
          }
        });
      };

      // 1. Aufruf direkt nach dem Laden des DOM
      onInitialize();

      // 2. beim Scrollen
      window.addEventListener('scroll', onScrolling);

      // 3. beim Veraendern der Seitengroesse
      window.addEventListener('resize', onResize);
    });

    // let offset = 300;
    //
    // let node = document.querySelector('.ce-history');
    // let container = node.querySelector('.ce-history__container');
    // let indicator = node.querySelector('.ce-history__indicator');
    //
    // let lastKnownScrollPosition = 0;
    // let ticking = false;
    //
    // let containerTop = (window.scrollY + container.getBoundingClientRect().top) - window.outerHeight;
    // let stepsTop = [];
    //
    // let maxHeight = container.getBoundingClientRect().height;
    //
    // let steps = container.querySelectorAll('li');
    //
    // // maximal bis zum letzten Element scrollen
    // let lastChildHeight = steps[steps.length - 1].offsetHeight;
    // maxHeight = maxHeight - lastChildHeight;
    //
    // steps.forEach(function(step, index) {
    // 	stepsTop.push({
    // 		node: step,
    // 		top:  (window.scrollY + step.getBoundingClientRect().top) - window.outerHeight
    // 	});
    // });
    //
    // let scrollOnContainer = function() {
    // 	let containerScrollPosition = (lastKnownScrollPosition - containerTop) - offset;
    //
    // 	if(containerScrollPosition > maxHeight) {
    // 		containerScrollPosition = maxHeight;
    // 	}
    //
    // 	if(containerScrollPosition <= maxHeight) {
    // 		indicator.style.height = Math.floor(containerScrollPosition)  + 'px';
    // 	}
    //
    // 	stepsTop.forEach(function(stepTop) {
    // 		if((lastKnownScrollPosition- offset) >= stepTop.top) {
    // 			stepTop.node.classList.add('ce-history-item--visible');
    // 		}
    // 	});
    // }

    // window.addEventListener('scroll', function() {
    // 	lastKnownScrollPosition = window.scrollY;
    //
    // 	if(ticking === false) {
    // 		window.requestAnimationFrame(function() {
    // 			if(lastKnownScrollPosition >= containerTop) {
    // 				scrollOnContainer();
    // 			}
    // 			ticking = false;
    // 		});
    //
    // 		ticking = true;
    // 	}
    // });





























    // let offset = 100;
    // let progressHeight = 0;
    // let indicatorHeight = 0;
    // let node = document.querySelector('.ce-history');
    // let indicator = node.querySelector('.indicator');
    // let container = node.querySelector('ul');
    // let watch = node.querySelector('.watch');
    // let maxHeight = container.offsetHeight;
    // let options = {
    // 	threshold: []
    // };
    //
    // for(let i = 0; i <= 1.0; i += 0.1) {
    // 	options.threshold.push(i);
    // }
    // // for (let i=0; i<=1.0; i+= 0.01) {
    // // 	options.threshold.push(i);
    // // }
    //
    // let steps = container.querySelectorAll('li');
    // // steps.forEach(function(step, index) {
    // //
    // // });
    //
    //
    //
    // // maximal bis zum letzten Element scrollen
    // let lastChildHeight = steps[steps.length - 1].offsetHeight;
    // maxHeight = maxHeight - lastChildHeight;
    //
    //
    // let containerObserver = new IntersectionObserver(function(entries) {
    // 	if(typeof(entries[0]) !== 'undefined') {
    // 		let scrollHeight = (Math.floor(entries[0].intersectionRect.height));
    //
    // 		if(scrollHeight >= progressHeight) {
    // 			progressHeight = scrollHeight;
    // 			indicatorHeight = (scrollHeight - offset);
    //
    // 			if(indicatorHeight > maxHeight) {
    // 				indicatorHeight = maxHeight;
    // 			}
    //
    // 			if(indicatorHeight > 0 && indicatorHeight <= maxHeight) {
    // 				indicator.style.height = indicatorHeight  + 'px';
    // 				steps[0].classList.add('active');
    // 			}
    // 		}
    // 	}
    // }, options);
    //
    // containerObserver.observe(watch);
    //
    //
    // let stepObserver = new IntersectionObserver(function(entries, observer) {
    // 	if(typeof(entries[0]) !== 'undefined' && entries[0].isIntersecting === true) {
    //
    // 		if((entries[0].intersectionRect.height - 165) >= 0) {
    // 			console.log((entries[0].intersectionRect.height - offset));
    // 			entries[0].target.classList.add('active');
    // 		}
    // 	}
    // }, {
    // 	threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    // });
    //
    // steps.forEach(function(step, index) {
    // 	stepObserver.observe(step);
    // });
  });
})();
