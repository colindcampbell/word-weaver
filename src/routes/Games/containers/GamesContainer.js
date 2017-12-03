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
// import { showNotification } from '../routes/Game/modules/game'

const populates = [
  { child: 'players', root: 'users', keyProp: 'uid' },
  { child: 'createdBy', root: 'users', keyProp: 'uid' },
]

// const mapDispatchToProps = {
//   showNotification
// }

@UserIsAuthenticated
@firebaseConnect([
  { path: 'games', queryParams: ['orderByChild=open', 'equalTo=true'], populates },
  { path: 'gamePlayers', queryParams: ['limitToLast=50' ]},
  { path: 'gameRounds', queryParams: ['limitToLast=50' ]}
])
@connect(
  ({firebase, firebase:{auth, data:{gamePlayers, gameRounds}}}) => ({
    auth,
    games: populate(firebase, 'games', populates),
    gameRounds,
    gamePlayers
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
    // gamePlayers: PropTypes.object,
    // gameRounds: PropTypes.object
  }

  getOpenGameIDs = (games, mode) => {
    return Object.keys(games).filter(gameKey => {
      return games[gameKey].open === true && games[gameKey].mode === mode
    })
  }

  newSubmit = (mode) => {
    const { firebase, auth, games } = this.props
    if (mode === 'solo' || mode === 'duo-coop') {
      return
    }
    if (mode !== 'solo' && games !== undefined && !isEmpty(games) && Object.keys(games).length > 0) {
      const openGameIDs = this.getOpenGameIDs(games, mode)
      if(openGameIDs.length > 0){
        this.joinGame(openGameIDs[0])
        return
      }
    }
    const newGame = {}
    newGame.open = mode === 'solo' ? false : true
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
      .then(() => {
        // TODO: Show snackbar
      })
  }

  render () {
    const { games, auth, notification } = this.props

    if (!isLoaded(games, auth) && games !== undefined) {
      return <LoadingSpinner />
    }

    // Game Route is being loaded
    if (this.props.children) {
      // pass all props to children routes
      return cloneElement(this.props.children, this.props)
    }

    return (
      <div style={{display:"flex",alignItems:"center",alignContent:"center",flexWrap:"wrap",justifyContent:"center",height:"calc(100vh - 18px)",width:"100vw"}}>
        <div style={{width:"100%"}}>
          <div className="button disabled" onClick={this.newSubmit.bind(this,'solo')} style={Object.assign( {}, styles.button, styles.color1 )}>Single Player</div>
        </div>
        <div style={{width:"100%"}}>
          <div className="button disabled" onClick={this.newSubmit.bind(this,'duo-coop')} style={Object.assign( {}, styles.button, styles.color2 )}>Duo Co-Op</div>
        </div>
        <div style={{width:"100%"}}>
          <div className="button" onClick={this.newSubmit.bind(this,'duo-vs')} style={Object.assign( {}, styles.button, styles.color3 )}>Duo Versus</div>
        </div>
      </div>
    )
  }
}

const styles = {
  button:{
    width:"33%",
    maxWidth:"440px",
    minWidth:"220px",
    margin:"0 auto 10px",
  },
  color3:{
    background:"#007AD5"
  },
  color2:{
    background:"#009B90"
  },
  color1:{
    background:"#5A00F0"
  }
}