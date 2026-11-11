---
paths:
  - "packages/*/Resources/Private/Assets/Js/**/*.js"
---

# JavaScript

Aufbau und Ablauf interaktiver Komponenten (z. B. Collapse, Tabs,
Off-Canvas). Das Muster stammt aus dem Projekt USH und ist hier
vereinheitlicht. Die Code-Beispiele zeigen die Komponente `collapse` und
dienen als Vorlage für jede neue Komponente.

## Ordnerstruktur

Basispfad: `packages/ps14_site/Resources/Private/Assets/Js/`

| Pfad | Inhalt |
|---|---|
| `site.js` | Einstiegspunkt (Vite). Importiert nur Dateien aus `bootstrap/`. |
| `bootstrap/` | Aufruf und Initialisierung: sucht die Elemente im DOM, erzeugt die Instanzen und verbindet Komponenten miteinander. Außerdem kleine Skripte ohne eigene Klasse. |
| `components/` | Logik: eine exportierte Klasse je Komponente, ohne DOM-Suche außerhalb des eigenen Elements. |
| `utilities/` | Kleine Hilfsfunktionen, die mehrere Komponenten nutzen (z. B. `transition.js`). |
| `inline/` | Skripte, die inline im `<head>` ausgegeben werden. Kein `import`. |

- Der Dateiname ist der BEM-Block in Kebab-Case und in `bootstrap/` und
  `components/` identisch: `bootstrap/collapse.js`,
  `components/collapse.js`.
- **PFLICHT:** Binde jede neue Datei aus `bootstrap/` sofort in `site.js`
  ein: `import './bootstrap/collapse';`.
- Dateien aus `components/` und `utilities/` werden nie direkt in `site.js`
  importiert.

## Allgemeine Regeln

- Schreibe natives JavaScript als ES-Modul, ohne Framework und ohne jQuery.
- Die Dateien werden als Modul geladen (`type="module"`): Verwende keinen
  IIFE-Wrapper, kein `'use strict'` und kein `DOMContentLoaded`.
- Einrückung mit 2 Leerzeichen (`.editorconfig`), einfache Anführungszeichen,
  Semikolon am Zeilenende.
- Vergleiche explizit: `=== null`, `=== true`, `=== false`.
- Kommentare im Code sind kurz und erklären das Warum, nicht das Was.
- Prüfe den Code mit `ddev exec npm run lint:js`.

## Bootstrap

- Die Datei importiert die Klasse, sucht die Elemente über die Block-Klasse
  und erzeugt je Element eine Instanz.
- Projektspezifische Werte werden als Optionen übergeben. Dazu gehören die
  Texte (z. B. `aria-label`); die Klasse selbst enthält nur englische
  Standardwerte.
- Texte stehen nie fest im JavaScript — die Seite ist mehrsprachig. Das
  Fluid-Template gibt sie übersetzt als `data-label-*`-Attribute am
  Block-Element aus (`f:translate`, siehe `translations.md`), das Bootstrap
  reicht sie als Optionen weiter. Fehlt ein Attribut, wird die Option nicht
  gesetzt, damit der Standardwert der Klasse greift.
- Die Verbindung mehrerer Komponenten (eine Komponente reagiert auf das
  Event einer anderen) liegt im Bootstrap, nie in der Klasse.

```html
<div class="collapse"
    data-label-open="{f:translate(key: 'collapse.open', domain: 'ps14_site.messages')}"
    data-label-close="{f:translate(key: 'collapse.close', domain: 'ps14_site.messages')}">
```

```js
import { Collapse } from '../components/collapse.js';

document.querySelectorAll('.collapse').forEach((element) => {
  const options = {};

  if (element.dataset.labelOpen !== undefined) {
    options.ariaLabelOpen = element.dataset.labelOpen;
  }

  if (element.dataset.labelClose !== undefined) {
    options.ariaLabelClose = element.dataset.labelClose;
  }

  new Collapse(element, options);
});
```

### Kleine Skripte ohne Klasse

- Ein Skript bleibt vollständig in `bootstrap/<name>.js` — ohne Gegenstück
  in `components/` —, wenn es keinen Zustand hält, keine Instanz je Element
  und keine Zustandskette braucht (z. B. ein einzelner delegierter
  Klick-Listener wie `bootstrap/consent.js`).
- Es wird zur Klasse in `components/`, sobald es Zustand hält, Optionen
  braucht oder `activate()`/`deactivate()` bekommt.
