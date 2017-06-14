import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { firebaseConnect, pathToJS, isLoaded } from 'react-redux-firebase'
import { reduxFirebase as rfConfig } from 'config'
import { UserIsAuthenticated } from 'utils/router'
// import defaultUserImageUrl from 'static/User.png'
import LoadingSpinner from 'components/LoadingSpinner'
import AccountForm from '../components/AccountForm/AccountForm'
// import classes from './AccountContainer.scss'

@UserIsAuthenticated // redirect to /login if user is not authenticated
@firebaseConnect() // add this.props.firebase
@connect( // Map redux state to props
  ({ firebase }) => ({
    auth: pathToJS(firebase, 'auth'),
    account: pathToJS(firebase, 'profile')
  })
)
export default class Account extends Component {
  static propTypes = {
    account: PropTypes.object,
    auth: PropTypes.shape({
      uid: PropTypes.string
    }),
    firebase: PropTypes.shape({
      update: PropTypes.func.isRequired,
      logout: PropTypes.func.isRequired
    })
  }


  handleLogout = () => this.props.firebase.logout()

  // toggleModal = () => {
  //   this.setState({
  //     modalOpen: !this.state.modalOpen
  //   })
  // }

  updateAccount = (newData) =>
    this.props.firebase
      .update(`${rfConfig.userProfile}/${this.props.auth.uid}`, newData)
      .catch((err) => {
        console.error('Error updating account', err) // eslint-disable-line no-console
        // TODO: Display error to user
      })

  render () {
    const { account } = this.props

    if (!isLoaded(account)) {
      return <LoadingSpinner />
    }

    return (
      <div>
        <div>
          <div>
            <img
              src={account && account.avatarUrl || 'https://cdn0.vox-cdn.com/images/verge/default-avatar.v989902574302a6378709709f7baab789b242ebbb.gif'}
              onClick={this.toggleModal}
            />
          </div>
          <div>
            <AccountForm
              initialValues={account}
              account={account}
              onSubmit={this.updateAccount}
            />
            <button onClick={this.handleLogout}>logout</button>
          </div>
        </div>
      </div>
    )
  }
}