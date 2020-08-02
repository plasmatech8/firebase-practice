import React, { useContext } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import Home from './Home'
import Login from './Login'
import SignUp from './SignUp'
import { AuthProvider, AuthContext } from './Auth'
import PrivateRoute from './PrivateRoute'


function Header() {
  const { currentUser } = useContext(AuthContext)
  return <p>{currentUser ? 'logged in' : 'not logged in'}</p>
}

function App() {
  return (
    <AuthProvider>
      <div>
        <Header />
        <Router>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </ul>
          <PrivateRoute exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={SignUp} />
        </Router>
      </div>
    </AuthProvider>
  )
}

export default App;
