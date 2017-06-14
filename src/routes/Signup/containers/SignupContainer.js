import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  isLoaded,
  isEmpty,
  pathToJS
} from 'react-redux-firebase'
import { LOGIN_PATH } from 'constants'
import { UserIsNotAuthenticated } from 'utils/router'
// import SignupForm from '../components/SignupForm'

@UserIsNotAuthenticated // redirect to list page if logged in
@firebaseConnect() // add this.props.firebase
@connect( // map redux state to props
  ({firebase}) => ({
    authError: pathToJS(firebase, 'authError')
  })
)
export default class Signup extends Component {
  static propTypes = {
    firebase: PropTypes.object,
    authError: PropTypes.object
  }

  // handleSignup = (creds) => {
  //   const { createUser, login } = this.props.firebase
  //   const { email, username } = creds
  //   this.setState({ snackCanOpen: true })
  //   // create new user then login (redirect handled by decorator)
  //   return createUser(creds, { email, username })
  //     .then(() => login(creds))
  // }

  providerLogin = (provider) => {
    return this.props.firebase.login({ provider })
  }

  render () {
    const { authError } = this.props

    return (
      <div>
        <div>
          <button onClick={() => this.providerLogin('google')}>Google</button>
        </div>
        <div>
          <span>
            Already have an account?
          </span>
          <Link to={LOGIN_PATH}>
            Login
          </Link>
        </div>
      </div>
    )
  }
}