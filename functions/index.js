const functions = require('firebase-functions');

/*
// Return random number
exports.randomNumber = functions.https.onRequest((req, res) => {
  const number = Math.round(Math.random() * 100)
  console.log(`LOGGING NUMBER (${number}) TO FIREBASE CONSOLE!`)
  res.send(number.toString())
})

// Redirect to website
exports.toTheDojo = functions.https.onRequest((req, res) => {
  res.redirect('https://www.thenetninja.co.uk')
})

// Callable function
exports.sayHello = functions.https.onCall((data, context) => {
  const name = data.name
  return `Hello ${name}!`
})
*/

// Auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  console.log('User created', user.email, user.uid);
});

// Auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  console.log('User deleted', user.email, user.uid);
});
