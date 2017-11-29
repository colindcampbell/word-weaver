import { UserAuthWrapper } from 'redux-auth-wrapper'
import { browserHistory } from 'react-router'
import { SIGNUP_PATH } from 'constants'
import { pathToJS } from 'react-redux-firebase'
import LoadingSpinner from 'components/LoadingSpinner'
import { showNotification } from 'store/notification'

const AUTHED_REDIRECT = 'AUTHED_REDIRECT'
const UNAUTHED_REDIRECT = 'UNAUTHED_REDIRECT'

export const UserIsAuthenticated = UserAuthWrapper({
  wrapperDisplayName: 'UserIsAuthenticated',
  failureRedirectPath: '/',
  authSelector: ({ firebase: { auth } }) => auth,
  authenticatingSelector: ({ firebase: { auth, isInitializing } }) =>
    isInitializing === true || auth === undefined,
  predicate: auth => auth !== null && auth.isEmpty === false,
  redirectAction: (newLoc) => (dispatch) => {
    browserHistory.replace(newLoc)
    dispatch(showNotification({ text: 'Please login to view that page', type:'error' }))
    // routerActions.replace // if using react-router-redux
    // dispatch({
    //   type: 'SHOW_NOTIFICATION',
    //   payload: { text: 'You must be authenticated.', type:'error' },
    // })
  },
})

export const UserIsNotAuthenticated = UserAuthWrapper({
  wrapperDisplayName: 'UserIsNotAuthenticated',
  allowRedirectBack: false,
  failureRedirectPath: '/games',
  authSelector: ({ firebase: { auth } }) => auth,
  authenticatingSelector: ({ firebase: { auth, isInitializing } }) =>
    isInitializing === true || auth === undefined,
  predicate: auth => auth === null || auth.isEmpty === true,
  redirectAction: (newLoc) => (dispatch) => {
    browserHistory.replace(newLoc)
    dispatch({
      type: 'AUTHED_REDIRECT',
      payload: { message: 'User is authenticated. Redirecting to games...' }
    })
  }
})

export default {
  UserIsAuthenticated,
  UserIsNotAuthenticated
}