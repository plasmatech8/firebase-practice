const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');

// open request modal
requestLink.addEventListener('click', () => {
  requestModal.classList.add('open');
});

// close request modal
requestModal.addEventListener('click', (e) => {
  // If clicked on modal background, but not on the dialog box, close
  if (e.target.classList.contains('new-request')) {
    requestModal.classList.remove('open');
  }
});

