// Der Header ist immer fixiert. Sobald die Seite gescrollt ist, erhält er den Modifier page-header--sticky
// (abschließende Linie, siehe layout/_header.scss).
const header = document.querySelector('.page-header');

if (header !== null) {
  let ticking = false;

  const update = () => {
    header.classList.toggle('page-header--sticky', window.scrollY > 0);
    ticking = false;
  };

  update();

  window.addEventListener('scroll', () => {
    if (ticking === true) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(update);
  }, {passive: true});
}