- Funktionen, die ein zweites Skript ebenfalls braucht, wandern nach
  `utilities/`.
- Lege dafür keinen weiteren Ordner an.
- Listener auf `scroll` und `resize`, die das DOM ändern, werden mit
  `requestAnimationFrame` gebündelt; `scroll` wird mit `{passive: true}`
  registriert. Der Zustand wird beim Laden einmal direkt gesetzt, damit er
  auch auf einer bereits gescrollten Seite stimmt (Vorlage:
  `bootstrap/page-header.js`).
- Ein reiner Darstellungszustand ohne Animation (z. B. „Seite ist
  gescrollt“) ist ein Modifier am Block (`page-header--sticky`). Die
  Zustandsklassen `is--*` bleiben der Zustandskette vorbehalten.

## Klasse

- Eine Klasse je Datei, als benannter Export in PascalCase:
  `export class Collapse`.
- `constructor(element, options = {})`:
  1. `this.element` ist das Element mit der Block-Klasse.
  2. Kind-Elemente werden über ihre BEM-Klasse innerhalb von `this.element`
     gesucht (`element.querySelector('.collapse__toggle')`), nie im
     gesamten Dokument.
  3. `this.options` entsteht per `Object.assign` aus den Standardwerten und
     den übergebenen Optionen.
  4. Fehlt ein benötigtes Kind-Element, bricht der Constructor mit `return`
     ab — ohne Fehler und ohne Event-Listener.
  5. Zuletzt werden die Event-Listener registriert.
- In die Optionen gehören: die Zustandsklassen (`activateCssClass`,
  `activeCssClass`, `deactivateCssClass`), der Name der CSS-Variable für die
  Dauer (`durationCssVariable`), Texte und Callbacks. Selektoren der eigenen
  BEM-Elemente dürfen fest im Constructor stehen.
- Methodennamen:
  - `handle<Event>()` (z. B. `handleToggle()`, `handleKeydown(event)`):
    reagiert auf ein DOM-Event und entscheidet, was passiert.
  - `isActive()`: liefert den Zustand.
  - `activate()`, `activated()`, `deactivate()`, `deactivated()`: die
    Zustandskette (siehe unten).
  - `get<Wert>()`: liest einen Wert aus dem DOM.
- Muss eine Komponente abschaltbar sein (z. B. nur unterhalb eines
  Breakpoints aktiv), erhält sie zusätzlich `initialize()` und `destroy()`
  (siehe „Abschaltbare Komponenten“).

## Abschaltbare Komponenten: initialize und destroy

Für Komponenten, die nur zeitweise aktiv sind, z. B. ein Off-Canvas, das es
nur unterhalb eines Breakpoints gibt. Vorlage: `components/off-canvas.js`
und `bootstrap/off-canvas.js`.

### Klasse

- Der Constructor sucht nur die Elemente, setzt die Optionen und bindet die
  Listener als Eigenschaft (`this._handleToggle = () => this.handleToggle();`),
  damit `destroy()` sie wieder entfernen kann. Er registriert keine Listener
  und ändert das DOM nicht.
- `initialize()`:
  - bricht ab, wenn ein benötigtes Kind-Element fehlt oder die Komponente
    bereits initialisiert ist (`isInitialized()`),
  - setzt den geschlossenen Zustand (`hidden`, `aria-expanded="false"`),
  - registriert die Listener,
  - setzt zuletzt die Klasse `is--initialized`.
- `destroy()` stellt das Markup des Templates vollständig wieder her — auch
  mitten in einer Animation:
  - bricht ab, wenn die Komponente nicht initialisiert ist,
  - bricht den Timer ab (`clearTimeout(this.timer)`),
  - entfernt alle Listener und von JavaScript erzeugte Elemente (z. B.
    Backdrop),
  - entfernt die Inline-Styles der Animation und das Attribut `hidden`,
  - setzt die ARIA-Attribute auf den Wert des Templates zurück,
  - entfernt alle Zustandsklassen und `is--initialized`.
- Beide Methoden dürfen mehrfach hintereinander aufgerufen werden, ohne
  etwas doppelt zu registrieren oder zu entfernen.

### Bootstrap

- Ob die Komponente aktiv ist, entscheidet das SCSS über eine CSS-Variable
  am Block: `--<block>-enabled: 1` bzw. `0`. So steht der Breakpoint nur im
  SCSS und nie im JavaScript (kein `matchMedia`, keine Pixelwerte).
