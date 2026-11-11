// Liest eine Dauer aus einer CSS-Variable und liefert Millisekunden
// ('250ms' → 250, '0.25s' → 250, nicht gesetzt → 0).
export function getTransitionDuration(element, cssVariable) {
  const value = getComputedStyle(element).getPropertyValue(cssVariable).trim();
  const duration = parseFloat(value);

  if (Number.isNaN(duration) === true) {
    return 0;
  }

  if (value.endsWith('s') === true && value.endsWith('ms') === false) {
    return duration * 1000;
  }

  return duration;
}
