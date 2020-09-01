# firebase-practice

Following [this tutorial](https://www.youtube.com/watch?v=udHm7I_OvJs&list=PL4cUxeGkcC9i_aLkr62adUTJi53y7OjOf)
by The Net Ninja on YouTube.

References: https://github.com/iamshaunjp/firebase-functions/

## 01. Introduction

We will create use Auth, Firestore to create a website. Firebase Cloud
Functions will allow us to perform database operations from a trusted source
with backend validation.

![](docs/2020-08-07-15-30-42.png)

## 02. Setup

Firebase init:
* Firestore
* Functions
* Hosting
* Emulators

View the website using `firebase serve`

## 03. HTML template

An input form/modal will pop up when we add a new request (for a tutorial). It
will close when the background is clicked on (and not the form box).

![](docs/2020-08-09-16-04-27.png)

## 04. Creating and Deploying a Function

There are a number of triggers that can be used for a function. We will be
using a HTTP trigger.

![](docs/2020-08-09-16-07-11.png)

We will create a simple random number function in
[functions/index.js](functions/index.js).
```js
const functions = require('firebase-functions');

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
```

Now we can deploy our functions:
```bash
firebase deploy --only functions
```

If you get `Error: Cloud Functions deployment requires the pay-as-you-go (Blaze) billing plan.`,
use the Blaze billing plan (functions is no longer free for Node 10 and Node 8
will be decommissioned in 03/2020).

## 05. Callable Functions

We created a HTTP endpoint function. Now we will create a callable function,
which is meant to be called using our code.

Callable functions are the same as HTTP, but it does some extra work for you:
* On client
  * Handling CORS with the request
  * Sending authenticated user token
  * sending device instance ID
  * Serializing input object from the client
  * Deserialising response object in the client
* On backend:
  * Validating the user token
  * Deserialising input object
  * Serialising response object

`functions/index.js` (define the callable function)
```js
// Callable function
exports.sayHello = functions.https.onCall((data, context) => {
  const name = data.name
  return `Hello ${name}!`
})
```

`public/js/app.js` (call the function with input data)
```js
// say hello function call
const button = document.querySelector('.call')
button.addEventListener('click', () => {
  // get function reference
  const sayHello = firebase.functions().httpsCallable('sayHello')
  // invoke function (async function / promise)
  sayHello({ name: 'Mark' }).then(result => {
    alert(result.data);
  })
})
```

## 06. Auth Model Templates

Hooking up Auth to the functions.

We will create a Model for login and a model for registration, and add
appropriate CSS.
```html
  <div class="auth open">

    <div class="modal active">
      <h2>Login</h2>
      <form class="login">
        <input type="text" name="email" placeholder="Email">
        <input type="password" name="password" placeholder="Password">
        <button>Login</button>
        <p class="error"></p>
      </form>
      <div>No account? <a class="switch">Register instead</a></div>
    </div>

    <div class="modal">
      <h2>Register</h2>
      <form class="register">
        <input type="text" name="email" placeholder="Email">
        <input type="password" name="password" placeholder="Password">
        <button>Register</button>
        <p class="error"></p>
      </form>
      <div>Got an account? <a class="switch">Login instead</a></div>
    </div>
  </div>
```
For now, we will only add JavaScript for switching between login and register.

## 07. Firebase Authentication

We will enable the Email signin method in the Firebase console.

We can add event listeners and the Firebase Auth async functions to login,
signup, automatically signin, and manage error messages.
```js
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
```

## 08. Auth Triggers

We will remove old HTTP and callable functions.

We will create auth triggers that log when a new user is created/deleted.

```js
// Auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  console.log('User created', user.email, user.uid);
});

// Auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  console.log('User deleted', user.email, user.uid);
});
```

These functions are not called by the client, but it will raise a warning log
because it expects a Promise or value regardless. We will address this next.

## 09. Creating User Records

What if we want to store other information about a user? Hobbies, biography,
settings, etc.

We will create user records when our Auth trigger functions.

We will initialize the app using admin and create/delete records in the
Auth trigger functions.
```js
const admin = require('firebase-admin');
admin.initializeApp();

// ...

// Auth trigger (new user signup)
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  console.log('User created', user.email, user.uid);
  admin.firestore().collection('users').doc(user.uid).set({
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
```

It returns a promise so we don't need to worry about warnings.

## 10. Function to add a New Tutorial Request

We will create a callable function which can be called from the frontend form.

```js
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
```
## 11. Integrate New Tutorial Request to front-end

Now we will set our New Request form to invoke the Function on submit.

```js
const requestForm = document.querySelector('.new-request-form')
// ...

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
```

## 12. Firestore Realtime Data

We will allow read access to all documents in the requests collection.
```
match /requests/{docId} {
  allow read;
  allow write: if false;
}
```
This is so we can read data from the front-end. (We previously had full access
to firestore because firebase functions have full admin access).

Then we will read from the database.
```js
const ref = firebase.firestore().collection('requests');

ref.onSnapshot(snapshot => {
  var requests = [];

  snapshot.forEach(doc => {
    requests.push({ ...doc.data(), id: doc.id });
  });

  let html = ``;
  requests.forEach(request => {
    html += `<li>${request.text}</li>`;
  });
  document.querySelector('ul').innerHTML = html;
});
```

However, using templates strings and innerHTML is tedious and not good
practice. We will use a Vue template to manage each list item.

## 13. Adding a Vue Instance

We will create a Vue app instance.
```js
var app = new Vue({
  el: '#app',
  data: {
    requests: [],
  },
  mounted() { // on mount
    const ref = firebase.firestore().collection('requests');
    ref.onSnapshot(snapshot => {
      var requests = [];
      snapshot.forEach(doc => {
        requests.push({ ...doc.data(), id: doc.id });
      });
      this.requests = requests;
    });
  }
});
```

Then we will set our requests list HTML section as the Vue instance.
```html
  <section class="content" id="app">
    <h1>Tutorial Requests</h1>
    <ul class="request-list">
      <li v-for="request in requests">
        <span class="text">{{ request.text }}</span>
        <div>
          <span class="votes">{{ request.upvotes }}</span>
          <i class="material-icons upvote">arrow_upward</i>
        </div>
      </li>
    </ul>
  </section>
```
The `v-for` directive will be used to make a request item in the list for each
request in the data.

## 14. Upvoting Function (back-end)

We will make an upvoting function. Only authenticated users will be able to
upvote, and a user can only upvote once.

```js
// http callable function (adding a tutorial request)
exports.upvote = functions.https.onCall((data, context) => {
  // If user not logged in
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Only authenticated users can add tutorial requests'
    );
  }

  /*
  // BETTER: (toggle version + uses async to avoid nested Promises)
  // Get refs for user doc and request doc
  const user = admin.firestore().collection('users').doc(context.auth.uid);
  const request = admin.firestore().collection('requests').doc(data.id);

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

  // Add record to database
  return user.get().then(doc => {
    // Check user has not already upvoted
    if (doc.data().upvotedOn.includes(data.id)) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'You can only upvote a request once'
      );
    }
    // Update user array
    return userUpvote = user.update({
      upvotedOn: [...doc.data().upvotedOn, data.id]
    }).then(() => {
      // Update votes on request
      return request.update({
        upvotes: admin.firestore.FieldValue.increment(1)
      });
    });
  });
});
```

## 15. Upvoting Function (front-end)

We will upate the Vue instance to run a method call on button press and make
the requests ordered by votes.
```js
methods: {
    upvoteRequest(id) {
      const upvote = firebase.functions().httpsCallable('upvote');
      console.log(id)
      upvote({ id }).then(result => {
        console.log(result);
      }).catch(error => {
        console.log(error.message);
      });
    }
  },
  mounted() {
    const ref = firebase.firestore().collection('requests').orderBy('upvotes', 'desc');
    ref.onSnapshot(snapshot => {
      var requests = [];
      snapshot.forEach(doc => {
        requests.push({ ...doc.data(), id: doc.id });
      });
      this.requests = requests;
    });
  }
```

## 16. Error Notification

We will create a notification panel that drops down to show a message.

It will have a class `active` which applies CSS to transition it up and down
from the top of the page.

We will create a function which will open the notification which deactivates
after 3 seconds.
```js
// notification
const notification = document.querySelector('.notification');
const showNotification = message => {
  notification.textContent = message;
  notification.classList.add('active');
  setTimeout(() => {
    notification.classList.remove('active');
    notification.textContent = "";
  }, 3000);
}
```

We will use this for 'You cannot upvote more than once'.

## 17. Refactor to Upvote function to Async/Await

We can refactor the cloud function to use async/await syntax.
```js
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
```
