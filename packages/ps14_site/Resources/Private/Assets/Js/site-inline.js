var xna = window.xna || {};

// ---------------------------------------------------------------------------------------------------------------------
// Datenstruktur fuer eventuelle Skripte
xna.data = xna.data || {};
xna.l10n = xna.l10n || {};
xna.settings = xna.settings || {};

// ---------------------------------------------------------------------------------------------------------------------
// eigene On-Event Methode um Asynchrone Skripte besser steuern zu koennen -> damit koennen Callbacks auf Events bereits
// im Voraus gesammelt werden bzw. auf bereits gefeuerte Events kann immer noch eine Callback-Methode angewandt werden
//
// Callbacks registrieren
// xna.on('event', function() {
//	 // Callback
// });
//
// Callbacks aufrufen
// xna.fire('event');

xna.onEventFired = xna.onEventFired || {};
xna.onEventCallbacks = xna.onEventCallbacks || {};

if(typeof xna.on !== 'function') {
  xna.on = function(event, callback) {
    if(typeof(this.onEventFired[event]) !== 'undefined' && this.onEventFired[event] === true) {
      callback();
      return;
    }

    if(typeof(this.onEventCallbacks[event]) === 'undefined') {
      this.onEventCallbacks[event] = [];
    }

    this.onEventCallbacks[event].push(callback);
  };
}

if(typeof xna.fire !== 'function') {
  xna.fire = function(event) {
    if(typeof(this.onEventFired[event]) !== 'undefined') {
      return;
    }

    if(typeof(this.onEventCallbacks[event]) !== 'undefined') {
      this.onEventCallbacks[event].forEach(function(callback) {
        callback();
      });

      this.onEventCallbacks[event] = [];
    }

    this.onEventFired[event] = true;
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// asynchrones DOMContentLoaded nutzen
document.addEventListener('DOMContentLoaded', function() {
  xna.fire('documentLoaded');
});

// ---------------------------------------------------------------------------------------------------------------------
// Klassen auf Body-Tag setzen
document.addEventListener('DOMContentLoaded', function() {

  // JS-Klassen setzen
  document.body.classList.remove('no-js');
  document.body.classList.add('js');

  // Touch Klassen setzen
  if(('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0) {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  }
});

// Focus-Klasse setzen
window.addEventListener('keydown', function (event) {
  if(event.key === 'Tab') {
    document.body.classList.add('focusable');
  }
}, true);

// ---------------------------------------------------------------------------------------------------------------------
// Tabellen mit Breiten versehen
document.addEventListener('DOMContentLoaded', function() {
  if(typeof(NodeList.prototype.forEach) !== 'undefined') {
    document.querySelectorAll('table').forEach(function(table) {
      table.setAttribute('data-columns-count', table.querySelectorAll('thead > tr:first-child th').length);
    });
  }
});
