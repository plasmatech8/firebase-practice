import React, { useState, useEffect } from 'react'
import app from './base'

export const AuthContext = React.createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)

  // On mount
  useEffect(() => app.auth().onAuthStateChanged(setCurrentUser), [])

  // When something changes
  useEffect(() => {
    if (currentUser)
      console.log('USER CHANGED TO ' + currentUser.displayName)
  }, [currentUser])

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

