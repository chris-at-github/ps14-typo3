const filter = function(element, options) {
  let _ = this;

  _.element = element;
  _.form = null;
  _.resetContainer = null;
  _.options = {};
  _.defaults = {
    paginatorSelector: '.f3-widget-paginator',
    ajax: false,
    beforeSubmit: null,
    beforeAutoSubmit: null,
    afterSubmit: null,
    beforeProcessResponse: null,
    beforeProcessItem: null,
    afterProcessItem: null,
    submitSelector: '.filter--submit',
    autoSubmitSelector: '.filter-item--auto-submit',
    formSelector: 'form',
    filterItemSelector: '.filter-item',
    containerSelector: null,
    itemsSelector: null,
    resetableSelector: '.filter-item--resetable',
    resetAllSelector: '.filter-reset--all',
    animationDuration: 250,
    pageType: 0
  }

  _.initialize(options);

  return {
  }
}

filter.prototype.initialize = function(options) {
  let _ = this;

  _.options = Object.assign(_.defaults, options);
  _.form = _.element.querySelector(_.options.formSelector);

  // // Read Hash
  // this.readHash();

  // hier nur weitermachen wenn die Suche ueberhaupt per Ajax abgeschickt werden soll
  if(_.options.ajax === true) {
    _.form.addEventListener('submit', function(event) {
      _.submit();
      event.preventDefault();
    });
  }

  // Auto-Submit Formularelemente verarbeiten
  _.element.querySelectorAll(_.options.autoSubmitSelector).forEach(function(item) {
    item.querySelectorAll('input, select').forEach(function(input) {
      input.addEventListener('change', function() {
        if(_.beforeAutoSubmit() !== false) {
          _.submit();
        }
      });
    });
  });

  // Resetable Formularelemente verarbeiten
  _.element.querySelectorAll(_.options.resetableSelector).forEach(function(item) {
    _.processResetableItem(item);
  });

  // Reset All Button verarbeiten
  if(_.element.querySelector(_.options.resetAllSelector) !== null) {
    _.processResetAllButton();
    _.element.querySelector(_.options.resetAllSelector).addEventListener('click', function() {
      _.resetAll();
    });
  }

  // // Reset Button Container erzeugen
  // this.resetContainer = $('<div class="filter-reset--container"></div>');
  //
  // // Wenn es einen Reset All Button gibt, fuege die Einzel Reset Buttons davor ein, ansonsten am Ende vom Formular
  // if(resetAll.length !== 0) {
  // 	this.resetContainer.insertBefore(resetAll);
  // 	resetAll.appendTo(this.resetContainer);
  //
  // } else {
  // 	this.form.append(this.resetContainer);
  // }
  // // Reset Buttons erzeugen
  // $('input', this.form).each(function() {
  // 	var input = $(this);
  //
  // 	if(input.closest('.filter-item--resettable').length !== 0) {
  // 		_.processResetItem(input);
  // 	}
  // });
  // this.processResetAllButton();
}

filter.prototype.submit = function(event) {
  var _ = this;

  _.beforeSubmit();
  // _.processResetAllButton();
  // _.writeHash();

  // Filter automatisch ueber Ajax verarbeiten
  if(_.options.ajax === true) {

    let data = new FormData(_.form);
    let uri = _.form.getAttribute('action');

    if(_.options.pageType !== 0) {
      uri = xna.addQueryString(uri, 'type', _.options.pageType);
    }

    // // Dokumenten-Klasse
    // document.body.classList.add('is--filter-loading');

    fetch(uri, {
      body: data,
      method: 'post',
    }).then(function(response) {
      return response.text();

    }).then(function(body) {
      let html = _.beforeProcessResponse(body);

      _.processResponse(html, false);
      _.processPaginator(html);
      _.afterSubmit();
    });

    // lokale Verarbeitung der Filter
  } else if(_.options.local === true) {
    _.afterSubmit();

    // Formular absenden
  } else {
    this.form.submit();
  }

  if(typeof(event) !== 'undefined') {
    event.preventDefault();
  }
};

