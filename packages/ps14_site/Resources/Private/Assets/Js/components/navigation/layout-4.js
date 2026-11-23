(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    let navigation = {
      isMobileEnabled: function() {
        return document.body.classList.contains('is--off-canvas-active');
      },

      itemExpand: function(item, listItem) {

        // nur wenn es Kind Elemente gibt
        if(listItem.hasAttribute('aria-expanded') === true && listItem.getAttribute('aria-expanded') === 'false') {

          // Backlink und Direktlink einbinden
          navigation.itemBeforeExpand(item, listItem);

          listItem.setAttribute('aria-expanded', 'true');
          listItem.classList.add('navigation-item--in');

          setTimeout(function() {
            listItem.classList.add('navigation-item--active');
            listItem.classList.remove('navigation-item--in');
          }, 10);
        }
      },

      itemReduce: function(item, listItem) {

        // nur wenn es Kind Elemente gibt
        if(listItem.hasAttribute('aria-expanded') === true) {
          listItem.classList.add('navigation-item--out');
          listItem.classList.remove('navigation-item--active');
          listItem.setAttribute('aria-expanded', 'false');

          setTimeout(function() {
            listItem.classList.remove('navigation-item--out');
          }, 350);
        }
      },

      itemBeforeExpand: function(item, parent) {

        // Erstellung Parent Link
        // als erstes -> Zurueck-Link wird ebenfalls an erster Stelle eingefuegt und verdraengt den Link
        if(parent.querySelector('.navigation-item--parentlink') === null) {
          parent.querySelector('ul').insertAdjacentElement('afterbegin', navigation.createParentLink(item, parent));
        }

        // Erstellung Zurueck Link
        if(parent.querySelector('.navigation-item--backlink') === null) {
          parent.querySelector('ul').insertAdjacentElement('afterbegin', navigation.createBackLink(item, parent));
        }
      },

      createBackLink: function(item, parent) {
        let backlink = document.createElement('li'),
          text = document.createElement('button');
        // const svgNs = "http://www.w3.org/2000/svg";
        //
        // const svg = document.createElementNS(svgNs, 'svg');
        // 	svg.setAttribute("height", "200");
        // 	svg.setAttribute('viewBox', '0 0 14 11');
        //
        // const svgPath = document.createElementNS(svgNs, 'path');
        // 	svgPath.setAttribute('d', 'M2633.84,2411.6L2630.8,2408.46C2630.71,2408.37 2630.66,2408.24 2630.66,2408.11C2630.66,2407.97 2630.72,2407.85 2630.81,2407.75C2630.97,2407.6 2631.16,2407.42 2631.32,2407.27C2631.41,2407.18 2631.54,2407.13 2631.67,2407.13C2631.8,2407.13 2631.93,2407.18 2632.02,2407.28C2632.99,2408.28 2635.71,2411.1 2636.68,2412.1C2636.74,2412.16 2636.78,2412.24 2636.8,2412.32C2636.82,2412.37 2636.82,2412.41 2636.82,2412.46C2636.83,2412.6 2636.78,2412.72 2636.68,2412.82C2635.72,2413.82 2632.99,2416.64 2632.02,2417.64C2631.93,2417.74 2631.8,2417.79 2631.67,2417.8C2631.54,2417.8 2631.41,2417.75 2631.32,2417.66C2631.16,2417.5 2630.97,2417.32 2630.81,2417.17C2630.72,2417.08 2630.66,2416.95 2630.66,2416.82C2630.66,2416.69 2630.71,2416.56 2630.8,2416.46L2633.85,2413.3L2623.44,2413.3C2623.17,2413.3 2622.94,2413.08 2622.94,2412.8C2622.94,2412.58 2622.94,2412.33 2622.94,2412.1C2622.94,2411.83 2623.17,2411.6 2623.44,2411.6L2633.84,2411.6Z');
        // 	svgPath.setAttribute('transform', 'matrix(1,0,0,1,-2622.94,-2407.13) matrix(0.75047,0,0,2.79249,2433.3,1277.43) matrix(-1.3325,0,0,0.358103,3766.27,-457.451)');

        backlink.classList.add('navigation-item--backlink');
        backlink.addEventListener('click', function() {
          navigation.itemReduce(backlink, parent);
        });

        text.innerText = xna.l10n.navigation.prev;
        // svg.appendChild(svgPath);
        // text.appendChild(svg);

        backlink.appendChild(text);

        return backlink;
      },

      createParentLink: function(item) {
        let parentlink = document.createElement('li'),
          link = item.cloneNode(true);
          // svg = xna.createSvgUseElement('#sprite-overview', {'viewBox': '0 0 11 12'})

        parentlink.classList.add('navigation-item--parentlink');

        // link.removeChild(link.querySelector('svg'));

        // // nur wenn das Elternelemet ein Link ist
        // if(link.tagName.toLocaleLowerCase() === 'a') {
        // 	link.appendChild(svg);
        // }

        parentlink.appendChild(link);

        return parentlink;
      }
    };

    document.querySelectorAll('.main-navigation').forEach(function(node) {

      // alle Navigationspunkte nach Typ kennzeichen (Direktlink / Unternavigation)
      node.querySelectorAll('li').forEach(function(item) {

        // hat mindestens Unterelement
        if(item.querySelector('ul') !== null) {
          item.classList.add('navigation-item--expandable');
          item.setAttribute('aria-expanded', false);

        } else {
          item.classList.add('navigation-item--link');
        }
      });

      node.querySelectorAll('li > a, li > span').forEach(function(item) {
        let listItem = item.parentElement;
        let active = false;
        let timeout = false;

        // if(listItem.hasAttribute('aria-expanded') === true) {
        // 	let svg = xna.createSvgUseElement('#sprite-chevron-right', {'viewBox': '0 0 6 12'});
        // 	item.appendChild(svg);
        // }

        item.addEventListener('click', function(event) {
          navigation.itemExpand(item, listItem);

          if(listItem.hasAttribute('aria-expanded') === true && navigation.isMobileEnabled() === true) {
            event.preventDefault();
          }
        });

        listItem.addEventListener('mousemove', function() {
          if(active === false && navigation.isMobileEnabled() === false) {
            active = true;
            navigation.itemExpand(item, listItem);
          }
        });

        listItem.addEventListener('mouseleave', function() {
          if(navigation.isMobileEnabled() === false) {
            active = false;
            navigation.itemReduce(item, listItem);
          }
        });

        listItem.addEventListener('focusin', function() {
          if(navigation.isMobileEnabled() === false) {
            timeout = false;
            navigation.itemExpand(item, listItem);
          }
        });

        listItem.addEventListener('focusout', function() {
          timeout = true;

          setTimeout(function() {
            if(timeout === true) {
              // navigation.itemReduce(item, listItem);
            }
          }, 10);
        });
      });
    });
  });
})();
