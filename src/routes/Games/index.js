import { GAMES_PATH as path } from 'constants'
import { injectReducer } from '../../store/reducers'
import Game from './routes/Game'

export default (store) => ({
  path,
  /*  Async getComponent is only invoked when route matches   */
  getComponent (nextState, cb) {
    /*  Webpack - use 'require.ensure' to create a split point
        and embed an async module loader (jsonp) when bundling   */
    require.ensure([], (require) => {
      /*  Webpack - use require callback to define
          dependencies for bundling   */
      const Games = require('./containers/GamesContainer').default
      // const reducer = require('./routes/Game/modules/game').default

      /*  Add the reducer to the store on key 'counter'  */
      // injectReducer(store, { key: 'notification', reducer })      

      /*  Return getComponent   */
      cb(null, Games)

    /* Webpack named bundle   */
    }, 'Games')
  },
  childRoutes: [
    Game // not function for sync route
    // async routes definitions require function here i.e. Project(store)
  ]
})
