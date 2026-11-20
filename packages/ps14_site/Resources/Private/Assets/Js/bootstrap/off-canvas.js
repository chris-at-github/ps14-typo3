import { OffCanvas } from '../components/off-canvas.js';

const instances = [];

// Das SCSS schaltet das Off-Canvas je Element ein (--off-canvas-enabled: 1, z. B. unterhalb eines Breakpoints).
// So steht der Breakpoint nur im SCSS.
function isEnabled(element) {
  return getComputedStyle(element).getPropertyValue('--off-canvas-enabled').trim() === '1';
}

function handleBreakpoint() {
  instances.forEach((instance) => {
    if (isEnabled(instance.element) === true) {
      instance.initialize();
    } else {
      instance.destroy();
    }
  });
}

document.querySelectorAll('.off-canvas').forEach((element) => {
  const options = {};

  // Die Texte kommen übersetzt aus dem Fluid-Template (data-label-open, data-label-close).
  if (element.dataset.labelOpen !== undefined) {
    options.ariaLabelOpen = element.dataset.labelOpen;
  }

  if (element.dataset.labelClose !== undefined) {
    options.ariaLabelClose = element.dataset.labelClose;
  }

  instances.push(new OffCanvas(element, options));
});

handleBreakpoint();

window.addEventListener('resize', handleBreakpoint);
