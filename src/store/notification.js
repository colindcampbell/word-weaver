// ------------------------------------
// Constants
// ------------------------------------
export const SHOW_NOTIFICATION = 'SHOW_NOTIFICATION'

// ------------------------------------
// Actions
// ------------------------------------
export function showNotification (message) {
  return {
    type    : SHOW_NOTIFICATION,
    payload : {
    	text: message.text,
    	type: message.type
    }
  }
}

// ------------------------------------
// Specialized Action Creator
// ------------------------------------
export const actions = {
	showNotification
}

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [SHOW_NOTIFICATION] : (state,action) => action.payload
}

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = { text:'',type:'' }
export default function notificationReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type]

  return handler ? handler(state, action) : state
}
