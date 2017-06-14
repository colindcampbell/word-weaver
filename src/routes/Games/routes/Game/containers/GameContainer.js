import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { WORD_BANK_PATH, WORD_PATH, GAMES_PATH, GAME_PLAYERS_PATH } from 'constants'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  dataToJS,
  populatedDataToJS,
  isLoaded,
  isEmpty
} from 'react-redux-firebase'

import { UserIsAuthenticated } from 'utils/router'
import { getRandomNumber, sortList, assignPointValues, shuffleLetters } from 'utils/helpers'
import LoadingSpinner from 'components/LoadingSpinner'
import Player from '../components/Player'
import Radium from 'radium'

const populates = [
  { child: 'players', root: 'users', keyProp: 'uid' }
]

@UserIsAuthenticated
@Radium
@firebaseConnect(
  ({params}) => {
    return [
      { path:`${GAMES_PATH}/${params.gameid}`, populates },
      `${GAME_PLAYERS_PATH}/${params.gameid}`
    ]
  }
)
@connect(
  ({firebase}, {params}) => {
  return {
    currentGame: populatedDataToJS(firebase, `${GAMES_PATH}/${params.gameid}`, populates),
    currentPlayers: dataToJS(firebase, `${GAME_PLAYERS_PATH}/${params.gameid}`)
  }}
)
export default class GameContainer extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  static propTypes = {
    currentGame: PropTypes.object,
    currentPlayers: PropTypes.object,
    firebase: PropTypes.object,
    auth: PropTypes.object,
    params: PropTypes.object
  }

  componentWillMount() {
    const { currentGame } = this.props
    this.setState({
      keyword:isLoaded(currentGame) && currentGame.hasOwnProperty('keyword') ? shuffleLetters(currentGame.keyword) : '',
      guess:''
    })
  }

  componentDidMount(){
    const { currentGame, auth, currentPlayers } = this.props
    // Add user to game if they aren't already in the game
    if ( isLoaded(currentGame, auth, currentPlayers) && auth.uid !== currentGame.createdBy && currentGame.open && !currentPlayers.hasOwnProperty(auth.uid)) {
      this.addUserToGame(auth.uid)
    }
    // Get Words
    if (isLoaded(currentGame) && (isEmpty(currentGame.bank) || isEmpty(currentGame.keyword))) {
      this.populateWords(currentGame)
    }
    // Keypress Event Listener
    document.body.addEventListener('keydown', this.keydownEventListener)
  }

  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.keydownEventListener)
  }

  render(){
    const { currentGame, currentPlayers, auth, games, params:{gameid}, notification } = this.props
    if (!isLoaded(currentGame, currentPlayers, auth) && !isEmpty(currentGame, currentPlayers, auth)) {
      return <LoadingSpinner />
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
      <div style={{ margin: '0 auto' }} >
        <h2>{currentGame.name}</h2>

        <div style={{display:"flex"}}>
          {players}       
        </div>

        <p>Letters: {this.state.keyword}</p>
        <p>Guess: {this.state.guess}</p>
        <div style={styles.wordColumn}>
          {
            !isEmpty(currentGame.bank) && Object.keys(currentGame.bank)
            .map(key => (
              <div key={key} style={styles.wordContainer}>
              {
                currentGame.bank[key].word.split('')
                  .map((letter,index) => (
                    <div key={key+letter+index} style={styles.letterContainer}>
                      <span style={styles.letterMask}></span>
                      {
                        ( currentGame.taken[key] && currentGame.taken[key].word === currentGame.bank[key].word ) ? 
                        (
                          <div>
                            <span style={{backgroundColor:currentGame.taken[key].color,position:"absolute",left:0,right:0,top:0,bottom:0,zIndex:1,borderRadius:2}}></span>
                            <span style={styles.letter}>{letter.toUpperCase()}</span>
                          </div>
                        ) : 
                        (<span style={styles.letterMask}></span>)
                      }
                    </div>
                  )
                )
              }
              {key > 0 && currentGame.bank[key].word.length !== currentGame.bank[key - 1].word.length && (<br/>)}
              </div>
            ))
          }      
        </div>
      </div>
    )
  }

  clearWord = () => {
    this.setState(prevState => ({
      guess:'',
      keyword:prevState.keyword + prevState.guess
    }))
  }

  submitGuess = (taken, bank, gameid, update) => {
    let { keyword, guess } = this.state
    const { auth, currentGame, currentPlayers } = this.props
    let guessTaken = Object.keys(taken).filter(i => (taken[i] !== undefined && taken[i].word === guess))
    let bankWordKey = Object.keys(bank).filter(i => bank[i].word === guess)
    if (guessTaken.length === 0 && bankWordKey.length === 1) {
      // Guess is a word and it's not taken
      // TODO: add notification "+{point value}"
      let currentScore = currentPlayers[auth.uid].score,
          playerColor = currentPlayers[auth.uid].color,
          newScore = currentScore + bank[bankWordKey].value
      update(`${GAMES_PATH}/${gameid}/taken`, {[bankWordKey]:{word:guess,color:playerColor}})
        .then(() => {
          update(
            `${GAME_PLAYERS_PATH}/${gameid}/${auth.uid}`,
            {
              score:newScore,
              notification:{text:`+${bank[bankWordKey].value}`,type:'word'}
            }
          )
        })
        // .then(() => {
        //   showNotification({text:`+${bank[bankWordKey].value}`,type:'success'})
        // })
        .catch(e => {
          console.log(e)
        })
    }else if(guessTaken.length === 1 && bankWordKey.length === 1){
      update(`${GAME_PLAYERS_PATH}/${gameid}/${auth.uid}/notification`,{text:`${guess.toUpperCase()} was already guessed`,type:'word'})
    }else if (bankWordKey.length === 0) {
      update(`${GAME_PLAYERS_PATH}/${gameid}/${auth.uid}/notification`,{text:`${guess.toUpperCase()} is not a word`,type:'word'})
    }
    // Reset Guess
    this.setState(prevState => ({
      guess:'',
      keyword:prevState.keyword + prevState.guess
    }))    
  }

  addLetterToGuess = (letter, letterIndex) => {
    this.setState(prevState => ({
      guess:prevState.guess + letter,
      keyword:prevState.keyword.slice(0,letterIndex)+prevState.keyword.slice(letterIndex+1)
    }))
  }

  removeLetterFromGuess = () => {
    this.setState(prevState => ({
      guess:prevState.guess.slice(0, prevState.guess.length - 1),
      keyword:prevState.keyword + prevState.guess.substr(prevState.guess.length - 1)
    }))
  }

  setKeyword = (keyword) => {
    this.setState({keyword})
  }

  keydownEventListener = (event) =>{
    let { keyword, guess } = this.state
    // console.log(event.key)
    let { currentGame:{bank, taken}, firebase:{update}, params:{gameid} } = this.props
    let key = event.key.toLowerCase(),
        letterIndex = keyword.indexOf(key)
    if ( letterIndex > -1 ) {
      this.addLetterToGuess(key,letterIndex)
    }
    // Submit guess - clear guess word after testing if it is an available answer
    if (key === 'enter') {
      this.submitGuess(taken,bank,gameid,update)
    }
    // Clear guess word
    if (key === 'escape') {
      this.clearWord()
    }
    // Backspace guess word
    if (key === 'backspace') {
      this.removeLetterFromGuess()
    }
    // Shuffle letters
    if (key === ' ') {
      const shuffled = shuffleLetters(keyword)
      this.setKeyword(shuffled)
    }
  }

  addUserToGame(authid){
    const { params:{gameid}, firebase:{update,set}, currentGame, currentPlayers } = this.props,
          colors = ["#006B91","#4D00D3","#BD0055"],
          playersCount = typeof(currentPlayers) === "object" ? Object.keys(currentPlayers).length : 0
    update(`${GAME_PLAYERS_PATH}/${gameid}/${authid}`, {score:0,color:colors[playersCount],notification:{text:'Joined Game',type:'success'}})
      .then(() => {
        if (playersCount === 3) {
          update(`${GAME_PLAYERS_PATH}/${gameid}/open`, false)
        }
        set(`${GAMES_PATH}/${gameid}/players/${authid}`, authid)
      })
  }

  populateWords(currentGame){
    const {params:{gameid}, firebase} = this.props
    const wordIndex = getRandomNumber(9099)
    const wordRef = firebase.database().ref(WORD_BANK_PATH +'/'+ wordIndex)
    wordRef.once("value")
      .then(snapshot => {
        const keyword = snapshot.val()
        const shuffled = shuffleLetters(keyword)
        this.setState({
          keyword:shuffled
        })
        return keyword
      })
      .then(keyword => {
        const bankRef = firebase.database().ref(WORD_PATH +'/'+ keyword)
        bankRef.once("value")
          .then(snapshot => {
            const bank = snapshot.val()
            bank[bank.length] = keyword
            const sortedBank = sortList(bank)
            const finalBank = assignPointValues(sortedBank)
            firebase.update(GAMES_PATH+'/'+gameid, {keyword, bank:finalBank, taken:[{word:'No data'}]})
          })
      })
      .catch(e =>{
        console.log(e)
      })
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
    height:"60vh",
    alignItems:"flex-start",
  },
  wordContainer:{
    display:"flex",
    marginBottom:4,
    marginRight:4,
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
