export const LIST_PATH = '/projects'
export const GAME_PATH = ':gameid'
export const ACCOUNT_PATH = '/account'
export const LOGIN_PATH = '/login'
export const SIGNUP_PATH = '/signup'
export const GAMES_PATH = '/games'
export const GAME_PLAYERS_PATH = '/gamePlayers'
export const GAME_ROUNDS_PATH = '/gameRounds'
export const WORD_BANK_PATH = '/wordBank'
export const WORD_PATH = '/word'

export const ACCOUNT_FORM_NAME = 'account'
export const LOGIN_FORM_NAME = 'login'
export const SIGNUP_FORM_NAME = 'signup'
export const NEW_PROJECT_FORM_NAME = 'newProject'
export const RECOVER_CODE_FORM_NAME = 'recoverCode'
export const RECOVER_EMAIL_FORM_NAME = 'recoverEmail'

export const formNames = {
  account: ACCOUNT_FORM_NAME,
  signup: SIGNUP_FORM_NAME,
  login: LOGIN_FORM_NAME,
  recoverCode: RECOVER_CODE_FORM_NAME,
  recoverEmail: RECOVER_EMAIL_FORM_NAME
}

export const paths = {
  list: LIST_PATH,
  account: ACCOUNT_PATH,
  games: GAMES_PATH,
  game: GAME_PATH,
  game: GAME_PLAYERS_PATH,
  login: LOGIN_PATH,
  signup: SIGNUP_PATH,
  words: WORD_PATH,
  wordBank: WORD_BANK_PATH
}

export default { ...paths, ...formNames }