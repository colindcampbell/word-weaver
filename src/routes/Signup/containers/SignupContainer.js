import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  getFirebase,
  isLoaded,
  isEmpty,
  pathToJS
} from 'react-redux-firebase'
import { LOGIN_PATH } from 'constants'
import { UserIsNotAuthenticated } from 'utils/router'
// import * as firebaseui from 'firebaseui'
import './signup-container.css'
import { GAMES_PATH } from 'constants'
// import SignupForm from '../components/SignupForm'

// Initialize the FirebaseUI Widget using Firebase.


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
  // <div>
    // <span>
      // Already have an account?
    // </span>
    // <Link to={LOGIN_PATH}>
      // Login
    // </Link>
  // </div>
  // <button onClick={() => this.providerLogin('google')}>Google</button>
  providerLogin = (provider) => {
    return this.props.firebase.login({ provider })
  }

  // componentDidMount() {
  //   const ui = new firebaseui.auth.AuthUI(getFirebase().auth());
  //   this.ui = ui
  //   this.initFirebaseUI()
  //   getFirebase().auth().onAuthStateChanged((user) => {
  //     console.log(user)
  //     if (user) {
  //       getFirebase().login(user);
  //     }
  //   });    
  // }

  // componentWillUnmount(){
  //   this.ui.reset()
  // }

  render () {
    const { authError, firebase } = this.props
    return (
      <div>
        <div id="firebaseui-auth-container">
          <div className="firebaseui-container firebaseui-page-provider-sign-in firebaseui-id-page-provider-sign-in"><div className="firebaseui-card-content">
            <div>
              <ul className="firebaseui-idp-list">
                <li className="firebaseui-list-item">
                  <button onClick={() => this.providerLogin('google')} className="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-google firebaseui-id-idp-button">
                    <span className="firebaseui-idp-icon-wrapper">
                      <img className="firebaseui-idp-icon" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" />
                    </span>
                    <span className="firebaseui-idp-text firebaseui-idp-text-long">Sign in with Google</span>
                    <span className="firebaseui-idp-text firebaseui-idp-text-short">Google</span>
                  </button>
                  </li>
                  <li className="firebaseui-list-item">
                    <button className="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-password firebaseui-id-idp-button" >
                      <span className="firebaseui-idp-icon-wrapper">
                        <img className="firebaseui-idp-icon" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg" />
                      </span>
                      <span className="firebaseui-idp-text firebaseui-idp-text-long">Sign in with email</span>
                      <span className="firebaseui-idp-text firebaseui-idp-text-short">Email</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div id="loader">Loading...</div>
      </div>
    )
  }


}
  // initFirebaseUI = () => {
  //   // const { firebase } = this.props
  //   // const { router } = this.context
  //   var uiConfig = {
  //     signInSuccessUrl: '/games',
  //     signInOptions: [
  //       // Leave the lines as is for the providers you want to offer your users.
  //       getFirebase().auth.GoogleAuthProvider.PROVIDER_ID,
  //       // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  //       // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  //       // firebase.auth.GithubAuthProvider.PROVIDER_ID,
  //       // firebase.auth.EmailAuthProvider.PROVIDER_ID,
  //       // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  //     ],
  //     // Terms of service url.
  //     tosUrl: 'https://wordweaver.io'
  //   };
  //   console.log(this.ui)
  //   // The start method will wait until the DOM is loaded.
  //   this.ui.start('#firebaseui-auth-container', uiConfig);     
  // }
