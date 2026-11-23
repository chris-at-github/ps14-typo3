(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    document.querySelectorAll('table').forEach(function(table) {
      if(table.getAttribute('data-table-scroll') !== null && table.getAttribute('data-table-scroll') === 'disabled') {
        return;
      }

      let container = document.createElement('div');
        container.setAttribute('class', 'table--container');

      let fixedTable = table.cloneNode(true);
      let fixedContainer = document.createElement('div');
        fixedContainer.setAttribute('class', 'table--fixed-container');
        fixedContainer.setAttribute('aria-hidden', 'true');
        fixedContainer.appendChild(fixedTable);

      // Alle Elemente in der geclonten Tabelle mit Focus auf tabindex=-1	setzen
      fixedContainer.querySelectorAll('a, button').forEach(function(node) {
        node.setAttribute('tabindex', '-1');
      });

      let scrollContainer = document.createElement('div');
        scrollContainer.setAttribute('class', 'table--scroll-container');

      // Container im DOM registrieren
      table.parentNode.insertBefore(container, table);

      // Elemente dem Container hinzufuegen
      container.appendChild(scrollContainer);
      container.appendChild(fixedContainer);
      scrollContainer.appendChild(table);

      // Drag auf der Tabelle ermoeglichen
      let isDragEnabled = false;
      let dragOffsetX = 0;
      let dragScrollX = 0;

      let onDragStart = function(event) {
        isDragEnabled = true;
        dragScrollX = scrollContainer.scrollLeft;

        if(event.type === 'touchstart') {
          dragOffsetX = event.targetTouches[0].pageX;

        } else if(event.type === 'mousedown') {
          dragOffsetX = event.offsetX;
        }
      };

      let onDragMove = function(event) {
        if(isDragEnabled === true) {
          if(event.type === 'touchmove') {
            scrollContainer.scrollLeft = dragScrollX - (event.targetTouches[0].pageX - dragOffsetX);

          } else if(event.type === 'mousemove') {
            scrollContainer.scrollLeft = dragScrollX - (event.offsetX - dragOffsetX);
          }
        }
      };

      let onDragEnd = function() {
        isDragEnabled = false;
      };

      // DargStart
      fixedContainer.addEventListener('mousedown', onDragStart, true);
      fixedContainer.addEventListener('touchstart', onDragStart, true);

      // DargMove
      fixedContainer.addEventListener('mousemove', onDragMove, true);
      fixedContainer.addEventListener('touchmove', onDragMove, true);

      // DargEnd
      fixedContainer.addEventListener('mouseup', onDragEnd, true);
      fixedContainer.addEventListener('touchend', onDragEnd, true);
    });
  });
})();
