(function () {
  'use strict';

  xna.on('documentLoaded', function() {

    document.addEventListener('contactSearchLoaded', function(event) {

      // Dokumenten-Klasse
      document.body.classList.add('is-contact-open');
      document.body.classList.remove('is-contact-loading');

      let container = event.detail.resultContainer;

      // Fertiges HTML in den vorbereiteten Container laden
      container.innerHTML = event.detail.responseBody;

      let height = container.offsetHeight;
        height += parseInt(window.getComputedStyle(container).marginTop);
        height += parseInt(window.getComputedStyle(container).marginBottom);

      // Eltern-DIV auf die Groesse aufspannen
      container.parentElement.style.maxHeight = height + 'px';
    });

    document.addEventListener('contactSearchSubmit', function(event) {
      let node = event.detail.node;
      let form = node.querySelector('form');
      let resultContainer = node.querySelector('.contact-search--result-container');
      let data = new FormData(form);
      let uri = form.getAttribute('action');

      // Dokumenten-Klasse
      document.body.classList.add('is-contact-loading');

      fetch(uri, {
        body: data,
        method: 'post',
      }).then(function(response) {
        return response.text();

      }).then(function(body) {
        xna.fireEvent('contactSearchLoaded', {
          responseBody: body,
          resultContainer: resultContainer
        });
      });
    });

    document.querySelectorAll('.ce-contact-search').forEach(function(node) {
      let form = node.querySelector('form');
      let country = node.querySelector('.contact-search--countries');
      let zipRegex = '';

      if(xna.data.countries) {
        // Laender nach dem sorting (aus PHP) sortieren
        let countries = Object.values(xna.data.countries);

        if(countries.length !== 0) {
          countries.sort(function(a, b) {
            return a.sorting.localeCompare(b.sorting, undefined, { numeric: true, sensitivity: 'base' })
          });

          // neue Laenderauswahl hinzugefuegen
          // @see: https://stackoverflow.com/questions/6601028/how-to-populate-the-options-of-a-select-element-in-javascript
          for(let i in countries) {
            let option = document.createElement('option');
            option.value = countries[i].uid;
            option.innerText = countries[i].title;

            country.appendChild(option);
          }
        }
      }

      form.addEventListener('submit', function(event) {
        xna.fireEvent('contactSearchSubmit', {
          node: node
        });

        event.preventDefault();
      });

      // Laenderauswahl
      node.querySelector('.contact-search--countries').addEventListener('change', function() {
        let value = parseInt(this.value);

        let target = {
          // productLine: node.querySelector('.contact-search--product-lines'),
          zip: node.querySelector('.contact-search--zip'),
          button: node.querySelector('button[type="submit"]')
        };

        // kein Land ausgewaehlt -> Versand des Formulars verhindern
        if(value === 0) {

          // Button sperren
          target.button.disabled = true;

        } else if(typeof(xna.data.countries[value]) !== 'undefined') {

          // es wurde ein Eintrag ausgewaehlt zu dem es nur eine Konfiguration gibt -> also keine PLZ-Eingabe noetig
          // 1. Zip Feld freischalten
          // 2. Ober-Variable zipRegex beschreiben
          if(xna.data.countries[value].zipRegex !== '') {
            target.zip.disabled = false;
            target.zip.focus();
            zipRegex = xna.data.countries[value].zipRegex;

            // Button freigeben
            target.button.disabled = false;

          // 1. Zip Feld sperren
          // 2. Zip Feld leeren
          } else {
            target.zip.value = '';
            target.zip.disabled = true;

            // Button freigeben
            target.button.disabled = false;

            // Formular direkt absenden
            xna.fireEvent('contactSearchSubmit', {
              node: node
            });
          }
        }
      });

      // Zip Eingabe
      node.querySelector('.contact-search--zip').addEventListener('keypress', function(event) {
        if(zipRegex !== '') {
          let regex = new RegExp(zipRegex, 'g');
          let value = this.value + String.fromCharCode(event.charCode || event.keyCode);

          if(window.getSelection().toString().length !== 0) {
            value = value.replace(window.getSelection().toString(), '');
          }

          // Formular bei Enter abschicken
          if(event.keyCode === 13 || event.key === 'Enter') {
            xna.fireEvent('contactSearchSubmit', {
              node: node
            });
          }

          if(value.match(regex) === null) {
            event.preventDefault();
          }
        }
      });

      // Abfrage aktiver Tab
      // @see: https://getbootstrap.com/docs/5.0/components/navs-tabs/
      document.querySelectorAll('#tab--continents button[data-bs-toggle="tab"]').forEach(function(node) {
        node.addEventListener('shown.bs.tab', function (event) {
          let activeTab = event.target;

          // bisherigen aktiven Kontinent deaktivieren
          let activeContinent = document.querySelector('.contact-listing--map-continent-active');

          if(activeContinent !== null) {
            activeContinent.setAttribute('class', 'contact-listing--map-continent contact-listing--map-continent-default');
          }

          // kuenftigen Continent identifizieren und aktivieren
          let targetContinent = document.querySelector('#' + activeTab.getAttribute('data-target-continent'));

          if(targetContinent !== null) {
            targetContinent.setAttribute('class', 'contact-listing--map-continent contact-listing--map-continent-active');
          }
        })
      });

      document.querySelectorAll('.contact-listing--map-continent').forEach(function(node) {
        node.addEventListener('click', function() {
          if(typeof(window.bootstrap.tab) !== 'undefined') {
            let targetTab = document.querySelector('button[data-target-continent="' + node.getAttribute('id') + '"]');

            if(targetTab !== null) {
              let targetObject = new window.bootstrap.tab(targetTab);
                  targetObject.show();
            }
          }
        });
      });
    });
  });
})();
