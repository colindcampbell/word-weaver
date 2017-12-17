import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  isLoaded,
  isEmpty
} from 'react-redux-firebase'

export default class Player extends Component {
  render() {
    const { profile, id, playerGame, isFirst, roundAvailable, roundScoreDuo, totalScoreDuo, gameMode } = this.props
    const notification = !isEmpty(playerGame.notification) && playerGame.notification.text !== '' &&
      playerGame.notification.text
    if (gameMode === 'duo-coop' && !isFirst) {
      return (
        <div className="posr" style={{height:38,width:1}}>
          <div className="posa" style={{padding:4,top:0,right:0,transform:"translateY(-100%)",whiteSpace:"nowrap",textAlign:"right"}}>
            <div style={styles.playerName}>{profile.userName}</div>
            <div style={Object.assign({},{color:playerGame.color},styles.notification)}>{ notification }</div>        
          </div>
        </div>)
    }
    let widthScore = gameMode === 'solo' ? playerGame.roundScore : gameMode === 'duo-vs' ? playerGame.score : roundScoreDuo
    let widths = this.getWidths(gameMode,widthScore,totalScoreDuo,roundAvailable),
        maxWidth = widths[0],
        minWidth = widths[1],
        width = widths[2]
    return ( 
      <div className="posr" style={{minWidth:minWidth,maxWidth:maxWidth,height:38,transition:"300ms",width:width ? width : "auto"}}>
        {isFirst && (
        <div className="posa" style={{padding:4,top:0,transform:"translateY(-100%)",whiteSpace:"nowrap"}}>
          <div style={styles.totalScore}>{gameMode !== 'duo-vs' ? `Total: ${gameMode === 'solo' ? playerGame.score : totalScoreDuo}` : `${profile.userName}`}</div>
          {gameMode === 'duo-coop' && (<div style={styles.playerName}>{profile.userName}</div>)}
          <div style={Object.assign({},{color:playerGame.color},styles.notification)}>{ notification }</div>
        </div>
        )}
        {!isFirst && (
        <div className="posa" style={{padding:4,top:0,right:0,transform:"translateY(-100%)",whiteSpace:"nowrap",textAlign:"right"}}>
          <div style={styles.playerName}>{ profile.userName }</div>
          <div style={Object.assign({},{color:playerGame.color},styles.notification)}>{ notification }</div>
        </div>
        )}
        <div key={id} className={gameMode === 'duo-coop' ? "df aic jcsb bg-grad-primary" : "df aic jcsb"} style={{textAlign:"left",padding:3,background:gameMode !== 'duo-coop' && playerGame.color}} >
          {isFirst && gameMode !== 'duo-coop' && (<img src={ profile.avatarUrl } style={{width:32,height:32,borderRadius:2,marginRight:5}}/>)}
          {isFirst && gameMode === 'duo-coop' && (<div></div>)}
          <h3 style={{margin:"0 5px",color:"#ffffff",fontSize:32,lineHeight:"32px"}}>{ widthScore }</h3>
          {!isFirst && gameMode !== 'duo-coop' && (<img src={ profile.avatarUrl } style={{width:32,height:32,borderRadius:2,marginLeft:5}}/>)}
        </div>
      </div>
    )
  }

  getWidths = (gameMode,score,totalScoreDuo,roundAvailable) => {
    let width, maxWidth, minWidth
    switch(gameMode){
      case 'solo':
        width = false
        minWidth = (score / roundAvailable)*100 + "%"
        maxWidth = "none"
        break
      case 'duo-coop':
        width = false
        minWidth = (score / roundAvailable)*100 + "%"
        maxWidth = "none"
        break
      case 'duo-vs':
        maxWidth = "calc(100% - 100px)"
        width = totalScoreDuo === 0 ? "50%" : `${(score / totalScoreDuo)*100}%`
        minWidth = 100
        break
    }
    return [maxWidth, minWidth, width]
  }
}


const styles = {
  notification:{
    fontWeight:"bold",
    fontSize:18,
    letterSpacing:"-.5px"
  },
  playerName:{
    fontWeight:"bold",
    fontSize:22,
    letterSpacing:"-1px",
    color:"#456"
  },
  totalScore:{
    fontWeight:"bold",
    fontSize:26,
    letterSpacing:"-1px",
    marginBottom:5
  }  
}

Player.propTypes = {
  profile     : PropTypes.object.isRequired,
  playerGame  : PropTypes.object.isRequired
}