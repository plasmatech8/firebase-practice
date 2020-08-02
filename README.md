# Tutorial

Following [tutorial](https://www.robinwieruch.de/complete-firebase-authentication-react-tutorial#react-application-setup-create-react-app).

## 01. Setting up pages, firebase, and React-Context

`constants/Routes.js` contains route path strings for each page.

`components/Navigation.js` contains the navigation links for the app.

`components/App.js` contains the routes.

`components/Firebase/*` will provide a class to initialise Firebase object, and
a React Context to provide the object to subcomponents.

=====


I personally feel that it can be simplified to:
```
src
├── App.js
├── index.js
├── store.js or context.js
├── constants.js
│
├── assets
│   └── etc...
├── components
│   └── etc...
├── pages
│   └── etc...
```

Just use zustand for state management in store.js:
```js
import create from 'zustand'

const [useStore] = create(set => ({
  count: 0,
  increase: () => set(state => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 })
}))
```

Just use the firebase object (instead of using a class).

Then pass to the zustand store in store.js (instead of React Context).

I will need to check if this is truly appropriate.
```js
import firebase from "firebase/app";

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
});
firebase.analytics()
// Add to store
```

Routing can also be done in App.js
