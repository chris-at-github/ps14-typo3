import { MainMenu } from '../components/main-menu.js';

document.querySelectorAll('.main-menu').forEach((element) => {
  const instance = new MainMenu(element);
  const offCanvas = element.closest('.off-canvas');

  if (offCanvas === null) {
    return;
  }

  // Schließt sich das Off-Canvas oder wechselt die Ansicht (Off-Canvas ↔ Desktop), ist die zweite Ebene wieder zu.
  ['off-canvas.deactivated', 'off-canvas.initialize', 'off-canvas.destroy'].forEach((type) => {
    offCanvas.addEventListener(type, () => instance.close(false));
  });
});
