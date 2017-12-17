import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { WORD_BANK_PATH, WORD_PATH, GAMES_PATH, GAME_PLAYERS_PATH, GAME_ROUNDS_PATH } from 'constants'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  populate,
  isLoaded,
  isEmpty
} from 'react-redux-firebase'

import { UserIsAuthenticated } from 'utils/router'
import { getRandomNumber, shuffleLetters } from 'utils/helpers'
import LoadingSpinner from 'components/LoadingSpinner'
import Player from '../components/Player'
import GameMessage from '../components/GameMessage'
// import Radium from 'radium'
import './game-container.scss'
var Sound = require('react-sound').default;

const populates = [
  { child: 'players', root: 'users', keyProp: 'uid' },
  { child: 'createdBy', root: 'users', keyProp: 'uid' },
  { child: 'currentGamePlayers', root: 'gamePlayers', keyProp: 'gameid'},
  { child: 'currentGameRound', root: 'gameRounds'}
]

@UserIsAuthenticated
// @Radium
@firebaseConnect(
  ({params}) => {
    return [
      { path:`${GAMES_PATH}/${params.gameid}`, populates },
    ]
  }
)
@connect(
  ({firebase,firebase:{profile}}, {params}) => {
  return {
    currentGame: populate(firebase, `${GAMES_PATH}/${params.gameid}`, populates),
    profile
  }}
)
export default class GameContainer extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  static propTypes = {
    currentGame: PropTypes.object,
    // currentGameRound: PropTypes.array,
    // currentPlayers: PropTypes.object
    firebase: PropTypes.object,
    auth: PropTypes.object,
    params: PropTypes.object
  }

  componentWillMount() {
    const { currentGame, auth } = this.props
    this.setState({
      keyword:false,
      shuffled:'LOADING',
      guess:'',
      currentPlayerKey:false
    })
    if (isLoaded(currentGame) && 
        !isEmpty(currentGame.currentGameRound) && 
        !isEmpty(currentGame.currentGamePlayers) ){
      const { currentGameRound } = currentGame,
            currentRound = currentGameRound[Object.keys(currentGameRound)[0]],
            { currentGamePlayers } = currentGame
      let currentPlayerKey = false
      Object.keys(currentGamePlayers).forEach(player => {
        if (currentGamePlayers[player].hasOwnProperty(auth.uid)) {
          currentPlayerKey = player
        }
      })
      this.setState({
        keyword: currentRound.keyword,
        shuffled: currentRound.shuffled,
        currentPlayerKey: currentPlayerKey,
        scoreSet:false,
        successSound: false,
        tickSound: false,
        errorSound: false,
        shuffleSound: false,
        greatSuccessSound: false,
        gameOverSound: false
      })
    }
  }

  componentWillReceiveProps(nextProps){
    const { currentGame, auth } = nextProps
    if (isLoaded(currentGame) && 
        !isEmpty(currentGame.currentGameRound) && 
        !isEmpty(currentGame.currentGamePlayers) ){
      const { currentGameRound } = currentGame,
            currentRound = currentGameRound[Object.keys(currentGameRound)[0]],
            { currentGamePlayers } = currentGame
      // Update the jumbled letters when the first round loads or a new round loads
      if (this.state.keyword === false || this.state.keyword !== currentRound.keyword) {
        this.setState({
          keyword: currentRound.keyword,
          shuffled: currentRound.shuffled,
          guess:''
        })
      }
      // Set this.state.currentPlayerKey from currentGamePlayers to know the gamePlayer of the current user
      if (this.state.currentPlayerKey === false && 
        Object.keys(currentGame.players).length === Object.keys(currentGame.currentGamePlayers).length) {
        let currentPlayerKey = ''
        Object.keys(currentGamePlayers).forEach(player => {
          if (currentGamePlayers[player].hasOwnProperty(auth.uid)) {
            currentPlayerKey = player
          }
        })
        this.setState({
          currentPlayerKey: currentPlayerKey
        })
      }
      // Start of first round after the pre round countdown reaches 0. These will only run for the game creator.
      if (!currentGame.open && 
        currentGame.preRoundTimer > 0 && 
        auth.uid === currentGame.createdBy.uid) {
        const { firebase:{update}, params:{gameid} } = this.props
        if (currentGame.mode !== 'duo-vs' && currentGamePlayers[this.state.currentPlayerKey].roundScore > 0) {
          // TODO: Update all players
          Object.keys(currentGamePlayers).forEach(key => {
            if (currentGamePlayers[key].roundScore > 0) {
              update(`${GAME_PLAYERS_PATH}/${key}`, {roundScore:0}).catch(e => { console.log(e) })
            }
          })
        }
        setTimeout(() => { 
          currentGame.preRoundTimer < 6 && this.setState({tickSound:true})
          update(`${GAMES_PATH}/${gameid}`, {preRoundTimer:currentGame.preRoundTimer - 1})
        }, 980);
      }
      // Countdown during the playing round
      if (!currentGame.open && 
        currentGame.roundTimer > 0 && 
        currentGame.preRoundTimer === 0 && 
        auth.uid === currentGame.createdBy.uid) {
        const { firebase:{update}, params:{gameid} } = this.props
        currentGame.roundTimer < 6 && this.setState({tickSound:true})
        setTimeout(() => { 
          update(`${GAMES_PATH}/${gameid}`, {roundTimer:currentGame.roundTimer - 1})
        }, 980);
      }
      // End of Round
      if (!currentGame.open && 
        currentGame.roundTimer === 0 && 
        currentGame.preRoundTimer === 0 && 
        // currentGame.round === this.props.currentGame.round &&
        auth.uid === currentGame.createdBy.uid) {
        const { firebase:{update}, params:{gameid} } = this.props
        if (!currentGame.roundFinished) {
          update(`${GAMES_PATH}/${gameid}`, {roundFinished:true,loading:true}).catch(e => {
            console.log(e)
          })
        }
      }
      // End of Game
      if (currentGame.gameOver && !this.state.scoreSet) {
        const { firebase:{update}, params:{gameid} } = this.props
        this.setState({scoreSet:true})
        if(currentGame.mode === 'duo-vs'){
          this.endVsGame(update,gameid,currentGame)
        }else{
          const totalScore = currentGame.gameMode === 'solo' ? currentGamePlayers[this.state.currentPlayerKey].score : this.getTotalScoreDuo(currentGamePlayers)
          this.endStandardGame(update,gameid,totalScore)
        }
      }
    }
  }

  componentDidMount(){
    document.body.addEventListener('keydown', this.keydownEventListener)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.keydownEventListener)
    const { currentGame, params:{gameid} } = this.props
    if (currentGame.open || currentGame.mode === 'solo') {
      this.closeGame(gameid)
    }
  }

  render(){
    const { currentGame, auth, games, params:{gameid}, notification } = this.props
    const { guess, shuffled, currentPlayerKey } = this.state

    if (!isLoaded(currentGame) || 
      isEmpty(currentGame) || 
      isEmpty(currentGame.currentGamePlayers) || 
      isEmpty(currentGame.currentGameRound) ) {
      return (
        <div className="posf" style={{top:0,bottom:0,left:0,right:0}}>
          <LoadingSpinner />
        </div>
      )
    }

    const { currentGameRound, currentGamePlayers } = currentGame,
          currentRound = currentGameRound[Object.keys(currentGameRound)[0]],
          keywordLetters = currentRound.keyword.split(''),
          letterStyles = this.getLetterStyles(shuffled, guess), letterCount = {}

    // Total points scored for 2 player games
    let totalScoreDuo = currentGame.mode === 'duo-vs' || 'duo-coop' ? 
      this.getTotalScoreDuo(currentGamePlayers) : false

    // Round points scored for 2 player games
    let roundScoreDuo = currentGame.mode === 'duo-coop' ? 
      Object.keys(currentGamePlayers).reduce((accum, key) => {
        accum += currentGamePlayers[key].roundScore
        return accum
      },0) : false

    const players = !isEmpty(currentGame.players) && !isEmpty(currentGame.currentGamePlayers) && Object.keys(currentGame.players).length === Object.keys(currentGame.currentGamePlayers).length &&
      Object.keys(currentGame.players)
      .filter(authid => 
        currentGame.players.hasOwnProperty(authid) && 
        !isEmpty(currentGame.players[authid]))
      .map((authid,index) => 
        (<Player
          key={authid} id={authid}
          isFirst={index % 2 === 0}
          totalScoreDuo={totalScoreDuo}
          roundScoreDuo={roundScoreDuo}
          roundAvailable={currentRound.total}
          gameMode={currentGame.mode}
          playerGame={
            currentGame.currentGamePlayers[Object.keys(currentGame.currentGamePlayers)
            .filter(gp => currentGame.currentGamePlayers[gp].hasOwnProperty(authid))[0]]}
          profile={currentGame.players[authid]} />)
      )

    const gameMessage = !isEmpty(currentGame.players) && 
      !isEmpty(currentGame.currentGamePlayers) && 
      (<GameMessage 
        gameOver={currentGame.gameOver}
        open={currentGame.open}
        mode={currentGame.mode}
        loading={currentGame.loading}
        roundFinished={currentGame.roundFinished}
        ready={currentGame.hasOwnProperty('ready') ? currentGame.ready[auth.uid] : false}
        roundTimer={currentGame.roundTimer}
        preRoundTimer={currentGame.preRoundTimer}
        winner={currentGame.winner}
        color={currentGamePlayers[currentPlayerKey].color}
        round={currentGame.round}
        playerReady={this.playerReady}
        totalScoreDuo={totalScoreDuo}
        score={currentGame.currentGamePlayers[currentPlayerKey].score}
      />)

    const tickSound = (<Sound
      url="/tick.mp3"
      playStatus={Sound.status.PLAYING}
      onFinishedPlaying={this.handleSoundEnd.bind(this, 'tickSound')}
    />)

    const gameOverSound = (<Sound
      url="/game-over.mp3"
      playStatus={Sound.status.PLAYING}
      onFinishedPlaying={this.handleSoundEnd.bind(this, 'gameOverSound')}
    />)

    const successSound = (<Sound
      url="/success-retro.mp3"
      playStatus={Sound.status.PLAYING}
      onFinishedPlaying={this.handleSoundEnd.bind(this, 'successSound')}
    />)

    const errorSound = (<Sound
      url="/error-retro.mp3"
      playStatus={Sound.status.PLAYING}
      onFinishedPlaying={this.handleSoundEnd.bind(this, 'errorSound')}
    />)

    const greatSuccessSound = (<Sound
      url="/great-success-retro.mp3"
      playStatus={Sound.status.PLAYING}
      onFinishedPlaying={this.handleSoundEnd.bind(this, 'greatSuccessSound')}
    />)

    const shuffleSound = (<Sound
      url="/shuffle.mp3"
      playStatus={Sound.status.PLAYING}
      volume={60}
      onFinishedPlaying={this.handleSoundEnd.bind(this, 'shuffleSound')}
    />)            

    return(
      <div className="m0a">
        <div className="posr" style={{height:"calc(100vh - 198px)",overflowY:"auto"}}>
          <div className="df fww acc fdc jcfe aifs h100 ovfs posa word-column" style={{maxHeight:860,bottom:0,right:0,left:0}}>
            {
              !isEmpty(currentRound.bank) && Object.keys(currentRound.bank)
              .map(key => (
                <div key={key} className="df word-container">
                {
                  currentRound.bank[key].word.split('')
                    .map((letter,index) => (
                      <div key={key+letter+index} className="tac posr vam bank-letter-container">
                        <span className="posa letter-mask"></span>
                        {
                          ( currentRound.taken[key] && currentRound.taken[key].word === currentRound.bank[key].word ) ? 
                          (<div>
                              <span className="posa letter-bg" style={{backgroundColor:currentRound.taken[key].color}}></span>
                              <span className="posa bank-letter">{letter.toUpperCase()}</span>
                            </div>) : 
                          (<span className="posa letter-mask"></span>)
                        }
                      </div>
                    )
                  )
                }
                </div>
              ))
            }
          </div>
        </div>
        {(currentGame.preRoundTimer > 0 || currentGame.gameOver || currentGame.open || currentGame.loading || currentGame.roundFinished) && gameMessage}
        {!currentGame.roundFinished && 
         currentGame.roundTimer > 0 &&
         currentGame.preRoundTimer === 0 &&
         !currentGame.gameOver &&
         (<div className="posr tal m0a" style={{width:290,height:120}}>
            {keywordLetters.map((letter, index) => {
              !letterCount.hasOwnProperty(letter) ? letterCount[letter] = 0 : letterCount[letter]++
              return(
                <section 
                  key={letter+index+"guess"}
                  className="guess-letter-container posa"
                  style={letterStyles[letter][letterCount[letter]].style}
                  //onMouseDown={ this.onLetterTap.bind(this, letter) } 
                  >
                  <div className="cube tac posa db ttuc w100 h100">{letter}</div>
                </section>
              )}
            )}
          </div>
        )}
        <div className="posr m0a w100" style={{maxWidth:"1200px"}}>
        {currentGame.mode === 'duo-vs' &&
          (<div className="posa w100" style={{zIndex:1,bottom:2}}>
            <div style={{width:"calc(50% + 2px)",borderRight:"4px solid rgba(255,255,255,.3)",height:36}}></div>
          </div>)
        }
          <div className="df fww aife jcsb">
            {players}
          </div>
        </div>         
        <div className={currentGame.mode === 'solo' ? "timer-bar posr tac w100 m0a" : "timer-bar duo posr tac w100 m0a"} style={{maxWidth:"1200px"}}>
          <div className="posa" style={{background:"#456",transition:"1000ms linear",right:0,top:2,bottom:0,width:`${(currentGame.roundLength - currentGame.roundTimer)/currentGame.roundLength*100}%`}}></div>
          <span className="posr" style={{fontSize:36,lineHeight:"40px",fontWeight:"bold",color:"#ffffff",zIndex:1}}>{`${Math.floor(currentGame.roundTimer / 60)}:${('0' + currentGame.roundTimer % 60).slice(-2)}`}</span>
        </div>
        {this.state.successSound && successSound}
        {this.state.errorSound && errorSound}
        {this.state.shuffleSound && shuffleSound}
        {this.state.greatSuccessSound && greatSuccessSound}
        {this.state.tickSound && tickSound}
        {this.state.gameOverSound && gameOverSound}
      </div>
    )
  }

  submitGuess = (gameid, update) => {
    let { guess, currentPlayerKey } = this.state
    const { auth, currentGame } = this.props
    const { currentGamePlayers, currentGameRound } = currentGame,
          currentRound = currentGameRound[Object.keys(currentGameRound)[0]],
          currentPlayer = currentGamePlayers[currentPlayerKey]
    if (guess.length < 3) { return }
    // Reset Guess
    this.resetGuess()
    let guessTaken = Object.keys(currentRound.taken).filter(i => (currentRound.taken[i] !== undefined && currentRound.taken[i].word === guess))
    let bankWordKey = Object.keys(currentRound.bank).filter(i => currentRound.bank[i].word === guess)
    if (guessTaken.length === 0 && bankWordKey.length === 1) {
      // Guess is a word and it's not taken
      let playerColor = currentPlayer.color,
          value = currentRound.bank[bankWordKey].value,
          newScore = currentPlayer.score + value,
          newRoundScore = currentPlayer.roundScore + value
      guess.length === 6 ? this.setState(prevState => ({greatSuccessSound:true})) : this.setState(prevState => ({successSound:true}))
      update(`${GAME_ROUNDS_PATH}/${Object.keys(currentGameRound)[0]}/taken`, {[bankWordKey]:{word:guess,color:playerColor}})
        .then(() => {
          update(
            `${GAME_PLAYERS_PATH}/${currentPlayerKey}`,
            {
              score:newScore,
              roundScore:newRoundScore,
              notification:{text:`${guess.toUpperCase()} +${currentRound.bank[bankWordKey].value}`,type:'word'}
            }
          )
        })
        .catch(e => {
          console.log(e)
        })
    }else if(guessTaken.length === 1 && bankWordKey.length === 1){
      // Word is taken
      this.setState(prevState => ({errorSound:true}))
      update(`${GAME_PLAYERS_PATH}/${currentPlayerKey}/notification`,{text:`${guess.toUpperCase()} is taken`,type:'word'})
    }else if (bankWordKey.length === 0) {
      // Not a valid word
      this.setState(prevState => ({errorSound:true}))
      update(`${GAME_PLAYERS_PATH}/${currentPlayerKey}/notification`,{text:`${guess.toUpperCase()} is not a word`,type:'word'})
    }
  }

  handleSoundEnd = (label) => {
    this.setState(prevState => (
      {[label]:false}
    ))
  }

  keydownEventListener = (event) =>{
    let { keyword, shuffled, guess } = this.state
    const { firebase:{update}, params:{gameid}, currentGame } = this.props
    if (isLoaded(currentGame) && currentGame.roundTimer === 0) {
      return;
    }
    let key = event.key.toLowerCase(),
        letterIndex = shuffled.indexOf(key)
    if ( letterIndex > -1 ) {
      this.addLetterToGuess(key,letterIndex)
    }
    // Submit guess - clear guess word after testing if it is an available answer
    if (key === 'enter') {
      this.submitGuess(gameid,update)
    }
    // Reset guess word
    if (key === 'escape') {
      this.resetGuess()
    }
    // Backspace guess word
    if (key === 'backspace') {
      this.backspaceLetterFromGuess()
    }
    // Shuffle letters
    if (key === ' ') {
      event.preventDefault()
      this.setState(prevState => ({shuffleSound:true}))
      const newShuffled = shuffleLetters(shuffled)
      this.setShuffled(newShuffled)
    }
  }
             
  // onLetterTap = (letter) => {
  //   let nodes =  Array.prototype.slice.call(event.path[2].childNodes)
  //   console.log(nodes.indexOf(event.path[1]))
  //   // event.srcElement.className.indexOf("guess") > -1 ? this.removeLetterFromGuess(letter, this.state.guess.indexOf(letter)) : this.addLetterToGuess(letter, this.state.shuffled.indexOf(letter))
  // }

  addLetterToGuess = (letter, letterIndex) => {
    // event.srcElement.classList.add("guess")
    this.setState(prevState => ({
      guess:prevState.guess + letter,
      shuffled:prevState.shuffled.slice(0,letterIndex) + prevState.shuffled.slice(letterIndex+1)
    }))
  }

  removeLetterFromGuess = (letter, letterIndex) => {
    // event.srcElement.classList.remove("guess")
    this.setState(prevState => ({
      guess:prevState.guess.slice(0,letterIndex) + prevState.guess.slice(letterIndex+1),
      shuffled:prevState.shuffled + letter
    }))
  }  

  backspaceLetterFromGuess = () => {
    this.setState(prevState => ({
      guess:prevState.guess.slice(0, prevState.guess.length - 1),
      shuffled:prevState.guess.substr(prevState.guess.length - 1) + prevState.shuffled
    }))
  }

  resetGuess = () => {
    this.setState(prevState => ({
      guess:'',
      shuffled:prevState.guess + prevState.shuffled
    }))
  }

  setShuffled = (shuffled) => {
    this.setState({shuffled})
  }

  getLetterStyles = (shuffled, guess) => {
    // Gives each letter a translation based on it's position in the shuffled word or the guess word
    const letterStyles = {}
    guess.split('').forEach((letter,index) => {
      if (!letterStyles.hasOwnProperty(letter)) {
        letterStyles[letter] = []
      }
      letterStyles[letter].push({ style:{transform:`translate(${50*index}px,-50px)`} })
    })
    shuffled.split('').forEach((letter,index) => {
      if (!letterStyles.hasOwnProperty(letter)) {
        letterStyles[letter] = []
      }
      letterStyles[letter].push({ style:{transform:`translate(${50*index}px,0)`} })      
    })
    return letterStyles
  }

  getTotalScoreDuo = (players) => {
    return Object.keys(players).reduce((accum, key) => {
      accum += players[key].score
      return accum
    },0)
  }

  playerReady = () => {
    const { firebase:{update}, params:{gameid}, auth, currentGame:{mode} } = this.props
    update(`${GAMES_PATH}/${gameid}/ready`, {[auth.uid]:true}).then(() => {
      if (mode === 'solo') {
        update(`${GAMES_PATH}/${gameid}`, {loading:true})
      }
    }).catch(e => {
      console.log(e)
    })
  }

  endVsGame = (update,gameid,currentGame) => {
    const { currentGamePlayers } = currentGame
    const { profile, auth } = this.props
    const result = Object.keys(currentGamePlayers).reduce((accum,key) => {
      if (currentGamePlayers[key].score > accum.winner.score) {
        accum.loser = Object.assign({},accum.winner)
        accum.winner= {
          name: currentGame.players[currentGamePlayers[key].playerKey].userName,
          score: currentGamePlayers[key].score,
          uid:currentGamePlayers[key].playerKey
        }
      }else if(currentGamePlayers[key].score < accum.winner.score){
        accum.loser = {
          name:currentGame.players[currentGamePlayers[key].playerKey].userName,
          uid:currentGamePlayers[key].playerKey
        }
      }else if(currentGamePlayers[key].score === accum.winner.score){
        accum.winner.name = "TIE"
      }
      return accum
    },{winner:{name:'',uid:'',score:0},loser:{name:'',uid:''}})
    update(`${GAMES_PATH}/${gameid}`, {winner:result.winner.name})
    .then(() => {
      if (result.winner.name !== "TIE" && auth.uid === result.winner.uid) {
        update(`users/${result.winner.uid}`, {wins:profile.wins + 1})
      }
    })
    .catch(e => {
      console.log(e)
    })
  }

  endStandardGame = (update,gameid,score) => {
    const { auth, firebase, currentGame:{players,mode,createdBy} } = this.props
    this.setState({gameOverSound:true})
    update(`${GAMES_PATH}/${gameid}`, {gameOver:true,finalScore:score}).then(() => {
      if (mode === 'solo' && players[auth.uid].highScore < score) {
        update(`/users/${auth.uid}`, {highScore:score})
      }
      if (mode === 'duo-coop') {
        update(`/users/${auth.uid}`, {highScoreDuo:score}).then(() => {
          if(auth.uid === createdBy.uid){
            const newHightScoreDuo = {score:score,players:{}}
            Object.keys(players).forEach(player => newHightScoreDuo.players[player] = player)
            firebase.pushWithMeta('/highScoreDuo', newHightScoreDuo)
          }
        }).catch(e => console.log(e))
      }      
    }).catch(e => {
      console.log(e)
    })    
  }

  closeGame = (key) => {
    return this.props.firebase.update(`games/${key}`, {open:false})
      .catch(e => {console.log(e)})
  }  

}

const styles = {
  button:{
    padding:"8px 32px",
    margin:"0 auto 10px"
  }
}