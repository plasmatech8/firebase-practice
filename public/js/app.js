const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');
const requestForm = document.querySelector('.new-request form')

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

// add a new request
requestForm.addEventListener('submit', (e) => {
  e.preventDefault();
  requestForm.querySelector('.error').textContent = '';

  const addRequest = firebase.functions().httpsCallable('addRequest');
  addRequest({
    text: e.target.request.value
  }).then(() => {
    requestForm.reset();
    requestModal.classList.remove('open');

  }).catch(error => {
    requestForm.querySelector('.error').textContent = error.message;
  });
});
