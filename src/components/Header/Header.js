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
  ({ firebase: { auth, authError, profile }}) => ({
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
    const { profile, auth } = this.props
    const accountExists = isLoaded(profile) && !isEmpty(profile)
    if(this.context.router.location.pathname === "/"){
      return(<div></div>)
    }
    const accountLink = accountExists ? 
      (<Link to={ACCOUNT_PATH} className="df aic fwb" style={{fontSize:19,letterSpacing:"-1px"}}>
        {profile.userName}<img src={ profile.avatarUrl } style={{width:28,height:28,borderRadius:2,marginLeft:8}} />
       </Link>) : (<Link to={ACCOUNT_PATH} className="df aic fwb" style={{fontSize:19,letterSpacing:"-1px"}}>
        Account
       </Link>)
    return(
      <div>
        <IndexLink to={GAMES_PATH} className="posf" style={{left:6,top:6,zIndex:2}}>
          <img src={require('../../assets/wordweaver-logo.svg')} style={{height:40}} alt="WordWeaver"/>
        </IndexLink>
        <div className="posf df aic" style={{right:6,top:6,zIndex:2,height:30}}>
          <div style={{marginRight:8,marginTop:4}} onCLick={this.updateAccount.bind(this, {sound:!profile.sound})}>
            {profile.sound ? (<img src={require('../../assets/sound-on.svg')} style={{width:26}} alt="Sound On"/>) : (<img src={require('../../assets/sound-off.svg')} style={{width:24}} alt="Sound On"/>) }
          </div>
          {accountLink}
        </div>   
      </div>
    )
  }

  updateAccount = (newData) =>
    this.props.firebase
      .update(`users/${this.props.auth.uid}`, newData)
      .catch((err) => {
        console.error('Error updating account', err) // eslint-disable-line no-console
        // TODO: Display error to user
      })  
}
