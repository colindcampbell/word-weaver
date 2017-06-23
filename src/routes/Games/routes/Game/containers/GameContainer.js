import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { WORD_BANK_PATH, WORD_PATH, GAMES_PATH, GAME_PLAYERS_PATH, GAME_ROUNDS_PATH } from 'constants'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  dataToJS,
  populatedDataToJS,
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
  { child: 'players', root: 'users', keyProp: 'uid' }
]

@UserIsAuthenticated
// @Radium
@firebaseConnect(
  ({params}) => {
    return [
      { path:`${GAMES_PATH}/${params.gameid}`, populates },
      `${GAME_PLAYERS_PATH}/${params.gameid}`,
      `${GAME_ROUNDS_PATH}/${params.gameid}`
    ]
  }
)
@connect(
  ({firebase}, {params}) => {
  return {
    currentGame: populatedDataToJS(firebase, `${GAMES_PATH}/${params.gameid}`, populates),
    currentPlayers: dataToJS(firebase, `${GAME_PLAYERS_PATH}/${params.gameid}`),
    currentGameRounds: dataToJS(firebase, `${GAME_ROUNDS_PATH}/${params.gameid}`)
  }}
)
export default class GameContainer extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  static propTypes = {
    currentGame: PropTypes.object,
    currentGameRounds: PropTypes.array,
    currentPlayers: PropTypes.object,
    firebase: PropTypes.object,
    auth: PropTypes.object,
    params: PropTypes.object
  }

  componentWillMount() {
    const { currentGameRounds } = this.props
    this.setState({
      keyword:false,
      shuffled:'LOADING',
      guess:''
    })
    if (isLoaded(currentGameRounds) && !isEmpty(currentGameRounds[0])) {
      this.setState({
        keyword: currentGameRounds[0].keyword,
        shuffled: currentGameRounds[0].shuffled
      })
    }
  }

  componentWillUpdate(nextProps, nextState){
    const { currentGameRounds } = nextProps
    if (this.state.keyword === false && isLoaded(currentGameRounds) && !isEmpty(currentGameRounds)) {
      this.setState({
        keyword: currentGameRounds[0].keyword,
        shuffled: currentGameRounds[0].shuffled
      })
    }
  }

  componentDidMount(){
    document.body.addEventListener('keydown', this.keydownEventListener)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.keydownEventListener)
  }

  render(){
    const { currentGame, currentPlayers, currentGameRounds, auth, games, params:{gameid}, notification } = this.props
    const { guess } = this.state
    if (!isLoaded(currentGame, currentPlayers, currentGameRounds, auth) && !isEmpty(currentGame, currentPlayers, currentGameRounds)) {
      return <LoadingSpinner />
    }

    console.log(currentGameRounds)
    let lastRoundIndex = Object.keys(currentGameRounds).length -1
    const currentRound = currentGameRounds[lastRoundIndex]
    
    let multiple = false
    const keywordLetters = currentRound.keyword.split('')
    const letterStyles = [
      { style:{}, className:'loading' },
      { style:{}, className:'loading' },
      { style:{}, className:'loading' },
      { style:{}, className:'loading' },
      { style:{}, className:'loading' },
      { style:{}, className:'loading' }
    ]
    keywordLetters.forEach((letter) => {
      if (currentRound.keyword.lastIndexOf(letter) !== currentRound.keyword.indexOf(letter)) {
        multiple = true
      }
    })
    if (multiple) {
        // TODO: add functionality for words with the same letter multiple times
    }else{
      this.state.guess.split('').forEach((letter,index) => {
        letterStyles[currentRound.keyword.indexOf(letter)] = 
        {
          style:{transform:`translate3d(${50*index}px,-50px,0)`},
          className:`show-${currentRound.keyword.indexOf(letter)}`
        }
      })
      this.state.shuffled.split('').forEach((letter,index) => {
        letterStyles[currentRound.keyword.indexOf(letter)] = 
        {
          style:{transform:`translate3d(${50*index}px,0,0)`},
          className:`show-${currentRound.keyword.indexOf(letter)}`
        }
      })
    }

    const players = !isEmpty(currentPlayers) && !isEmpty(currentGame.players) && 
      Object.keys(currentPlayers)
      .filter(authid => 
        currentPlayers.hasOwnProperty(authid) && 
        currentGame.players.hasOwnProperty(authid) && 
        !isEmpty(currentPlayers[authid]) && 
        !isEmpty(currentGame.players[authid]))
      .map(authid => 
        (<Player key={authid} id={authid} playerGame={currentPlayers[authid]} profile={currentGame.players[authid]} />)
      )

    return(
      <div style={{ margin: '0 auto', overflowY:"auto" }} >
        <div style={{position:"fixed",left:0,bottom:0,width:300,display:"flex",flexWrap:"wrap",alignItems:"flex-end",alignContent:"flex-end"}}>
          {players}       
        </div>
        <div style={styles.wordColumn}>
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
          <div style={{position:"fixed",right:0,bottom:0,width:300,height:120,textAlign:"left"}}>
            {keywordLetters.map((letter, index) => 
              (
                <section 
                  key={letter+index+"guess"}
                  className="letter-container"
                  style={letterStyles[index].style}
                  onClick={ guess.indexOf(letter) > -1 ? 
                    this.removeLetterFromGuess.bind(this, letter, this.state.guess.indexOf(letter)) : 
                    this.addLetterToGuess.bind(this, letter, this.state.shuffled.indexOf(letter)) } >
                  <div id="cube" className={letterStyles[index].className}>
                    <figure className="front">{keywordLetters[0]}</figure>
                    <figure className="back">{keywordLetters[1]}</figure>
                    <figure className="right">{keywordLetters[2]}</figure>
                    <figure className="left">{keywordLetters[3]}</figure>
                    <figure className="top">{keywordLetters[4]}</figure>
                    <figure className="bottom">{keywordLetters[5]}</figure>
                  </div>
                </section>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  submitGuess = (gameid, update) => {
    let { guess } = this.state
    const { auth, currentGameRounds, currentPlayers } = this.props
    const roundIndex = currentGameRounds.length - 1
    const currentRound = currentGameRounds[roundIndex]
    // Reset Guess
    this.resetGuess()
    let guessTaken = Object.keys(currentRound.taken).filter(i => (currentRound.taken[i] !== undefined && currentRound.taken[i].word === guess))
    let bankWordKey = Object.keys(currentRound.bank).filter(i => currentRound.bank[i].word === guess)
    if (guessTaken.length === 0 && bankWordKey.length === 1) {
      // Guess is a word and it's not taken
      let currentScore = currentPlayers[auth.uid].score,
          playerColor = currentPlayers[auth.uid].color,
          newScore = currentScore + currentRound.bank[bankWordKey].value
      update(`${GAME_ROUNDS_PATH}/${gameid}/${roundIndex}/taken`, {[bankWordKey]:{word:guess,color:playerColor}})
        .then(() => {
          update(
            `${GAME_PLAYERS_PATH}/${gameid}/${auth.uid}`,
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
      update(`${GAME_PLAYERS_PATH}/${gameid}/${auth.uid}/notification`,{text:`${guess.toUpperCase()} was already guessed`,type:'word'})
    }else if (bankWordKey.length === 0) {
      update(`${GAME_PLAYERS_PATH}/${gameid}/${auth.uid}/notification`,{text:`${guess.toUpperCase()} is not a word`,type:'word'})
    }
  }

  keydownEventListener = (event) =>{
    let { keyword, shuffled, guess } = this.state
    const { firebase:{update}, params:{gameid}, currentGameRounds } = this.props
    const currentRound = currentGameRounds[currentGameRounds.length - 1]
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

}

const styles = {
  playersContainer:{
    display:"flex"
  },
  wordColumn:{
    display:"flex",
    fontSize:18,
    color:"#ffffff",
    flexDirection:"column",
    flexWrap:"wrap",
    justifyContent:"flex-start",
    height:"65vh",
    minHeight:"370px",
    alignItems:"flex-start",
    alignContent:"center",
    position:"fixed",
    left:0,
    top:"20px",
    right:0,
    padding:"0 20px",
    overflowY:"scroll"
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
  }
}

// Game.propTypes = {
//   counter     : PropTypes.number.isRequired,
//   doubleAsync : PropTypes.func.isRequired,
//   increment   : PropTypes.func.isRequired
// }

// export default GameContainer
