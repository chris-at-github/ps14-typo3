(function () {
  'use strict';

  // Wir suchen alle H3 innerhalb des spezifischen Containers
  const container = document.querySelector('.product--technical-data .accordion--container');

  if(container === null) {
    return;
  }

  const headings = container.querySelectorAll('h3');

  headings.forEach(h3 => {

    // 1. Erstelle den Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'accordion--container-section'; // Deine Wunschklasse

    // 2. Platziere den Wrapper genau dort, wo die H3 gerade ist
    h3.parentNode.insertBefore(wrapper, h3);

    // 3. Verschiebe die H3 in den Wrapper
    wrapper.appendChild(h3);

    // 4. Prüfe die nachfolgenden Geschwister-Elemente
    // Da die H3 jetzt im Wrapper ist, müssen wir schauen,
    // was im ursprünglichen Parent an der Stelle des Wrappers folgt.
    let nextNode = wrapper.nextElementSibling;

    while (nextNode && nextNode.tagName === 'FIGURE' && nextNode.classList.contains('table')) {
      // Wir merken uns das nächste Element, bevor wir das aktuelle verschieben
      let elementToMove = nextNode;
      nextNode = nextNode.nextElementSibling;

      // Verschiebe die Tabelle in den Wrapper
      wrapper.appendChild(elementToMove);
    }
  });
})();
