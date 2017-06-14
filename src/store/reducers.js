import { combineReducers } from 'redux'
import locationReducer from './location'
import { firebaseStateReducer as firebase } from 'react-redux-firebase'
import { reducer as form } from 'redux-form'

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    location: locationReducer,
  	firebase,
    form,
    ...asyncReducers
  })
}

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return

  store.asyncReducers[key] = reducer
  store.replaceReducer(makeRootReducer(store.asyncReducers))
}

export default makeRootReducer
