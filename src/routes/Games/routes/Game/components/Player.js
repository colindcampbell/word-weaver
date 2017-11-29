import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  isLoaded,
  isEmpty
} from 'react-redux-firebase'

export default class Player extends Component {
  render() {
    const { profile, id, playerGame, isFirst, totalScore } = this.props
    const notification = !isEmpty(playerGame.notification) && playerGame.notification.text !== '' &&
      playerGame.notification.text
    let width = totalScore === 0 ? "50%" : (playerGame.score / totalScore)*100 + "%"
    return (
      <div className="posr" style={{width:width,minWidth:260,maxWidth:"calc(100% - 260px)",transition:"300ms"}}>
        {isFirst && (
        <div className="df jcsb fww" style={{paddingRight:8}}>
          <div style={styles.playerName}>{ profile.displayName }</div>
          <div style={Object.assign({},{color:playerGame.color},styles.notification)}>{ notification }</div>
        </div> 
        )}
        {!isFirst && (
        <div className="df jcsb fww" style={{paddingLeft:8}}>
          <div style={Object.assign({},{color:playerGame.color},styles.notification)}>{ notification }
          </div>
          <div style={styles.playerName}>{ profile.displayName }</div>
        </div> 
        )}
        <div key={id} className="df aic jcsb" style={{textAlign:"left",padding:3,background:playerGame.color}} >
          {isFirst && (<img src={ profile.avatarUrl } style={{width:32,height:32,borderRadius:2,marginRight:5}}/>)}
          <h3 style={{margin:"0 5px",color:"#ffffff",fontSize:32,lineHeight:"32px"}}>{ !isEmpty(playerGame) ? playerGame.score : 'Loading Score...' }</h3>
          {!isFirst && (<img src={ profile.avatarUrl } style={{width:32,height:32,borderRadius:2,marginLeft:5}}/>)}        
        </div>
      </div>
    )
  }
}

const styles = {
  notification:{
    fontWeight:"bold",
    fontSize:18,
    letterSpacing:"-.5px"
  },
  playerName:{
    fontSize:20,
    letterSpacing:"-1px"
  }
}

Player.propTypes = {
  profile     : PropTypes.object.isRequired,
  playerGame  : PropTypes.object.isRequired
}