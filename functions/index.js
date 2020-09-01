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


// http callable function (adding a tutorial request)
exports.upvote = functions.https.onCall(async (data, context) => {
  // If user not logged in
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated users can add tutorial requests'
    );
  }

  // Get refs for user doc and request doc
  const user = admin.firestore().collection('users').doc(context.auth.uid);
  const request = admin.firestore().collection('requests').doc(data.id);

  /*
  // BETTER: (toggle version + uses async to avoid nested Promises)
  const update = async () => {
    const doc = await user.get();
    const alreadyUpvoted = doc.data().upvotedOn.includes(data.id);

    // Update user upvotedOn array
    await user.update({
      upvotedOn: alreadyUpvoted
        ? doc.data().upvotedOn.filter(item => item !== data.id)
        : [...doc.data().upvotedOn, data.id]
    });
    // Update request upvote counter
    return await request.update({
      upvotes: alreadyUpvoted
        ? admin.firestore.FieldValue.increment(-1)
        : admin.firestore.FieldValue.increment(1)
    });
  };
  return update();
  */

  // Get user document from database
  const doc = await user.get()

  // Check user has not already upvoted
  if (doc.data().upvotedOn.includes(data.id)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'You can only upvote a request once'
    );
  }

  // Update the user upvotedOn array
  await user.update({
    upvotedOn: [...doc.data().upvotedOn, data.id]
  });

  // Update the votes on request
  return request.update({
    upvotes: admin.firestore.FieldValue.increment(1)
  });
});



