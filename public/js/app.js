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

// say hello function call
const button = document.querySelector('.call')
button.addEventListener('click', () => {
  // get function reference
  const sayHello = firebase.functions().httpsCallable('sayHello')
  // invoke the function (async function / promise)
  sayHello({ name: 'Mark' }).then(result => {
    alert(result.data);
  })
})