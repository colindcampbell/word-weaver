import React, { Component, PropTypes } from 'react'
import { IndexLink, Link } from 'react-router'
import './Header.scss'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  pathToJS,
  isLoaded,
  isEmpty
} from 'react-redux-firebase'
import {
  ACCOUNT_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  GAMES_PATH
} from 'constants'

@firebaseConnect()
@connect(
  ({ firebase: { auth, authError, profile } }) => ({
    authError,
    auth,
    profile
  })
)
export default class Header extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  static propTypes = {
    account: PropTypes.object,
    firebase: PropTypes.object.isRequired
  }

  render(){
    const { profile } = this.props
    const accountExists = isLoaded(profile) && !isEmpty(profile)
    const accountLink = accountExists ? 
      (<Link to={ACCOUNT_PATH} activeClassName='route--active'>
        Account
       </Link>) : null
    return(
      <div className="posr" style={{zIndex:2}}>
        <IndexLink to='/' activeClassName='route--active'>
          Home
        </IndexLink>
        {' · '}
        <Link to={GAMES_PATH} activeClassName='route--active'>
          Game Lobby
        </Link>
        {' · '}
        {accountLink}     
      </div>
    )
  }
}
