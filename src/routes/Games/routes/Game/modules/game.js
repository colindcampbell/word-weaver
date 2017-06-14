// ------------------------------------
// Constants
// ------------------------------------
export const GAME_SHOW_NOTIFICATION = 'GAME_SHOW_NOTIFICATION'
// export const COUNTER_DOUBLE_ASYNC = 'COUNTER_DOUBLE_ASYNC'

// ------------------------------------
// Actions
// ------------------------------------
export const showNotification = (notification) => {
  return {
    type    : GAME_SHOW_NOTIFICATION,
    payload : notification
  }
}

/*  This is a thunk, meaning it is a function that immediately
    returns a function for lazy evaluation. It is incredibly useful for
    creating async actions, especially when combined with redux-thunk! */

// export const submitGuess = (guess, taken, gameid, taken, bank, authid) => {
//   return (dispatch, getState, getFirebase) => {
//     const firebase = getFirebase()
//     let guessTaken = Object.keys(taken).filter(i => (taken[i] !== undefined && taken[i].word === guess))
//     let bankWordKey = Object.keys(bank).filter(i => bank[i].word === guess)
//     if (guessTaken.length === 0 && bankWordKey.length === 1) {
//       // Guess is a word and it's not taken
//       // TODO: add notification "+{point value}"
//       let currentScore = currentPlayers[authid].score,
//           playerColor = currentPlayers[authid].color,
//           newScore = currentScore + bank[bankWordKey].value
//       update(GAMES_PATH+'/'+gameid+'/taken', {[bankWordKey]:{word:guess,color:playerColor}})
//       update('gamePlayers/'+gameid+'/'+auth.uid, {score:newScore})
//     }else if(guessTaken.length === 1 && bankWordKey.length === 1){
//       // TODO: add notification "Too Slow! That word is taken"
//     }else if (bankWordKey.length === 0) {
//       // TODO: add notification "Nice try, that's not a word"
//     }    

//     return new Promise((resolve) => {
//       setTimeout(() => {
//         dispatch({
//           type    : COUNTER_DOUBLE_ASYNC,
//           payload : getState().counter
//         })
//         resolve()
//       }, 200)
//     })
//   }
// }

export const actions = {
  showNotification
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [GAME_SHOW_NOTIFICATION] : (state, action) => action.payload
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = { text:'',type:'success' }
export default function gameReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
