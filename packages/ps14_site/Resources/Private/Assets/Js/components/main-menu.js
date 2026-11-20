import { getTransitionDuration } from '../utilities/transition.js';

export class MainMenu {
  constructor(element, options = {}) {
    this.element = element;
    this.entries = [];
    this.active = null;
    this.options = Object.assign({
      durationCssVariable: '--main-menu-transition-duration',
      activateCssClass: 'is--activate',
      activeCssClass: 'is--active',
      deactivateCssClass: 'is--deactivate',
      // Startframe der zweiten Ebene: Das SCSS legt ihn je Ansicht fest (Dropdown bzw. von rechts einfahren).
      closedTranslate: 'var(--main-menu-closed-translate)',
      closedOpacity: 'var(--main-menu-closed-opacity)',
      focusableSelector: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    }, options);

    // Je Eintrag mit zweiter Ebene: Button, Container und Zurück-Button.
    element.querySelectorAll('.main-menu__item').forEach((item) => {
      const toggle = item.querySelector('.main-menu__toggle');
      const container = item.querySelector('.main-menu__container');

      if (toggle === null || container === null) {
        return;
      }

      const entry = {item, toggle, container, back: container.querySelector('.main-menu__back'), timer: null};

      this.entries.push(entry);

      toggle.addEventListener('click', () => this.handleToggle(entry));

      if (entry.back !== null) {
        entry.back.addEventListener('click', () => this.handleBack(entry));
      }
    });

    if (this.entries.length === 0) {
      return;
    }

    this.element.addEventListener('keydown', (event) => this.handleKeydown(event));
    this.element.addEventListener('focusout', (event) => this.handleFocusout(event));
    document.addEventListener('click', (event) => this.handleDocumentClick(event));
  }

  handleToggle(entry) {
    if (this.isActive(entry) === true) {
      this.deactivate(entry);
    } else {
      this.activate(entry);
    }
  }

  handleBack(entry) {
    this.deactivate(entry);
    entry.toggle.focus();
  }

  handleKeydown(event) {
    const entry = this.active;

    if (entry === null) {
      return;
    }

    if (event.key === 'Escape') {
      // preventDefault: Ein umschließendes Off-Canvas bleibt offen, es schließt sich nur die zweite Ebene.
      event.preventDefault();
      this.deactivate(entry);
      entry.toggle.focus();
    } else if (event.key === 'Tab' && this.isPanel(entry) === true) {
      this.trapFocus(event, entry);
    }
  }

  // Dropdown: Verlässt der Fokus den Eintrag, schließt sich die zweite Ebene.
  handleFocusout(event) {
    const entry = this.active;

    if (entry === null || this.isPanel(entry) === true) {
      return;
    }

    if (event.relatedTarget === null || entry.item.contains(event.relatedTarget) === true) {
      return;
    }

    this.deactivate(entry);
  }

  handleDocumentClick(event) {
    const entry = this.active;

    if (entry === null || entry.item.contains(event.target) === true) {
      return;
    }

    this.deactivate(entry);
  }

  isActive(entry) {
    return entry.item.classList.contains(this.options.activeCssClass)
      || entry.item.classList.contains(this.options.activateCssClass);
  }

  // Die zweite Ebene überdeckt die erste (Off-Canvas), sobald der Zurück-Button sichtbar ist. Sonst ist sie ein Dropdown.
  isPanel(entry) {
    return entry.back !== null && entry.back.checkVisibility() === true;
  }

  getDuration() {
    return getTransitionDuration(this.element, this.options.durationCssVariable);
  }

  getFocusable(container) {
    return Array.from(container.querySelectorAll(this.options.focusableSelector))
      .filter((element) => element.checkVisibility({visibilityProperty: true}) === true);
  }

  // Schließt die geöffnete zweite Ebene, z. B. wenn sich das umschließende Off-Canvas schließt.
  close(animate = true) {
    if (this.active !== null) {
      this.deactivate(this.active, animate);
    }
  }

