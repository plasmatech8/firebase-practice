const authSwitchLinks = document.querySelectorAll('.switch');
const authModals = document.querySelectorAll('.auth .modal');
const authWrapper = document.querySelector('.auth');

const registerForm = document.querySelector('.register');
const loginForm = document.querySelector('.login');
const signOut = document.querySelector('.sign-out');

// Toggle auth modals
authSwitchLinks.forEach(link => {
  link.addEventListener('click', () => {
    authModals.forEach(modal => modal.classList.toggle('active'));
  });
});


// Register form
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = registerForm.email.value;
  const password = registerForm.password.value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((user) => {
      console.log('Registered', user);
      registerForm.reset();
    })
    .catch((error) => {
      registerForm.querySelector('.error').textContent = error.message;
    });
});

// Login form
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
      console.log('Logged in', user);
      loginForm.reset();
    })
    .catch((error) => {
      loginForm.querySelector('.error').textContent = error.message;
    });
});

// Display the auth modal when the the user logs in/out
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    authWrapper.classList.remove('open');
    authModals.forEach(modal => modal.classList.remove('active'))
  } else {
    authWrapper.classList.add('open');
    authModals[0].classList.add('active');
  }
});

// Sign out button
signOut.addEventListener('click', () => {
  firebase.auth().signOut();
});