- Das Bootstrap hält alle Instanzen, liest die Variable beim Laden und bei
  jedem `resize` und ruft `initialize()` bzw. `destroy()` auf.

```js
import { OffCanvas } from '../components/off-canvas.js';

const instances = [];

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
  instances.push(new OffCanvas(element));
});

handleBreakpoint();

window.addEventListener('resize', handleBreakpoint);
```

### Markup und SCSS

- Das Template gibt den Inhalt so aus, wie er ohne die Komponente
  dargestellt wird: ohne `hidden` am Container. `hidden` setzt erst
  `initialize()`.
- Das SCSS der Komponente hängt vollständig an `is--initialized`
  (`.off-canvas.is--initialized .off-canvas__container`). Ohne die Klasse
  wird der Inhalt ganz normal dargestellt; Elemente, die nur zur Komponente
  gehören (Toggle, Close-Button, eigener Header), sind dann ausgeblendet.
- Der einsetzende Block schaltet die Komponente ein und verhindert das
  Aufblitzen des Inhalts, bis das JavaScript geladen ist:

```scss
.page-header__navigation {
    --off-canvas-enabled: 0;

    @media (width <= 860px) {
        --off-canvas-enabled: 1;
    }
}

@media (width <= 860px) {
    .page-header__navigation:not(.is--initialized) .off-canvas__container {
        display: none;
    }
}
```

## Überlagernde Komponenten (Off-Canvas, Modal)

Für Komponenten, die sich über die Seite legen. Vorlage:
`components/off-canvas.js`.

- Der Toggle-Button liegt innerhalb des Elements, das er öffnet (z. B.
  innerhalb der `<nav>`), und verweist per `aria-controls` auf den
  Container.
- Geschlossen trägt der Container `hidden`: Der Inhalt ist weder sichtbar
  noch per Tastatur oder Screenreader erreichbar. Ein Verschieben aus dem
  Viewport allein reicht nicht.
- Fokus:
  - `activate()` setzt den Fokus in die Komponente (auf den Close-Button),
  - `deactivate()` setzt ihn zurück auf den Toggle,
  - solange die Komponente offen ist, bleibt der Fokus darin: `Tab` springt
    vom letzten zum ersten fokussierbaren Element und umgekehrt
    (`trapFocus(event)`). Berücksichtigt werden nur sichtbare Elemente
    (`element.getClientRects().length > 0`).
- `Escape` schließt die Komponente. Der `keydown`-Listener hängt dafür am
  `document` — die einzige erlaubte Ausnahme von der Regel, nur am eigenen
  Element zu lauschen. Er reagiert nur, wenn `isActive()` zutrifft.
- Ein Backdrop wird in `activate()` per JavaScript erzeugt und in
  `deactivate()` wieder entfernt; ein Klick darauf schließt die Komponente.
  Seine Klasse steht in den Optionen (`backdropCssClass`).
- Scrollverhalten: Der Container erhält `overflow: auto` und
  `overscroll-behavior: contain`. Das Scrollen der Seite wird nicht per
  JavaScript gesperrt.
- Hat der Container vor dem Öffnen `display: none` (`hidden`), liefert
  `getComputedStyle()` für die animierte Eigenschaft keinen brauchbaren
  Startwert. Der Startframe ist dann der geschlossene Wert aus den Optionen
  (z. B. `closedTranslate: '100% 0'`); nur bei einem Abbruch der
  Gegenrichtung ist es der aktuelle Wert:

```js
const closed = this.container.hasAttribute('hidden');

this.container.removeAttribute('hidden');
this.container.style.translate = closed === true ? this.options.closedTranslate : this.getTranslate();
```

## Zustandskette: activate → activated → deactivate → deactivated

Jeder Wechsel besteht aus zwei Schritten: Die erste Methode startet die
Animation, die zweite räumt nach deren Ende auf. So ist jeder Zwischenstand
per CSS ansprechbar und das Element ist nur dann `hidden`, wenn die
Animation abgeschlossen ist.

| Methode | Zeitpunkt | Zustandsklasse | Weitere Aufgaben | Event |
|---|---|---|---|---|
| `activate()` | Start Öffnen | `+ is--activate` | `hidden` entfernen, ARIA setzen, Startframe und Zielwert setzen, Timer starten | `<block>.activate` |
| `activated()` | Ende Öffnen | `- is--activate`, `+ is--active` | Inline-Styles der Animation entfernen | `<block>.activated` |
| `deactivate()` | Start Schließen | `- is--active`, `+ is--deactivate` | ARIA setzen, Startframe und Zielwert setzen, Timer starten | `<block>.deactivate` |
| `deactivated()` | Ende Schließen | `- is--deactivate` | Inline-Styles entfernen, `hidden` setzen | `<block>.deactivated` |

