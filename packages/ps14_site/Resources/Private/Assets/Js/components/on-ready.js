let xna = window.xna || {};

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

// console.log(xna);
