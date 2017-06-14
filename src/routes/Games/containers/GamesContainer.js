import React, { Component, cloneElement, PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form';
// import { map } from 'lodash'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import {
  firebaseConnect,
  populatedDataToJS,
  dataToJS,
  pathToJS,
  isLoaded,
  isEmpty
} from 'react-redux-firebase'
import { GAMES_PATH } from 'constants'
import { UserIsAuthenticated } from 'utils/router'
import LoadingSpinner from 'components/LoadingSpinner'
import { showNotification } from '../routes/Game/modules/game'

const populates = [
  { child: 'players', root: 'users', keyProp: 'uid' },
  { child: 'createdBy', root: 'users', keyProp: 'uid' },
]

const mapDispatchToProps = {
  showNotification
}

@UserIsAuthenticated
@firebaseConnect([
  { path: 'games', queryParams: [ 'orderByChild=open', 'equalTo=true', 'limitToLast=100' ], populates },
  { path: 'gamePlayers', queryParams: ['limitToLast=100' ]}
  // '' // string equivalent
])
@connect(
  ({firebase}) => ({
    auth: pathToJS(firebase, 'auth'),
    games: populatedDataToJS(firebase, 'games', populates),
    gamePlayers: dataToJS(firebase, 'gamePlayers'),
    // notification: state.notification,
    // showNotification
  }),
  mapDispatchToProps
)
@reduxForm({ form:'newGameForm' })
export default class Games extends Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired
  }

  static propTypes = {
    games: PropTypes.object,
    firebase: PropTypes.object,
    auth: PropTypes.object,
    children: PropTypes.object
  }

  newSubmit = (newGame) => {
    const { firebase, auth } = this.props
    newGame.open = true
    newGame.players = {}
    newGame.players[auth.uid] = auth.uid
    return firebase.pushWithMeta('games', newGame)
      .then(data => {
        firebase.set(`gamePlayers/${data.key}/${auth.uid}`,{score:0,color:'#006B91',notification:{text:'Joined Game',type:'success'}})
        .then(() => {
          this.context.router.push(`${GAMES_PATH}/${data.key}`)
        })
      })
      .catch(err => {
        // TODO: Show Snackbar
        console.error('error creating new game', err) // eslint-disable-line
      })
  }

  deleteGame = (key) => {
    return this.props.firebase.remove(`games/${key}`)
      .then(() => {
        // TODO: Show snackbar
      })
  }

  render () {
    const { games, auth, handleSubmit, notification } = this.props

    if (!isLoaded(games, auth)) {
      return <LoadingSpinner />
    }

    // Project Route is being loaded
    if (this.props.children) {
      // pass all props to children routes
      return cloneElement(this.props.children, this.props)
    }

    const gameList = isEmpty(games) ? 'No Games' : Object.keys(games).map(key =>
       <div key={key} style={{padding:10,background:"#e6e6e6",margin:5}}>
          <h3 style={{marginTop:0}}>{games[key].name}</h3>
          <p style={{marginBottom:0}}>
            <img src={games[key].createdBy.avatarUrl} style={{width:40,height:'auto'}}/>&nbsp;
            Owner: {games[key].createdBy.displayName}&nbsp;
            <Link to={GAMES_PATH+'/'+key} >Join Game</Link>
          </p>
       </div>
    )

    return (
      <div>
        <form onSubmit={handleSubmit(this.newSubmit)}>
          <label>Game Name:</label>
          <Field type="text" component="input" placeholder="Name" name="name" ref="gameName"/>
          <button type="submit">Add New Game</button>
        </form>
        <br/>
        <br/>
        <div>
          { gameList }
        </div>
      </div>
    )
  }
}