  activate(entry, animate = true) {
    clearTimeout(entry.timer);

    // Es ist immer nur eine zweite Ebene geöffnet.
    if (this.active !== null && this.active !== entry) {
      this.deactivate(this.active);
    }

    this.active = entry;

    // Startframe: geschlossen der Wert aus dem SCSS, sonst der aktuelle Wert (Abbruch einer laufenden Animation).
    const closed = entry.container.hasAttribute('hidden');

    entry.container.removeAttribute('hidden');

    const style = getComputedStyle(entry.container);

    entry.container.style.translate = closed === true ? this.options.closedTranslate : style.translate;
    entry.container.style.opacity = closed === true ? this.options.closedOpacity : style.opacity;

    entry.item.classList.remove(this.options.deactivateCssClass);
    entry.toggle.setAttribute('aria-expanded', 'true');

    if (animate === false) {
      this.activated(entry);

      return;
    }

    entry.item.classList.add(this.options.activateCssClass);

    // Reflow erzwingen, damit der Zielwert animiert wird.
    void entry.container.offsetHeight;

    entry.container.style.translate = '0px 0px';
    entry.container.style.opacity = '1';
    entry.timer = setTimeout(() => this.activated(entry), this.getDuration());

    // Off-Canvas: Der Fokus wandert auf den Zurück-Button. Im Dropdown ist er ausgeblendet, der Fokus bleibt am Button.
    if (entry.back !== null) {
      entry.back.focus();
    }

    this.element.dispatchEvent(new CustomEvent('main-menu.activate', {detail: {toggle: entry.toggle, container: entry.container}}));
  }

  activated(entry) {
    entry.container.style.removeProperty('translate');
    entry.container.style.removeProperty('opacity');
    entry.item.classList.remove(this.options.activateCssClass);
    entry.item.classList.add(this.options.activeCssClass);
    this.element.classList.add(this.options.activeCssClass);

    this.element.dispatchEvent(new CustomEvent('main-menu.activated', {detail: {toggle: entry.toggle, container: entry.container}}));
  }

  deactivate(entry, animate = true) {
    if (entry.container.hasAttribute('hidden') === true) {
      return;
    }

    clearTimeout(entry.timer);

    if (this.active === entry) {
      this.active = null;
    }

    const style = getComputedStyle(entry.container);

    entry.container.style.translate = style.translate === 'none' ? '0px 0px' : style.translate;
    entry.container.style.opacity = style.opacity;

    entry.item.classList.remove(this.options.activeCssClass, this.options.activateCssClass);
    entry.item.classList.add(this.options.deactivateCssClass);
    this.element.classList.remove(this.options.activeCssClass);
    entry.toggle.setAttribute('aria-expanded', 'false');

    if (animate === false) {
      this.deactivated(entry);

      return;
    }

    void entry.container.offsetHeight;

    entry.container.style.translate = this.options.closedTranslate;
    entry.container.style.opacity = this.options.closedOpacity;
    entry.timer = setTimeout(() => this.deactivated(entry), this.getDuration());

    this.element.dispatchEvent(new CustomEvent('main-menu.deactivate', {detail: {toggle: entry.toggle, container: entry.container}}));
  }

  deactivated(entry) {
    entry.container.style.removeProperty('translate');
    entry.container.style.removeProperty('opacity');
    entry.item.classList.remove(this.options.deactivateCssClass);
    entry.container.setAttribute('hidden', '');

    this.element.dispatchEvent(new CustomEvent('main-menu.deactivated', {detail: {toggle: entry.toggle, container: entry.container}}));
  }

  // Off-Canvas: Die zweite Ebene überdeckt die erste, der Fokus bleibt deshalb in der zweiten Ebene.
  trapFocus(event, entry) {
    const focusable = this.getFocusable(entry.container);

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (entry.container.contains(document.activeElement) === false) {
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
}