- Bedeutung der Zustandsklassen — sie gilt für **alle** Komponenten:
  - `is--activate`: Öffnen läuft.
  - `is--active`: offen (Endzustand).
  - `is--deactivate`: Schließen läuft.
  - keine Klasse: geschlossen.
- „Offen“ im Sinne von `isActive()` ist `is--active` **oder**
  `is--activate`.
- Der geschlossene Zustand wird über das Attribut `hidden` abgebildet. Es
  wird in `activate()` zuerst entfernt und erst in `deactivated()` wieder
  gesetzt.
- ARIA-Attribute (`aria-expanded`, `aria-selected`, `aria-label`) wechseln
  sofort in `activate()` bzw. `deactivate()`, nicht erst am Ende der
  Animation.
- Ein Initialzustand ohne Animation (z. B. beim Laden bereits offen) läuft
  über `activate(false)`: Die Methode überspringt Startframe und Timer und
  ruft direkt `activated()` auf.

### Animation

- Die Dauer steht **nur** im SCSS als CSS-Variable
  `--<block>-transition-duration`. JavaScript liest sie mit
  `getTransitionDuration()` aus `utilities/transition.js`; im JavaScript
  steht nie eine feste Dauer.
- Das Ende der Animation wird per `setTimeout` mit dieser Dauer bestimmt,
  nicht per `transitionend` (das Event bleibt aus, wenn keine Transition
  läuft).
- **PFLICHT:** `activate()` und `deactivate()` brechen als Erstes den
  laufenden Timer ab (`clearTimeout(this.timer)`) und entfernen die
  Zustandsklasse der Gegenrichtung. Sonst hinterlässt ein schneller
  Doppelklick einen falschen Zustand.
- Der Startframe ist immer der **aktuelle** Wert (z. B.
  `this.element.offsetHeight`), nicht der Wert des geschlossenen Zustands.
  So läuft die Animation auch nach einem Abbruch flüssig weiter.
- Zwischen Startframe und Zielwert wird ein Reflow erzwungen
  (`void this.element.offsetHeight;`), damit der Browser die Transition
  ausführt. Verwende dafür kein `setTimeout(…, 0)`.
- Inline-Styles der Animation werden am Ende gezielt entfernt
  (`style.removeProperty('max-height')`), nicht per
  `removeAttribute('style')`.

### Events

- Jede der vier Methoden löst am Ende ein `CustomEvent` an `this.element`
  aus. Der Name ist `<block>.<methode>`, z. B. `collapse.activated`.
- Betrifft der Wechsel ein Kind-Element (z. B. Tab und Panel), wird es in
  `detail` mitgegeben: `{detail: {button, panel}}`.
- Andere Komponenten reagieren nur über diese Events, nie über direkte
  Methodenaufrufe aus einer anderen Klasse.

## Vorlage: Komponente

