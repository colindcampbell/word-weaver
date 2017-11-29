import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { firebaseConnect, isLoaded } from 'react-redux-firebase'
import { reduxFirebase as rfConfig } from 'config'
import { UserIsAuthenticated } from 'utils/router'
// import defaultUserImageUrl from 'static/User.png'
import LoadingSpinner from 'components/LoadingSpinner'
import AccountForm from '../components/AccountForm/AccountForm'
// import classes from './AccountContainer.scss'

@UserIsAuthenticated // redirect to /login if user is not authenticated
@firebaseConnect() // add this.props.firebase
@connect( // Map redux state to props
  ({ firebase: {auth, profile} }) => ({
    auth,
    profile
  })
)
export default class Account extends Component {
  static propTypes = {
    profile: PropTypes.object,
    auth: PropTypes.shape({
      uid: PropTypes.string
    }),
    firebase: PropTypes.shape({
      update: PropTypes.func.isRequired,
      logout: PropTypes.func.isRequired
    })
  }


  handleLogout = () => this.props.firebase.logout()

  updateAccount = (newData) =>
    this.props.firebase
      .update(`users/${this.props.auth.uid}`, newData)
      .catch((err) => {
        console.error('Error updating account', err) // eslint-disable-line no-console
        // TODO: Display error to user
      })

  render () {
    const { profile } = this.props

    if (!isLoaded(profile)) {
      return <LoadingSpinner />
    }

    return (
      <div>
        <div>
          <div>
            <img
              src={profile && profile.avatarUrl || 'https://cdn0.vox-cdn.com/images/verge/default-avatar.v989902574302a6378709709f7baab789b242ebbb.gif'}
              onClick={this.toggleModal}
            />
          </div>
          <div>
            <AccountForm
              initialValues={profile}
              account={profile}
              onSubmit={this.updateAccount}
            />
            <button onClick={this.handleLogout}>logout</button>
          </div>
        </div>
      </div>
    )
  }
}