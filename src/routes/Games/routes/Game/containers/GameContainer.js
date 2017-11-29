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
// import Radium from 'radium'
import './guess-container.scss'

const populates = [
  { child: 'players', root: 'users', keyProp: 'uid' },
  { child: 'createdBy', root: 'users', keyProp: 'uid' },
  { child: 'currentGamePlayers', root: 'gamePlayers', keyProp: 'gameid'},
  { child: 'currentGameRound', root: 'gameRounds'},
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
  ({firebase}, {params}) => {
  return {
    currentGame: populate(firebase, `${GAMES_PATH}/${params.gameid}`, populates),
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
        currentPlayerKey: currentPlayerKey
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
        setTimeout(() => { 
          update(`${GAMES_PATH}/${gameid}`, {preRoundTimer:currentGame.preRoundTimer - 1})
        }, 980);
      }
      // Countdown during the playing round
      if (!currentGame.open && 
        currentGame.roundTimer > 0 && 
        currentGame.preRoundTimer === 0 && 
        auth.uid === currentGame.createdBy.uid) {
        const { firebase:{update}, params:{gameid} } = this.props
        setTimeout(() => { 
          update(`${GAMES_PATH}/${gameid}`, {roundTimer:currentGame.roundTimer - 1})
        }, 980);
      }
      // End of Round
      if (!currentGame.open && 
        currentGame.roundTimer === 0 && 
        currentGame.preRoundTimer === 0 && 
        currentGame.round === this.props.currentGame.round &&
        auth.uid === currentGame.createdBy.uid) {
        const { firebase:{update}, params:{gameid} } = this.props
        if (!currentGame.roundFinished) {
          update(`${GAMES_PATH}/${gameid}`, {roundFinished:true,loading:true})
        }
      }
      // End of Game
      if (currentGame.gameOver) {
        const { firebase:{update}, params:{gameid} } = this.props
        currentGame.mode === 'duo-vs' ? 
          this.endVsGame(update,gameid,currentGame) : 
          this.endStandardGame(update,gameid,currentGame)
      }
    }
  }

  componentDidMount(){
    document.body.addEventListener('keydown', this.keydownEventListener)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.keydownEventListener)
  }

  render(){
    const { currentGame, auth, games, params:{gameid}, notification } = this.props
    const { guess, shuffled, currentPlayerKey } = this.state

    if (!isLoaded(currentGame) || 
      isEmpty(currentGame) || 
      isEmpty(currentGame.currentGamePlayers) || 
      isEmpty(currentGame.currentGameRound) ) {
      return <LoadingSpinner />
    }

    const { currentGameRound, currentGamePlayers } = currentGame,
          currentRound = currentGameRound[Object.keys(currentGameRound)[0]],
          keywordLetters = currentRound.keyword.split(''),
          letterStyles = this.getLetterStyles(shuffled, guess), letterCount = {}

    let totalScore = Object.keys(currentGamePlayers).reduce((accum, key) => {
      accum += currentGamePlayers[key].score
      return accum
    },0)

    const players = !isEmpty(currentGame.players) && !isEmpty(currentGame.currentGamePlayers) && Object.keys(currentGame.players).length === Object.keys(currentGame.currentGamePlayers).length &&
      Object.keys(currentGame.players)
      .filter(authid => 
        currentGame.players.hasOwnProperty(authid) && 
        !isEmpty(currentGame.players[authid]))
      .map((authid,index) => 
        (<Player 
          key={authid} id={authid}
          isFirst={index % 2 === 0}
          totalScore={totalScore}
          gameMode={currentGame.mode}
          playerGame={
            currentGame.currentGamePlayers[Object.keys(currentGame.currentGamePlayers)
            .filter(gp => currentGame.currentGamePlayers[gp].hasOwnProperty(authid))[0]]} 
          profile={currentGame.players[authid]} />)
      )

    return(
      <div style={{ margin: '0 auto'}} >
        <div style={{height:"calc(100vh - 239px)",overflowY:"auto"}}>
          <div className="df fww acc" style={styles.wordColumn}>
            {
              !isEmpty(currentRound.bank) && Object.keys(currentRound.bank)
              .map(key => (
                <div key={key} style={styles.wordContainer}>
                {
                  currentRound.bank[key].word.split('')
                    .map((letter,index) => (
                      <div key={key+letter+index} style={styles.letterContainer}>
                        <span style={styles.letterMask}></span>
                        {
                          ( currentRound.taken[key] && currentRound.taken[key].word === currentRound.bank[key].word ) ? 
                          (
                            <div>
                              <span style={{backgroundColor:currentRound.taken[key].color,position:"absolute",left:0,right:0,top:0,bottom:0,zIndex:1,borderRadius:2}}></span>
                              <span style={styles.letter}>{letter.toUpperCase()}</span>
                            </div>
                          ) : 
                          (<span style={styles.letterMask}></span>)
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
        {currentGame.open && 
          (<div className="df aic jcc" style={styles.message}>Waiting for Another Player to Join</div>)
        }
        {currentGame.gameOver && 
         currentGame.mode === 'duo-vs' &&
          (<div className="df aic acc jcc fww" style={styles.message}>
            <span style={{width:"100%",textAlign:"center",marginBottom:10}}>{`The winner is ${currentGame.winner}!`}</span>
            <Link to={GAMES_PATH} className="button" style={Object.assign( {}, styles.button, {color:"#ffffff",background:currentGamePlayers[currentPlayerKey].color} )}>
              Game Lobby
            </Link>
          </div>)
        }
        {currentGame.preRoundTimer === 0 && 
         currentGame.roundTimer === 0 &&
         currentGame.ready[auth.uid] === false &&
         currentGame.roundFinished === true &&
         !currentGame.gameOver &&
          (<div className="df aic acc jcc fww" style={styles.message}>
            <span style={{width:"100%",textAlign:"center",marginBottom:10}}>{`Are you ready for round ${currentGame.round + 2}?`}</span>
            <div className="button" onClick={this.playerReady.bind(this)} style={Object.assign( {}, styles.button, {background:currentGamePlayers[currentPlayerKey].color} )}>Ready!</div>
          </div>)
        }
        {currentGame.preRoundTimer === 0 && 
         currentGame.roundTimer === 0 &&
         currentGame.ready[auth.uid] === true &&
         currentGame.roundFinished === true &&
         !currentGame.gameOver &&
          (<div className="df aic acc jcc fww" style={styles.message}>{`Waiting for ${currentGame.players[Object.keys(currentGame.players).filter(key => key !== auth.uid)].displayName}`}
          </div>)
        }
        {!currentGame.roundFinished && 
         currentGame.roundTimer > 0 &&
         currentGame.preRoundTimer === 0 &&
         !currentGame.gameOver &&
         (
        <div>
          <div className="posr" style={{width:290,height:120,textAlign:"left",margin:"0 auto"}}>
            {keywordLetters.map((letter, index) => {
              if (shuffled === 'LOADING') {
                return <LoadingSpinner />
              }
              !letterCount.hasOwnProperty(letter) ? letterCount[letter] = 0 : letterCount[letter]++
              return(
                <section 
                  key={letter+index+"guess"}
                  className="letter-container"
                  style={letterStyles[letter][letterCount[letter]].style}
                  onTouchStart={ guess.indexOf(letter) > -1 ? 
                    this.removeLetterFromGuess.bind(this, letter, this.state.guess.indexOf(letter)) : 
                    this.addLetterToGuess.bind(this, letter, this.state.shuffled.indexOf(letter)) }
                  onMouseDown={ guess.indexOf(letter) > -1 ? 
                    this.removeLetterFromGuess.bind(this, letter, this.state.guess.indexOf(letter)) : 
                    this.addLetterToGuess.bind(this, letter, this.state.shuffled.indexOf(letter)) } >
                  <div id="cube">
                    {letter}
                  </div>
                </section>
              )}
            )}
          </div>
        </div>
        )}
        {currentGame.preRoundTimer > 0 && 
         !currentGame.open &&
         !currentGame.gameOver &&
          (<div className="df aic jcc" style={styles.message}>Round starts in {currentGame.preRoundTimer}
          </div>)}        
        <div className="posr" style={{width:"100%",maxWidth:"1200px",margin:"0 auto"}}>
          <div className="posa" style={{width:"100%",zIndex:1,bottom:2}}>
            <div style={{width:"calc(50% + 2px)",borderRight:"4px solid rgba(255,255,255,.3)",height:36}}></div>
          </div>
          <div className="df fww aife">
            {players}
          </div>
        </div>         
        <div className="timer-bar posr" style={{textAlign:"center",width:"100%",maxWidth:"1200px",margin:"0 auto"}}>
          <div className="posa" style={{background:"#456",transition:"1000ms linear",right:0,top:2,bottom:0,width:`${(currentGame.roundLength - currentGame.roundTimer)/currentGame.roundLength*100}%`}}></div>
          <span className="posr" style={{fontSize:36,lineHeight:"40px",fontWeight:"bold",color:"#ffffff",zIndex:1}}>{`${Math.floor(currentGame.roundTimer / 60)}:${('0' + currentGame.roundTimer % 60).slice(-2)}`}</span>
        </div>
      </div>
    )
  }

  submitGuess = (gameid, update) => {
    let { guess, currentPlayerKey } = this.state
    const { auth, currentGame } = this.props
    const { currentGamePlayers, currentGameRound } = currentGame,
          currentRound = currentGameRound[Object.keys(currentGameRound)[0]],
          currentPlayer = currentGamePlayers[currentPlayerKey]
    // Reset Guess
    this.resetGuess()
    let guessTaken = Object.keys(currentRound.taken).filter(i => (currentRound.taken[i] !== undefined && currentRound.taken[i].word === guess))
    let bankWordKey = Object.keys(currentRound.bank).filter(i => currentRound.bank[i].word === guess)
    if (guessTaken.length === 0 && bankWordKey.length === 1) {
      // Guess is a word and it's not taken
      let currentScore = currentPlayer.score,
          playerColor = currentPlayer.color,
          newScore = currentScore + currentRound.bank[bankWordKey].value
      update(`${GAME_ROUNDS_PATH}/${Object.keys(currentGameRound)[0]}/taken`, {[bankWordKey]:{word:guess,color:playerColor}})
        .then(() => {
          update(
            `${GAME_PLAYERS_PATH}/${currentPlayerKey}`,
            {
              score:newScore,
              notification:{text:`${guess.toUpperCase()} +${currentRound.bank[bankWordKey].value}`,type:'word'}
            }
          )
        })
        .catch(e => {
          console.log(e)
        })
    }else if(guessTaken.length === 1 && bankWordKey.length === 1){
      // Word is taken
      update(`${GAME_PLAYERS_PATH}/${currentPlayerKey}/notification`,{text:`${guess.toUpperCase()} was guessed`,type:'word'})
    }else if (bankWordKey.length === 0) {
      // Not a valid word
      update(`${GAME_PLAYERS_PATH}/${currentPlayerKey}/notification`,{text:`${guess.toUpperCase()} not a word`,type:'word'})
    }
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
      const newShuffled = shuffleLetters(shuffled)
      this.setShuffled(newShuffled)
    }
  }

  addLetterToGuess = (letter, letterIndex) => {
    this.setState(prevState => ({
      guess:prevState.guess + letter,
      shuffled:prevState.shuffled.slice(0,letterIndex) + prevState.shuffled.slice(letterIndex+1)
    }))
  }

  removeLetterFromGuess = (letter, letterIndex) => {
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

  playerReady = () => {
    const { firebase:{update}, params:{gameid}, auth } = this.props
    update(`${GAMES_PATH}/${gameid}/ready`, {[auth.uid]:true})
  }

  endVsGame = (update,gameid,currentGame) => {
    const { currentGamePlayers } = currentGame
    const winner = Object.keys(currentGamePlayers).reduce((accum,key) => {
      if (currentGamePlayers[key].score > accum.score) {
        accum.name = currentGame.players[currentGamePlayers[key].playerKey].displayName
        accum.score = currentGamePlayers[key].score
      }else if(currentGamePlayers[key].score === accum.score){
        accum.name = "TIE"
      }
      return accum
    },{name:'',score:0})
    update(`${GAMES_PATH}/${gameid}`, {winner:winner.name}).catch(e => {
      console.log(e)
    })
  }

  endStandardGame = (update,gameid,currentGame) => {
    update(`${GAMES_PATH}/${gameid}`, {gameOver:true,finalScore:100,round:currentGame.round+1}).catch(e => {
      console.log(e)
    })    
  }

}

const styles = {
  playersContainer:{
    display:"flex"
  },
  wordColumn:{
    fontSize:18,
    color:"#ffffff",
    flexDirection:"column",
    justifyContent:"flex-start",
    minHeight:"400px",
    alignItems:"flex-start",
    padding:"0 20px",
    overflowY:"scroll",
    height:"calc(100vh - 239px)"
  },
  wordContainer:{
    display:"flex",
    marginBottom:4,
    marginRight:10,
    boxShadow:"0px 1px 8px -2px rgba(0,0,0,0.6)"
  },
  letterContainer:{
    width:20,
    height:27,
    position:"relative",
    textAlign:"center",
    marginRight:1,
    marginLeft:1,
    verticalAlign:"middle",
    lineHeight:"28px"
  },
  letterMask:{
    position:"absolute",
    left:0,
    right:0,
    top:0,
    bottom:0,
    zIndex:1,
    border:"1px solid #777777",
    borderRadius:2,
    background:"#ffffff"
  },
  letter:{
    position:"absolute",
    left:0,
    right:0,
    top:0,
    bottom:1,
    zIndex:1,
    borderRadius:2, 
  },
  button:{
    padding:"8px 32px",
    margin:"0 auto 10px"
  },
  message:{
    color:'#456',
    fontSize:28,
    height:120,
    fontWeight:"bold",
    letterSpacing:"-1px"
  }
}