```js
import { getTransitionDuration } from '../utilities/transition.js';

export class Collapse {
  constructor(element, options = {}) {
    this.element = element;
    this.header = element.querySelector('.collapse__header');
    this.toggle = element.querySelector('.collapse__toggle');
    this.body = element.querySelector('.collapse__body');
    this.timer = null;
    this.options = Object.assign({
      durationCssVariable: '--collapse-transition-duration',
      activateCssClass: 'is--activate',
      activeCssClass: 'is--active',
      deactivateCssClass: 'is--deactivate',
      ariaLabelOpen: 'Open',
      ariaLabelClose: 'Close',
    }, options);

    if (this.header === null || this.toggle === null || this.body === null) {
      return;
    }

    this.toggle.setAttribute('aria-label', this.options.ariaLabelOpen);
    this.toggle.addEventListener('click', () => this.handleToggle());
  }

  handleToggle() {
    if (this.isActive() === true) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  isActive() {
    return this.element.classList.contains(this.options.activeCssClass)
      || this.element.classList.contains(this.options.activateCssClass);
  }

  getDuration() {
    return getTransitionDuration(this.element, this.options.durationCssVariable);
  }

  activate(animate = true) {
    clearTimeout(this.timer);

    // Startframe: aktuelle Höhe, solange der Body noch nicht mitzählt.
    this.element.style.maxHeight = this.element.offsetHeight + 'px';

    this.body.removeAttribute('hidden');
    this.element.classList.remove(this.options.deactivateCssClass);
    this.toggle.setAttribute('aria-expanded', 'true');
    this.toggle.setAttribute('aria-label', this.options.ariaLabelClose);

    if (animate === false) {
      this.activated();

      return;
    }

    this.element.classList.add(this.options.activateCssClass);

    // Reflow erzwingen, damit der Zielwert animiert wird.
    void this.element.offsetHeight;

    this.element.style.maxHeight = (this.header.offsetHeight + this.body.offsetHeight) + 'px';
    this.timer = setTimeout(() => this.activated(), this.getDuration());

    this.element.dispatchEvent(new CustomEvent('collapse.activate'));
  }

  activated() {
    this.element.style.removeProperty('max-height');
    this.element.classList.remove(this.options.activateCssClass);
    this.element.classList.add(this.options.activeCssClass);

    this.element.dispatchEvent(new CustomEvent('collapse.activated'));
  }

  deactivate() {
    clearTimeout(this.timer);

    this.element.style.maxHeight = this.element.offsetHeight + 'px';

    this.element.classList.remove(this.options.activeCssClass, this.options.activateCssClass);
    this.element.classList.add(this.options.deactivateCssClass);
    this.toggle.setAttribute('aria-expanded', 'false');
    this.toggle.setAttribute('aria-label', this.options.ariaLabelOpen);

    void this.element.offsetHeight;

    this.element.style.maxHeight = this.header.offsetHeight + 'px';
    this.timer = setTimeout(() => this.deactivated(), this.getDuration());

    this.element.dispatchEvent(new CustomEvent('collapse.deactivate'));
  }

  deactivated() {
    this.element.style.removeProperty('max-height');
    this.element.classList.remove(this.options.deactivateCssClass);
    this.body.setAttribute('hidden', '');

    this.element.dispatchEvent(new CustomEvent('collapse.deactivated'));
  }
}
```

## Vorlage: Hilfsfunktion `utilities/transition.js`

Die Datei wird mit der ersten Komponente angelegt, die sie braucht.

```js
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
```

## SCSS zur Zustandskette

Das SCSS folgt [scss.md](scss.md) und liegt in `components/_<block>.scss`.

- Die Dauer wird als Variable `--<block>-transition-duration` am Block
  definiert und in `transition` verwendet.
- **PFLICHT:** Bei `prefers-reduced-motion: reduce` wird die Variable auf
  `0s` gesetzt. Die Kette läuft dann ohne Animation durch; im JavaScript ist
  dafür keine Sonderbehandlung nötig.
- Zustände werden nur über die Zustandsklassen am Block selektiert
  (`.collapse.is--active`), nie über Inline-Styles oder eigene
  JavaScript-Klassen.
- Eigenschaften, die sich animieren, setzt ausschließlich JavaScript als
  Inline-Style (z. B. `max-height`); das SCSS liefert nur die `transition`.

```scss
.collapse {
    --collapse-transition-duration: 250ms;

    overflow: hidden;
    transition: max-height var(--collapse-transition-duration) ease;

    @media (prefers-reduced-motion: reduce) {
        --collapse-transition-duration: 0s;
    }
}
```

## Checkliste für eine neue Komponente

1. `components/<block>.js` mit der Klasse nach der Vorlage anlegen.
2. `bootstrap/<block>.js` anlegen und in `site.js` importieren.
3. Gemeinsam nutzbare Funktionen nach `utilities/` auslagern statt kopieren.
4. SCSS mit Dauer-Variable, Zustandsklassen und `prefers-reduced-motion`
   ergänzen.
5. Markup: Block-Klasse, BEM-Elemente, `hidden` und ARIA-Attribute im
   Fluid-Template setzen — JavaScript ändert sie nur.
6. Texte als `data-label-*`-Attribute im Template ausgeben und im Bootstrap
   als Optionen übergeben.
7. Abschaltbare Komponente: `--<block>-enabled` im SCSS setzen und den
   Wechsel über den Breakpoint in beide Richtungen prüfen — auch bei
   geöffneter Komponente.
8. Prüfen: schneller Doppelklick, Tastaturbedienung (Fokus, `Escape`),
   reduzierte Bewegung, `ddev exec npm run lint:js`.
