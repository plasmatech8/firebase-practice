console.log(firebase);

// Auth

const auth = firebase.auth();

const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');
const signOutBtn = document.getElementById('signOutBtn');
const signInBtn = document.getElementById('signInBtn');
const userDetails = document.getElementById('userDetails');

const provider = new firebase.auth.GoogleAuthProvider(); // Providers (i.e. facebook, email, etc)

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

// Firestore

const db = firebase.firestore();

const createThing = document.getElementById('createThing');
const thingsList = document.getElementById('thingsList');

let thingsRef;
let unsubscribe;

auth.onAuthStateChanged(user => { // Only show list when user is logged in
  if (user) {
    thingsRef = db.collection('things');

    createThing.onclick = () => {
      const { serverTimestamp } = firebase.firestore.FieldValue;
      thingsRef.add({
        uid: user.uid,
        name: Math.random().toString(36).substring(7),
        createdAt: serverTimestamp() // use firebase timestamp because Date format can differ depending on device
      });
    }

    unsubscribe = thingsRef // Firestore reference returns a function for unsubscribing
      .where('uid', '==', user.uid)
      .onSnapshot(querySnapshot => {
        const items = querySnapshot.docs.map(doc => {
          return `<li>${doc.data().name}</li>`
        });
        thingsList.innerHTML = items.join('');
      });
  } else {
    createThing.onclick = null;
    unsubscribe && unsubscribe();
  }
});

