# firebase-practice

Following [this tutorial](https://www.youtube.com/watch?v=q5J5ho7YUhA) by
Fireship.

## 01. Setup

* Ensure node is installed (i.e. with nvm)
* Create Firebase project

## 02. Basic Connection

Create a Firebase web app and copy the code snippets into your public
index.html code.

You should be able to console log firebase as a global variable.
```js
console.log(firebase);
```

## 03. Firebase CLI

You can install using: `sudo npm install firebase-tools -g`

Login with the CLI: `firebase login`

Initialise the repo: `firebase init`
* Hosting is for deploying a front-end application (i.e. React)
* Emulators is for local testing without pushing code to the internet
* This will create a gitignore, firebase.json, firebaserc, and can create a starter index.html if we want

Serve the app locally using either: `firebase serve` or `firebase emulators:start`

Deploy the app using: `firebase deploy`
* This will upload the public folder to a storage bucket and host it at a provided URL on the public internet (i.e. https://marioplan-52689.web.app/)
* We can view all the versions of our deployments in the Firebase console and we can add our custom domains

### 04. Authentication

Enable authentication on Firebase.

Make sure you add the CDN link to auth in the `index.html`.

```js
const auth = firebase.auth();

// Get elements
const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');
const signOutBtn = document.getElementById('signOutBtn');
const signInBtn = document.getElementById('signInBtn');
const userDetails = document.getElementById('userDetails');

// Providers (i.e. facebook, email, etc)
const provider = new firebase.auth.GoogleAuthProvider();

signInBtn.onclick = () => auth.signInWithPopup(provider);
signOutBtn.onclick = () => auth.signOut();
auth.onAuthStateChanged(user => {
  if (user) {
    whenSignedIn.hidden = false;
    whenSignedOut.hidden = true;
    userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3><p>UID: ${user.uid}</p>`
  } else {
    whenSignedIn.hidden = true;
    whenSignedOut.hidden = false;
    userDetails.innerHTML = `Not logged in`
  }
});
```

When you sign-in, notice in your browser storage that there is data in
`IndexedDB/firebaseLocalStorageDb/firebaseLocalStorage`.
* It contains user information until the signout button is pressed.
* You can also see the user in the auth dashboard.

You can run a callback method on `auth` whenever the user logs in/out.


![](docs/2020-07-30-16-43-19.png)

## 05. Firestore

Firebase provides 2 NoSQL databases:
* Realtime Database
* Cloud Firestore

Firestore tends to be better for most use-cases.

Firestore can be syncronised by default between our frontend and backend
without any extra effort.

```js
const db = firebase.firestore();

const createThing = document.getElementById('createThing');
const thingsList = document.getElementById('thingsList');

let thingsRef;
let unsubscribe;

auth.onAuthStateChanged(user => { // Only show list when user is logged in
  if (user) {
    thingsRef = db.collection('things');

    createThing.onclick = () => { // Add a new record on click
      const { serverTimestamp } = firebase.firestore.FieldValue;
      thingsRef.add({
        uid: user.uid,
        name: Math.random().toString(36).substring(7),
        createdAt: serverTimestamp() // (use firebase timestamp as Date format can differ by device)
      });
    }

    unsubscribe = thingsRef // Firestore reference returns a function for unsubscribing
      .where('uid', '==', user.uid)
      .onSnapshot(querySnapshot => {
        const items = querySnapshot.docs.map(doc => {
          return `<li>${doc.data().name}</li>`
        });
        thingsList.innerHTML = items.join(''); // update dom with items
      });
  } else {
    unsubscribe && unsubscribe(); // Unsubscribe when no logged in
  }
});
```

We can use compound queries such as `thingsRef.where(...).orderBy(...)`.

In order to scale, some queries need a composite index.

## 06. Security

The problem is that any user or anyone on the internet can  view the database
records.

We need to implement database security rules.

By default, it allows full access for one month: `allow read, write: if request.time < timestamp.date(2020, 8, 28);`

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /{document=**} {
      allow read, write: if false;
    }

    match /things/{docId} {
      allow write: if request.auth.uid == request.resource.data.uid;
      allow read: if request.auth.uid == resource.data.uid;
    }
  }
}
```
Actions:
* Deny all read and write
* Allow write if (UID of logged in user) == (UID in the record to write)
  * Prevents documents to be created by other users
* Allow read if (UID of logged in user) == (UID of the records to read)

Notes:
* `{docId}` is a wildcard that allows using a reference to the value

Now we have an application where:
* We must be logged in to write records
* We must be logged in to read records
* We can only read our own records

