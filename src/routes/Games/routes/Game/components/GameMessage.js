import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { GAMES_PATH } from 'constants'
import { Link } from 'react-router'
import LoadingSpinner from 'components/LoadingSpinner'
import {
  isLoaded,
  isEmpty
} from 'react-redux-firebase'

export default class GameMessage extends Component {
  render() {
    const { gameOver, open, mode, loading, roundFinished, ready, roundTimer, preRoundTimer, winner, color,round, playerReady, score, totalScoreDuo } = this.props

    if (loading) {
      return (
        <div className="df aic acc jcc fww" style={styles.message}>
          <LoadingSpinner />
        </div>)
    }

    return (
      <div className="df aic acc jcc fww tww" style={styles.message}>
        {open && 
          (<div>Waiting for another player to join</div>)
        }
        {gameOver && 
         mode === 'duo-vs' &&
          (<div style={{textAlign:"center"}}>
            <div style={{width:"100%",marginBottom:10}}>{`The winner is ${winner}!`}</div>
            <Link to={GAMES_PATH} className="button" style={Object.assign( {}, styles.button, {color:"#ffffff",background:color} )}>
              Game Lobby
            </Link>
          </div>)
        }
        {gameOver && 
         mode !== 'duo-vs' &&
          (<div style={{textAlign:"center"}}>
            <div style={{width:"100%",marginBottom:10}}>{`Game Over! Final Score: ${mode === 'solo' ? score : totalScoreDuo}`}</div>
            <Link to={GAMES_PATH} className="button" style={Object.assign( {}, styles.button, {color:"#ffffff",background:color} )}>
              Game Lobby
            </Link>
          </div>)
        }
        {preRoundTimer === 0 && 
         roundTimer === 0 &&
         ready === false &&
         roundFinished === true &&
         !gameOver &&
          (<div>
            <div style={{width:"100%",textAlign:"center",marginBottom:10}}>{`Are you ready for round ${round + 2}?`}</div>
            <div className="button" onClick={playerReady.bind(this)} style={Object.assign( {}, styles.button, {background:color} )}>Ready!</div>
          </div>)
        }
        {preRoundTimer === 0 && 
         roundTimer === 0 &&
         ready === true &&
         roundFinished === true &&
         mode !== 'solo' &&
         !gameOver &&
          (<div>Waiting for the other player</div>)
        }
        {preRoundTimer > 0 && 
         !open &&
         !gameOver &&
          (<div>Round starts in {preRoundTimer}</div>)}
      </div>
    )
  }
}

const styles = {
  message:{
    color:'#456',
    fontSize:28,
    height:120,
    fontWeight:"bold",
    letterSpacing:"-1px"
  },
  button:{
    padding:"8px 32px",
    margin:"0 auto 10px"
  }  
}

// GameMessage.propTypes = {
//   profile     : PropTypes.object.isRequired,
//   playerGame  : PropTypes.object.isRequired
// }