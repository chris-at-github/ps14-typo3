window.addEventListener('keydown', function (event) {
  if(event.key === 'Tab') {
    document.body.classList.add('is--focusable');
  }
}, true);
