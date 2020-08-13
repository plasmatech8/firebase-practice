const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

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
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    upvotedOn: []
  });
});

// Auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  console.log('User deleted', user.email, user.uid);
  const docRef = admin.firestore().collection('users').doc(user.uid);
  return docRef.delete();
});

// http callable function (adding a tutorial request)
exports.addRequest = functions.https.onCall((data, context) => {
  // (if user not logged in)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated users can add tutorial requests'
    );
  }
  // (if text too long)
  if (data.text.length > 30) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Request must be 30 characters or less'
    );
  }
  // Add record to database
  return admin.firestore().collection('requests').add({
    text: data.text,
    upvotes: 0,
  });
});
