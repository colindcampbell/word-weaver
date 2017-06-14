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
  ({ firebase }) => ({
    authError: pathToJS(firebase, 'authError'),
    auth: pathToJS(firebase, 'auth'),
    account: pathToJS(firebase, 'profile')
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
    const { account } = this.props
    const accountExists = isLoaded(account) && !isEmpty(account) 
    return(
      <div>
        <IndexLink to='/' activeClassName='route--active'>
          Home
        </IndexLink>
        {' · '}
        <Link to='/counter' activeClassName='route--active'>
          Counter
        </Link>
        {' · '}
        <Link to={accountExists ? ACCOUNT_PATH : SIGNUP_PATH} activeClassName='route--active'>
          {accountExists ? 'Account' : 'Signup'}
        </Link>    
        {' · '}
        <Link to={GAMES_PATH} activeClassName='route--active'>
          Game Lobby
        </Link>    
      </div>
    )
  }
}
