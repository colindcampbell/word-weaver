import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  isLoaded,
  isEmpty
} from 'react-redux-firebase'

export default class Player extends Component {
  render() {
    const { profile, id, playerGame } = this.props
    const notification = !isEmpty(playerGame.notification) && playerGame.notification.text !== '' &&
      playerGame.notification.text
    return (
      <div key={id} style={{textAlign:"left",display:"flex",width:"100%",marginBottom:10}} >
        <img src={ profile.avatarUrl } style={{width:80,height:80,borderRadius:10,border:`4px solid ${playerGame.color}`,marginLeft:10,marginRight:10}}/>
        <div style={{flex:1}}>
          <h3>{ profile.displayName }</h3>
          <h3>{ !isEmpty(playerGame) ? playerGame.score : 'Loading Score...' }</h3>
          <div style={{color:playerGame.color,fontWeight:"bold",position:"relative"}}>
            { notification }
          </div>
        </div>
      </div>
    )
  }
}

Player.propTypes = {
  profile     : PropTypes.object.isRequired,
  playerGame  : PropTypes.object.isRequired
}