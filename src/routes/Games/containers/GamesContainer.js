import React, { Component, cloneElement, PropTypes } from 'react'
// import { Field, reduxForm } from 'redux-form';
// import { map } from 'lodash'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {
  firebaseConnect,
  populate,
  isLoaded,
  isEmpty
} from 'react-redux-firebase'
import { GAMES_PATH } from 'constants'
import { UserIsAuthenticated } from 'utils/router'
import LoadingSpinner from 'components/LoadingSpinner'
import { HowToPlay } from '../components/HowToPlay'
// import { showNotification } from '../routes/Game/modules/game'

const populates = [
  { child: 'players', root: 'users', keyProp: 'uid' },
  { child: 'createdBy', root: 'users', keyProp: 'uid' },
  { child: 'highScoreDuo', root: 'users', keyProp: 'uid' },
]

// const mapDispatchToProps = {
//   showNotification
// }

@UserIsAuthenticated
@firebaseConnect([
  { path: 'games', queryParams: ['orderByChild=open', 'equalTo=true'], populates },
  { path: 'users', storeAs: 'highScoreUsers', queryParams: ['orderByChild=highScore', 'limitToLast=5'] },
  { path: 'users', storeAs: 'winsUsers', queryParams: ['orderByChild=wins', 'limitToLast=5'] },
  { path: 'highScoreDuo', queryParams: ['orderByChild=score', 'limitToLast=5'], populates },
  { path: 'gamePlayers', queryParams: ['limitToLast=80' ]},
  { path: 'gameRounds', queryParams: ['limitToLast=80' ]}
])
@connect(
  ({firebase, firebase:{auth, data:{gamePlayers, gameRounds}, ordered:{highScoreUsers, winsUsers, highScoreDuo}}}) => ({
    auth,
    games: populate(firebase, 'games', populates),
    highScoreDuo: populate(firebase, 'highScoreDuo', populates),
    gameRounds,
    gamePlayers,
    highScoreUsers,
    winsUsers
    // gamePlayers: dataToJS(firebase, 'gamePlayers'),
    // gameRounds: dataToJS(firebase, 'gameRounds')
    // notification: state.notification,
    // showNotification
  })
  // mapDispatchToProps
)
// @reduxForm({ form:'newGameForm' })
export default class Games extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  static propTypes = {
    firebase: PropTypes.object,
    children: PropTypes.object,
    auth: PropTypes.object,
    games: PropTypes.object,
    // gameRounds: PropTypes.object
  }

  componentWillMount(){
    this.setState({
      showHowTo: false
    }) 
  }

  render () {
    const { games, auth, notification, highScoreUsers, winsUsers, highScoreDuo } = this.props


    if ( (!isLoaded(games, auth, highScoreDuo, highScoreUsers) || isEmpty(highScoreDuo, highScoreUsers, auth)) ) {
      return (
        <div className="posf" style={{top:0,bottom:0,left:0,right:0}}>
          <LoadingSpinner />
        </div>
      )
    }

    const soloLeaderList = Object.keys(highScoreUsers).map(key => {
      const user = highScoreUsers[key].value
      return (
        <div className="w100">
          <div className="leader df jcsb aic" style={styles.button}>
            <div className="df aic">
              <img src={ user.avatarUrl } style={{width:40,height:40,borderRadius:2,marginRight:10}}/>
              {user.userName}
            </div>
            <div>{user.highScore}</div>
          </div>
        </div>
      )
    })

    const winsLeaderList = Object.keys(winsUsers).map(key => {
      const user = winsUsers[key].value
      return (
        <div className="w100">
          <div className="leader df jcsb aic" style={styles.button}>
            <div className="df aic">
              <img src={ user.avatarUrl } style={{width:40,height:40,borderRadius:2,marginRight:10}}/>
              {user.userName}
            </div>
            <div>{user.wins} {user.wins === 1 ? 'win' : 'wins'}</div>
          </div>
        </div>
      )
    })

    const duoLeadersList = highScoreDuo !== null ? Object.keys(highScoreDuo).map(key => {
      const score = highScoreDuo[key]
      return (
        <div className="w100">
          <div className="leader df jcsb aic" style={styles.button}>
            <div className="tal">
              {Object.keys(score.players).map((player,index) => {
                let name = score.players[player].userName
                name = index === 0 ? name + ' &' : name
                return (<div>{name}</div>)
              })}
            </div>
            {score.score}
          </div>
        </div>
      )
    }) : []

    // Game Route is being loaded
    if (this.props.children) {
      // pass all props to children routes
      return cloneElement(this.props.children, this.props)
    }

    return (
      <div className="df aic acc fww jcc m0a" style={{height:"100vh",width:"100vw",maxWidth:"1200px",overflow:"auto"}}>
        <div className="w33-r" style={{marginBottom:30}}>
          <div className="w100">
            <div className="button bgP3" onClick={this.newSubmit.bind(this,'solo')} style={styles.button}>Play Solo</div>
          </div>
          {soloLeaderList.reverse()}
        </div>
        <div className="w33-r" style={{marginBottom:30}}>
          <div className="w100">
            <div className="button bgP2" onClick={this.newSubmit.bind(this,'duo-coop')} style={styles.button}>Play Duo Co-Op</div>
          </div>
          {duoLeadersList.reverse()}
        </div>
        <div className="w33-r" style={{marginBottom:30}}>
          <div className="button bgP1" onClick={this.newSubmit.bind(this,'duo-vs')} style={styles.button}>Play Duo Versus</div>
          {winsLeaderList.reverse()}
        </div>
        <div className="w100">
          <div className="w33-r m0a">
            <div className="button m0a" onClick={this.showHowTo} style={Object.assign( {}, styles.button, styles.outlineButton )}>How To Play</div>
          </div>
          {this.state.showHowTo && (<HowToPlay hideHowTo={this.hideHowTo} />)}
        </div>
      </div>
    )
  }

  newSubmit = (mode) => {
    const { firebase, auth, games } = this.props
    if (mode !== 'solo' && games !== undefined && !isEmpty(games) && Object.keys(games).length > 0) {
      const openGameIDs = this.getOpenGameIDs(games, mode)
      if(openGameIDs.length > 0){
        this.joinGame(openGameIDs[0])
        return
      }
    }
    const newGame = {}
    newGame.open = mode === 'solo' ? false : true
    newGame.timestamp = Date.now()
    newGame.mode = mode
    newGame.round = 0
    newGame.roundFinished = false
    newGame.gameOver = false
    newGame.winner = ''
    // add current user to game
    newGame.players = {}
    newGame.players[auth.uid] = auth.uid
    return firebase.pushWithMeta('games', newGame)
      .then(data => {
        this.context.router.push(`${GAMES_PATH}/${data.key}`)
      })
      .catch(err => {
        // TODO: Show Snackbar
        console.error('error creating new game', err) // eslint-disable-line
      })
  }

  joinGame = (gameId) => {
    const { firebase:{update}, auth } = this.props
    return update(`${GAMES_PATH}/${gameId}/players`, {[auth.uid]:auth.uid })
      .then(snap => {
        return update(`${GAMES_PATH}/${gameId}`, {open:false,loading:true})
      })
      .then(snap => {
        this.context.router.push(`${GAMES_PATH}/${gameId}`)
      })
  }

  deleteGame = (key) => {
    return this.props.firebase.remove(`games/${key}`)
  }

  getOpenGameIDs = (games, mode) => {
    return Object.keys(games).filter(gameKey => {
      return games[gameKey].open === true && games[gameKey].mode === mode
    })
  }  

  showHowTo = () => { this.setState({showHowTo:true}) }

  hideHowTo = () => { this.setState({showHowTo:false}) }
}

const styles = {
  button:{
    width:"calc(100% - 10px)",
    margin:"0 auto 10px",
    fontSize:18
  },
  outlineButton:{
    background:"none",
    border:"3px solid #456",
    color:"#456",
    marginBottom:0,
  },
  color4:{
    background:"#456"
  },
  color3:{
    background:"#007AD5"
  },
  color2:{
    background:"#009B90"
  },
  color1:{
    background:"#5A00F0"
  },
  message:{
    color:'#456',
    fontSize:28,
    fontWeight:"bold",
    letterSpacing:"-1px",
    marginBottom:10
  },  
}