// Opens the settings of the consent manager: every element with [data-consent-settings] (e.g. the button in the page
// footer) dispatches the event "consent:settings", the integration of the consent manager listens to it.
(function () {
  'use strict';

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const trigger = event.target.closest('[data-consent-settings]');

    if (trigger === null) {
      return;
    }

    event.preventDefault();
    document.dispatchEvent(new CustomEvent('consent:settings', {detail: {trigger}}));
  });
})();
