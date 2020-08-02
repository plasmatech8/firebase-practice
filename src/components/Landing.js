import React from 'react'
import { FirebaseContext } from './Firebase';

function Landing() {
  return (
    <div>
      <FirebaseContext.Consumer>
        {firebase => {
          return (
            <div>
              I have access to Firebase and render something.
              {JSON.stringify(firebase)}
            </div>
          );
        }}
      </FirebaseContext.Consumer>
    </div>
  )
}

export default Landing
