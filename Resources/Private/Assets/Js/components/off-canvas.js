import { getTransitionDuration } from '../utilities/transition.js';

export class OffCanvas {
  constructor(element, options = {}) {
    this.element = element;
    this.toggle = element.querySelector('.off-canvas__toggle');
    this.container = element.querySelector('.off-canvas__container');
    this.close = element.querySelector('.off-canvas__close');
    this.backdrop = null;
    this.timer = null;
    this.options = Object.assign({
      durationCssVariable: '--off-canvas-transition-duration',
      initializedCssClass: 'is--initialized',
      activateCssClass: 'is--activate',
      activeCssClass: 'is--active',
      deactivateCssClass: 'is--deactivate',
      backdropCssClass: 'off-canvas__backdrop',
      // Position des geschlossenen Containers: rechts außerhalb des Viewports.
      closedTranslate: '100% 0',
      focusableSelector: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ariaLabelOpen: 'Open',
      ariaLabelClose: 'Close',
    }, options);

    // Als Eigenschaft gebunden, damit destroy() die Listener wieder entfernen kann.
    this._handleToggle = () => this.handleToggle();
    this._handleClose = () => this.handleClose();
    this._handleKeydown = (event) => this.handleKeydown(event);
  }

  initialize() {
    if (this.toggle === null || this.container === null || this.isInitialized() === true) {
      return;
    }

    this.container.setAttribute('hidden', '');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-label', this.options.ariaLabelOpen);

    this.toggle.addEventListener('click', this._handleToggle);
    document.addEventListener('keydown', this._handleKeydown);

    if (this.close !== null) {
      this.close.addEventListener('click', this._handleClose);
    }

    this.element.classList.add(this.options.initializedCssClass);

    this.element.dispatchEvent(new CustomEvent('off-canvas.initialize'));
  }

  // Stellt das ursprüngliche Markup wieder her: Der Inhalt wird wieder ganz normal dargestellt.
  destroy() {
    if (this.isInitialized() === false) {
      return;
    }

    clearTimeout(this.timer);

    this.toggle.removeEventListener('click', this._handleToggle);
    document.removeEventListener('keydown', this._handleKeydown);

    if (this.close !== null) {
      this.close.removeEventListener('click', this._handleClose);
    }

    this.removeBackdrop();

    this.container.style.removeProperty('translate');
    this.container.removeAttribute('hidden');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-label', this.options.ariaLabelOpen);

    this.element.classList.remove(
      this.options.activateCssClass,
      this.options.activeCssClass,
      this.options.deactivateCssClass,
      this.options.initializedCssClass,
    );

    this.element.dispatchEvent(new CustomEvent('off-canvas.destroy'));
  }

  handleToggle() {
    if (this.isActive() === true) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  handleClose() {
    if (this.isActive() === true) {
      this.deactivate();
    }
  }

  handleKeydown(event) {
    // Hat eine Komponente im Off-Canvas die Taste bereits verarbeitet (z. B. das Hauptmenü schließt seine
    // zweite Ebene), bleibt das Off-Canvas unverändert.
    if (this.isActive() === false || event.defaultPrevented === true) {
      return;
    }

    if (event.key === 'Escape') {
      this.deactivate();
    } else if (event.key === 'Tab') {
      this.trapFocus(event);
    }
  }

  isInitialized() {
    return this.element.classList.contains(this.options.initializedCssClass);
  }

  isActive() {
    return this.element.classList.contains(this.options.activeCssClass)
      || this.element.classList.contains(this.options.activateCssClass);
  }

  getDuration() {
    return getTransitionDuration(this.element, this.options.durationCssVariable);
  }

  // Aktuelle Position des Containers, auch mitten in einer laufenden Animation.
  getTranslate() {
    const translate = getComputedStyle(this.container).translate;

    if (translate === 'none') {
      return '0px 0px';
    }

    return translate;
  }

  getFocusable() {
    return Array.from(this.container.querySelectorAll(this.options.focusableSelector))
      .filter((element) => element.checkVisibility({visibilityProperty: true}) === true);
  }

  activate(animate = true) {
    clearTimeout(this.timer);

    // Startframe: geschlossen außerhalb, sonst die aktuelle Position (Abbruch einer laufenden Animation).
    const closed = this.container.hasAttribute('hidden');

    this.container.removeAttribute('hidden');
    this.container.style.translate = closed === true ? this.options.closedTranslate : this.getTranslate();

    this.element.classList.remove(this.options.deactivateCssClass);
    this.toggle.setAttribute('aria-expanded', 'true');
    this.toggle.setAttribute('aria-label', this.options.ariaLabelClose);
    this.createBackdrop();

    if (animate === false) {
      this.activated();

      return;
    }

    this.element.classList.add(this.options.activateCssClass);

    // Reflow erzwingen, damit der Zielwert animiert wird.
    void this.container.offsetHeight;

    this.container.style.translate = '0px 0px';
    this.timer = setTimeout(() => this.activated(), this.getDuration());

    // Der Fokus wandert in das Off-Canvas, der Toggle liegt dahinter.
    if (this.close !== null) {
      this.close.focus();
    }

    this.element.dispatchEvent(new CustomEvent('off-canvas.activate'));
  }

  activated() {
    this.container.style.removeProperty('translate');
    this.element.classList.remove(this.options.activateCssClass);
    this.element.classList.add(this.options.activeCssClass);

    this.element.dispatchEvent(new CustomEvent('off-canvas.activated'));
  }

  deactivate() {
    clearTimeout(this.timer);

    this.container.style.translate = this.getTranslate();

    this.element.classList.remove(this.options.activeCssClass, this.options.activateCssClass);
    this.element.classList.add(this.options.deactivateCssClass);
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-label', this.options.ariaLabelOpen);
    this.removeBackdrop();

    void this.container.offsetHeight;

    this.container.style.translate = this.options.closedTranslate;
    this.timer = setTimeout(() => this.deactivated(), this.getDuration());

    this.toggle.focus();

    this.element.dispatchEvent(new CustomEvent('off-canvas.deactivate'));
  }

  deactivated() {
    this.container.style.removeProperty('translate');
    this.element.classList.remove(this.options.deactivateCssClass);
    this.container.setAttribute('hidden', '');

    this.element.dispatchEvent(new CustomEvent('off-canvas.deactivated'));
  }

  // Der Fokus bleibt im geöffneten Off-Canvas: Tab springt vom letzten zum ersten Element und umgekehrt.
  trapFocus(event) {
    const focusable = this.getFocusable();

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (this.container.contains(document.activeElement) === false) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey === true && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (event.shiftKey === false && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Klick neben das Off-Canvas schließt es.
  createBackdrop() {
    if (this.backdrop !== null) {
      return;
    }

    this.backdrop = document.createElement('div');
    this.backdrop.classList.add(this.options.backdropCssClass);
    this.backdrop.addEventListener('click', this._handleClose);
    this.container.before(this.backdrop);
  }

  removeBackdrop() {
    if (this.backdrop === null) {
      return;
    }

    this.backdrop.removeEventListener('click', this._handleClose);
    this.backdrop.remove();
    this.backdrop = null;
  }
}
