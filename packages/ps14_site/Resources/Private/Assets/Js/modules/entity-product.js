(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    // -----------------------------------------------------------------------------------------------------------------
    // Filter Ein- und Ausblenden Modal (Mobile)

    // Filter im Modal anzeigen
    document.addEventListener('filterModalOpen', function(event) {

      // Scrollbars ausblenden
      xna.fireEvent('scrolllock.toggle');

      // Modal-Klasse auf dem Body
      document.body.classList.add('is--modal-open');

      // Modal oeffnen
      MicroModal.show(event.detail.modalIdentifier, {
        onShow: function() {

          // // bei langen Modals immer ganz nach oben scrollen
          // modal.scrollTop = 0;
        },
        onClose: function() {
          xna.fireEvent('filterModalClosing');
        }
      });
    });

    // Modal fuer Filter ausblenden
    document.addEventListener('filterModalClosing', function() {

      // Dokumenten-Klasse
      document.body.classList.add('is--modal-closing');
      document.body.classList.remove('is--modal-open');

      // Scrollbars einblenden
      xna.fireEvent('scrolllock.toggle');

      // zu den Produkten scrollen
      let position = xna.getElementPosition(document.querySelector('.product-listing').closest('.ce-frame'));
      xna.scrollTo(position.y, 50);

      setTimeout(function() {
        xna.fireEvent('filterModalClose');
      }, 350);
    });

    // Modal fuer Filter geschlossen
    document.addEventListener('filterModalClose', function() {

      // Dokumenten-Klasse
      document.body.classList.remove('is--modal-closing');
    });

    if(document.querySelector('.product-listing--filter-modal') !== null) {
      MicroModal.init();

      document.querySelector('.product-listing--filter-modal .modal--close').addEventListener('click', function(event) {
        xna.fireEvent('filterModalClosing');
        event.preventDefault();
      });

      document.querySelector('.product-listing--filter-modal--switch').addEventListener('click', function() {
        xna.fireEvent('filterModalOpen', {modalIdentifier: this.getAttribute('aria-controls')});
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Filter Ein- und Ausblenden (Desktop)
    if(document.querySelector('.product-listing--off-canvas--switch') !== null) {
      let button = document.querySelector('.product-listing--off-canvas--switch');
      let offCanvas = document.querySelector('.product-listing--off-canvas');
      let listing = document.querySelector('.product-listing');

      button.addEventListener('click', function() {
        if(listing.classList.contains('off-canvas--hidden') === true) {
          listing.classList.remove('off-canvas--hidden');

          setTimeout(function() {
            offCanvas.removeAttribute('style');
            offCanvas.setAttribute('aria-hidden', 'false');

            // Button Beschriftung aendern
            button.querySelector('span').innerText = xna.l10n.entityProduct.hideFilter;
          }, 0);

        } else {
          offCanvas.setAttribute('aria-hidden', 'true');
          offCanvas.style.marginLeft = '-' + offCanvas.offsetWidth + 'px';

          // Button Beschriftung aendern
          button.querySelector('span').innerText = xna.l10n.entityProduct.showFilter;

          setTimeout(function() {
            listing.classList.add('off-canvas--hidden');
          }, 350);
        }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Filter
    if(document.querySelector('.product-listing') !== null) {
      new filter(document.querySelector('.product-listing'), {
        ajax: true,
        pageType: 1548191072,
        containerSelector: '.product-listing--container',
        itemsSelector: '.product-listing--container > li',
        beforeSubmit: function(filter) {
          if(document.body.classList.contains('is--modal-open') === true) {
            xna.fireEvent('filterModalClosing');
          }

          setTimeout(function() {
            document.body.classList.add('is--filter-loading');
          }, 50);

          filter.element.querySelectorAll(filter.options.itemsSelector).forEach(function(item, index) {
            let timeout = 50;

            setTimeout(function() {
              item.classList.add('product-listing--item-out');
            }, (timeout * index));
          });

          return true;
        },
        beforeAutoSubmit: function() {
          if(document.body.classList.contains('is--modal-open') === true) {
            return false;
          }

          return true;
        },
        afterSubmit: function(filter) {
          filter.element.querySelectorAll(filter.options.itemsSelector).forEach(function(item, index) {
            let timeout = 50;

            document.body.classList.remove('is--filter-loading');
            item.classList.add('product-listing--item-add');

            setTimeout(function() {
              item.classList.add('product-listing--item-in');

              setTimeout(function() {
                item.classList.remove('product-listing--item-add');
                item.classList.remove('product-listing--item-in');
              }, 500);
            }, (timeout * index));
          });
        }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Lightbox (Technische Zeichnungen
    if(typeof(Tobii) === 'function') {
      document.querySelectorAll('.product--technical-drawings').forEach(function() {
        // let uid = node.getAttribute('id');
        // let isLightbox = parseInt(node.querySelector('.gallery').getAttribute('data-gallery-lightbox'));
        //
        // if(isLightbox === 1) {
          new Tobii({
            theme: 'tobii--theme-technical-drawing',
            selector: '.product--technical-drawing',
            captionsSelector: 'self',
            captionAttribute: 'data-title',
            counter: false,
            zoom: false,
            nav: true,
            navText: [
              '<svg viewBox="0 0 14 26" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path d="M2409.21,319.078L2398.69,308.185C2398.6,308.089 2398.55,307.961 2398.55,307.829C2398.55,307.696 2398.61,307.57 2398.7,307.478C2399,307.192 2399.41,306.79 2399.71,306.505C2399.8,306.413 2399.93,306.363 2400.06,306.365C2400.2,306.367 2400.32,306.422 2400.41,306.517C2402.21,308.373 2410.39,316.852 2412.19,318.708C2412.22,318.738 2412.24,318.772 2412.26,318.808C2412.31,318.887 2412.34,318.979 2412.35,319.075C2412.35,319.207 2412.3,319.335 2412.2,319.431C2410.41,321.288 2402.21,329.781 2400.41,331.639C2400.32,331.734 2400.2,331.789 2400.06,331.792C2399.93,331.794 2399.8,331.743 2399.71,331.651C2399.41,331.366 2399,330.964 2398.7,330.679C2398.61,330.587 2398.55,330.46 2398.55,330.328C2398.55,330.195 2398.6,330.067 2398.69,329.972L2409.21,319.078Z" transform="matrix(1,0,0,1,-2398.55,-306.365) matrix(1.74986,0,0,6.51121,1937.51,-2327.46) matrix(-0.571475,0,0,0.153581,1642.07,357.454)"/></svg>',
              '<svg viewBox="0 0 14 26" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"><path d="M2409.21,319.078L2398.69,308.185C2398.6,308.089 2398.55,307.961 2398.55,307.829C2398.55,307.696 2398.61,307.57 2398.7,307.478C2399,307.192 2399.41,306.79 2399.71,306.505C2399.8,306.413 2399.93,306.363 2400.06,306.365C2400.2,306.367 2400.32,306.422 2400.41,306.517C2402.21,308.373 2410.39,316.852 2412.19,318.708C2412.22,318.738 2412.24,318.772 2412.26,318.808C2412.31,318.887 2412.34,318.979 2412.35,319.075C2412.35,319.207 2412.3,319.335 2412.2,319.431C2410.41,321.288 2402.21,329.781 2400.41,331.639C2400.32,331.734 2400.2,331.789 2400.06,331.792C2399.93,331.794 2399.8,331.743 2399.71,331.651C2399.41,331.366 2399,330.964 2398.7,330.679C2398.61,330.587 2398.55,330.46 2398.55,330.328C2398.55,330.195 2398.6,330.067 2398.69,329.972L2409.21,319.078Z" transform="matrix(1,0,0,1,-2398.55,-306.365) matrix(1.74986,0,0,6.51121,1937.51,-2327.46) matrix(0.571475,0,0,0.153581,-1107.24,357.454)"/></svg>'
            ],
            navLabel: [xna.l10n.technicalData.prev, xna.l10n.technicalData.next],
            closeText: '<svg viewBox="0 0 55 55" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" fill="#2d808d"><path d="M236.9,511.532L213.671,488.302C213.296,487.927 213.085,487.418 213.085,486.888C213.085,486.358 213.296,485.849 213.671,485.474C213.876,485.269 214.087,485.057 214.293,484.852C214.668,484.477 215.176,484.266 215.707,484.266C216.237,484.266 216.746,484.477 217.121,484.852L240.351,508.082L263.58,484.852C263.955,484.477 264.464,484.266 264.994,484.266C265.525,484.266 266.033,484.477 266.409,484.852C266.62,485.064 266.838,485.282 267.05,485.493C267.425,485.868 267.635,486.377 267.635,486.907C267.635,487.438 267.425,487.947 267.05,488.322L243.82,511.551L267.05,534.781C267.425,535.156 267.635,535.664 267.635,536.195C267.635,536.725 267.425,537.234 267.05,537.609C266.844,537.814 266.633,538.026 266.428,538.231C266.053,538.606 265.544,538.817 265.014,538.817C264.483,538.817 263.974,538.606 263.599,538.231L240.37,515.001L217.121,538.25C216.746,538.625 216.237,538.836 215.707,538.836C215.176,538.836 214.668,538.625 214.293,538.25C214.081,538.039 213.863,537.821 213.652,537.609C213.276,537.234 213.066,536.725 213.066,536.195C213.066,535.664 213.276,535.156 213.652,534.781L236.9,511.532Z" transform="matrix(1,0,0,1,-213.066,-484.266) matrix(1.22563,0,0,2.33454,-412.985,-1691.65) matrix(0.815904,0,0,0.42835,336.956,724.618)"/></svg>',
            closeLabel: xna.l10n.technicalData.close,
            autoplayVideo: true
          });
        // }
      });
    }

    // -----------------------------------------------------------------------------------------------------------------
    // Air Consumption Fallback
    if(document.querySelector('.product--air-consumption-fallback') !== null) {
      setTimeout(function() {
        const chartFallbackContainer = document.querySelector('.product--air-consumption-fallback');
        const chartFallbackCanvas = chartFallbackContainer.querySelector('canvas');
        const chartFallbackObject = Chart.getChart(chartFallbackCanvas);
        const chartFallbackData = chartFallbackContainer.querySelector('.product--air-consumption-fallback-data');
        const chartFallbackForm = chartFallbackContainer.querySelector('form');

        // nur bei voller Groesse und geaenderten Daten aktualisieren
        if(typeof(chartFallbackObject) !== 'undefined' && chartFallbackCanvas.offsetWidth >= 750 && chartFallbackCanvas.offsetHeight >= 425) {
          chartFallbackObject.update('none'); // Chart mit Daten zeichnen (ohne Animation)

          if(chartFallbackData.value !== chartFallbackCanvas.toDataURL()) {

            // Daten neu setzen
            setTimeout(function() {
              chartFallbackData.value = chartFallbackCanvas.toDataURL();

              // Daten versenden
              let data = new FormData(chartFallbackForm);
              let uri = chartFallbackForm.getAttribute('action');

              fetch(uri, {
                body: data,
                method: 'post',
              });
            }, 1000);
          }
        }
      }, 500);
    }
  });
})();