filter.prototype.resetAll = function() {
  let _ = this;

  // Text zuruecksetzen
  _.element.querySelectorAll('input[type=text]').forEach(function(node) {
    node.value = '';
  });

  // Radio | Checkbox
  _.element.querySelectorAll('input[type=radio], input[type=checkbox]').forEach(function(node) {
    node.checked = false;
  });

  _.submit();
};

filter.prototype.beforeSubmit = function() {
  this.processResetAllButton();

  if(typeof(this.options.beforeSubmit) === 'function') {
    this.options.beforeSubmit(this);
  }
};

filter.prototype.beforeAutoSubmit = function() {
  if(typeof(this.options.beforeAutoSubmit) === 'function') {
    return this.options.beforeAutoSubmit();
  }

  return true;
};

filter.prototype.afterSubmit = function() {
  if(typeof(this.options.afterSubmit) === 'function') {
    this.options.afterSubmit(this);
  }
};

filter.prototype.beforeProcessResponse = function(response) {
  let parser = new DOMParser();
  let html = parser.parseFromString(response, 'text/html');

  if(typeof(this.options.beforeProcessResponse) === 'function') {
    return this.options.beforeProcessResponse(html);
  }

  return html;
};

filter.prototype.beforeProcessItem = function(item) {
  if(typeof(this.options.beforeProcessItem) === 'function') {
    this.options.beforeProcessItem(item);
  }
};

filter.prototype.afterProcessItem = function(item) {
  if(typeof(this.options.afterProcessItem) === 'function') {
    this.options.afterProcessItem(item);
  }
};

filter.prototype.processResetableItem = function(item) {
  let _ = this;
  let prev = null;

  // Radio / Checkbox zuruecksetzen
  item.querySelectorAll('input[type=radio]').forEach(function(node) {
    node.addEventListener('click', function() {
      if(prev !== null && prev === node.value) {
        node.checked = false;
        prev = null;

        if(item.closest(_.options.autoSubmitSelector) !== null && _.beforeAutoSubmit() !== false) {
          _.submit();
        }

      } else {
        prev = node.value;
      }
    });
  });
};

filter.prototype.processResetAllButton = function() {
  let _ = this;
  let resetAllButton = _.element.querySelector(_.options.resetAllSelector);
  let disable = true;

  // Reset All Button anpassen (ein- / ausblenden)
  if(resetAllButton !== null) {

    // Text auswerten
    _.element.querySelectorAll('input[type=text]').forEach(function(node) {
      if(node.value !== '') {
        disable = false;
      }
    });

    // Radio | Checkbox
    _.element.querySelectorAll('input[type=radio], input[type=checkbox]').forEach(function(node) {
      if(node.checked === true) {
        disable = false;
      }
    });

    resetAllButton.disabled = disable;
  }
};

filter.prototype.processPaginator = function() {
  // if(html !== null) {
  // 	if($(html).find(this.options.paginatorSelector).length !== 0) {
  // 		$(this.options.paginatorSelector, this.element).html($(html).find(this.options.paginatorSelector).html());
  // 	} else {
  // 		$(this.options.paginatorSelector, this.element).empty();
  // 	}
  // }
  //
  // if($('.f3-widget-paginator .next', this.element).length === 0) {
  // 	$('.lazyload--trigger', this.element).addClass('disabled').prop('disabled', true);
  //
  // } else {
  // 	$('.lazyload--trigger', this.element).removeClass('disabled').prop('disabled', false);
  // }
};

filter.prototype.processResponse = function(html, append) {
  if(this.options.containerSelector) {
    let _ = this;
    let container = this.element.querySelector(_.options.containerSelector);
    let items = null;

    if(append === false) {
      xna.emptyNode(container);
    }

    if(_.options.itemsSelector !== null) {
      items = html.querySelectorAll(_.options.itemsSelector);
    }

    if(items !== null) {
      items.forEach(function(node) {
        let item = node.cloneNode(true);

        _.beforeProcessItem(item);
        container.append(item);
        _.afterProcessItem(item);
      });

    } else {
      container.append(html.querySelector(_.options.containerSelector).innerHTML);
    }
  }
};

window.filter = filter;
