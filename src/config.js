export const fbConfig = {
  apiKey: "AIzaSyD01cdKDKf3mD37WR5rfcPSm5ZjBHhXJVA",
  authDomain: "word-weaver.firebaseapp.com",
  databaseURL: "https://word-weaver.firebaseio.com",
  projectId: "word-weaver",
  storageBucket: "word-weaver.appspot.com",
  messagingSenderId: "213706858844"
}

// Config for react-redux-firebase
// For more details, visit https://prescottprue.gitbooks.io/react-redux-firebase/content/config.html
export const rrfConfig = {
  userProfile: 'users', // root that user profiles are written to
  enableLogging: false, // enable/disable Firebase Database Logging
  updateProfileOnLogin: true // enable/disable updating of profile on login
  // profileDecorator: (userData) => ({ email: userData.email }) // customize format of user profile
}

export const env = 'development'

export default { fbConfig, rrfConfig, env }