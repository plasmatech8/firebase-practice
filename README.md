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

