import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import { connect } from 'react-redux'
import {
  firebaseConnect,
  isLoaded,
  isEmpty
} from 'react-redux-firebase'
import { LOGIN_PATH, GAMES_PATH } from 'constants'
import { UserIsNotAuthenticated } from 'utils/router'
// import * as firebaseui from 'firebaseui'
import './homeview.css'
import './logo-animation.scss'
// import SignupForm from '../components/SignupForm'


@UserIsNotAuthenticated // redirect to list page if logged in
@firebaseConnect() // add this.props.firebase
@connect( // map redux state to props
  ({firebase: { authError }},{ location }) => ({
    authError
  })
)
export default class Signup extends Component {
  static propTypes = {
    firebase: PropTypes.object,
    authError: PropTypes.object
  }

  // handleSignup = (creds) => {
  //   const { createUser, login } = this.props.firebase
  //   const { email, username } = creds
  //   this.setState({ snackCanOpen: true })
  //   // create new user then login (redirect handled by decorator)
  //   return createUser(creds, { email, username })
  //     .then(() => login(creds))
  // }
  // <div>
    // <span>
      // Already have an account?
    // </span>
    // <Link to={LOGIN_PATH}>
      // Login
    // </Link>
  // </div>
  // <button onClick={() => this.providerLogin('google')}>Google</button>
  providerLogin = (provider) => {
    return this.props.firebase.login({ provider })
      .then(() => {
        this.context.router.push(`${GAMES_PATH}`)
      })
      .catch(e => {
        if (e.code === 'auth/account-exists-with-different-credential') {
          firebase.auth().fetchProvidersForEmail(e.email)
            .then(providers => {
              console.log(providers)
              const existingProvider = providers[0]
              this.providerLogin({ existingProvider })
            })
            .catch(err => { console.log(err) })
        }
      })
  }

  // componentDidMount() {
  //   const ui = new firebaseui.auth.AuthUI(getFirebase().auth());
  //   this.ui = ui
  //   this.initFirebaseUI()
  //   getFirebase().auth().onAuthStateChanged((user) => {
  //     console.log(user)
  //     if (user) {
  //       getFirebase().login(user);
  //     }
  //   });    
  // }

  // componentWillUnmount(){
  //   this.ui.reset()
  // }

  render () {
    const { authError, firebase } = this.props
    return (
      <div className="df acc jcc fww posf" style={{top:0,bottom:0,right:0,left:0}}>
        <div className="w100 tac" style={{marginBottom:60}} >
          <svg width="359px" height="258px" viewBox="0 0 359 258" version="1.1">
            <title>WordWeaver</title>
            <defs>
              <linearGradient x1="1.41638472e-14%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
                <stop stop-color="#007AD5" offset="0%"></stop>
                <stop stop-color="#5A35F0" stop-opacity="0.85" offset="100%"></stop>
              </linearGradient>
              <linearGradient x1="1.41638472e-14%" y1="50%" x2="100%" y2="50%" id="linearGradient-2">
                <stop stop-color="#009B90" offset="0%"></stop>
                <stop stop-color="#007AD5" offset="100%"></stop>
              </linearGradient>
              <filter x="-3.5%" y="-4.9%" width="107.0%" height="112.3%" filterUnits="objectBoundingBox" id="filter-3">
                <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
                <feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
                <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.35 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
                <feMerge>
                  <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                  <feMergeNode in="SourceGraphic"></feMergeNode>
                </feMerge>
              </filter>
              <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-4">
                <stop stop-color="#009B90" offset="0%"></stop>
                <stop stop-color="#007AD5" offset="48.4235491%"></stop>
                <stop stop-color="#5A00F0" stop-opacity="0.85" offset="100%"></stop>
              </linearGradient>
            </defs>
            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="WordWeaver">
                <g id="Weaver" transform="translate(155.000000, 205.000000)">
                  <path d="M194.447894,33.1589189 C195.970752,31.4659459 197.96218,29.7145946 200.01218,29.7145946 C201.24218,29.7145946 202.355037,29.8897297 202.88218,30.0648649 L203.585037,23.1178378 C203.526466,23.1178378 202.589323,22.7675676 201.007894,22.7675676 C198.255037,22.7675676 196.439323,23.8767568 193.569323,26.2118919 L192.866466,23.3513514 L186.775037,23.3513514 L186.775037,52.5405405 L194.447894,52.5405405 L194.447894,33.1589189 Z" id="r" fill-opacity="0.85" fill="#5A35F0"></path>
                  <path d="M181.568346,50.7308108 C177.351203,52.3654054 174.598346,52.8908108 171.259774,52.8908108 C162.239774,52.8908108 157.495489,48.2789189 157.495489,38.0627027 C157.495489,27.9632432 162.122631,22.7675676 170.556917,22.7675676 C177.292631,22.7675676 182.15406,26.8540541 182.15406,35.7275676 C182.15406,37.0118919 182.095489,38.7632432 181.919774,40.2227027 L164.992631,40.2227027 C164.992631,45.0097297 167.921203,46.9362162 171.90406,46.9362162 C174.305489,46.9362162 176.82406,46.4691892 180.279774,45.5351351 L181.568346,50.7308108 Z M174.832631,34.8518919 L174.832631,34.4432432 C174.832631,31.1156757 173.485489,28.4886486 169.971203,28.4886486 C166.398346,28.4886486 164.992631,31.5827027 164.93406,34.8518919 L174.832631,34.8518919 Z" id="e2" fill="url(#linearGradient-1)"></path>
                  <polygon id="v" fill="#007AD5" points="157.911654 23.3513514 148.598797 52.5405405 140.047369 52.5405405 130.793083 23.3513514 138.700226 23.3513514 144.381654 44.9513514 150.121654 23.3513514"></polygon>
                  <path d="M124.004963,52.5405405 L122.833534,49.6216216 C120.19782,52.0151351 118.440677,52.9491892 115.394963,52.9491892 C110.592106,52.9491892 106.082106,49.3297297 106.082106,43.5502703 C106.082106,37.8291892 110.35782,34.1513514 119.729248,34.1513514 L122.130677,34.1513514 C122.130677,30.9989189 120.724963,28.6054054 117.269248,28.6054054 C115.043534,28.6054054 111.236391,29.0724324 108.600677,29.772973 L107.312106,24.6356757 C111.119248,23.4097297 115.27782,22.7675676 118.96782,22.7675676 C126.816391,22.7675676 129.62782,26.6789189 129.62782,32.6918919 L129.62782,52.5405405 L124.004963,52.5405405 Z M122.013534,39.7556757 L119.494963,39.7556757 C114.86782,39.7556757 113.872106,41.0983784 113.872106,43.2583784 C113.872106,45.36 115.160677,46.9362162 117.034963,46.9362162 C118.616391,46.9362162 119.904963,46.0021622 122.013534,43.7837838 L122.013534,39.7556757 Z" id="a" fill="#007AD5"></path>
                  <path d="M103.276843,50.7308108 C99.0596997,52.3654054 96.3068426,52.8908108 92.9682712,52.8908108 C83.9482712,52.8908108 79.2039854,48.2789189 79.2039854,38.0627027 C79.2039854,27.9632432 83.8311283,22.7675676 92.265414,22.7675676 C99.0011283,22.7675676 103.862557,26.8540541 103.862557,35.7275676 C103.862557,37.0118919 103.803985,38.7632432 103.628271,40.2227027 L86.7011283,40.2227027 C86.7011283,45.0097297 89.6296997,46.9362162 93.6125569,46.9362162 C96.0139854,46.9362162 98.5325569,46.4691892 101.988271,45.5351351 L103.276843,50.7308108 Z M96.5411283,34.8518919 L96.5411283,34.4432432 C96.5411283,31.1156757 95.1939854,28.4886486 91.6796997,28.4886486 C88.1068426,28.4886486 86.7011283,31.5827027 86.6425569,34.8518919 L96.5411283,34.8518919 Z" id="e1" fill="url(#linearGradient-2)"></path>
                  <path d="M0.483641349,1.33958401 L18.4922847,51.2197086 C18.7784509,52.0123283 19.5307398,52.5405405 20.3734362,52.5405405 L28.986594,52.5405405 C29.8502303,52.5405405 30.6163152,51.986181 30.8863309,51.1658401 L43.1964286,13.7662527 L55.9710592,51.1866888 C56.2474636,51.996354 57.0082616,52.5405405 57.8638065,52.5405405 L66.019421,52.5405405 C66.8621174,52.5405405 67.6144062,52.0123283 67.9005724,51.2197086 L85.9092158,1.33958401 C86.0967629,0.820118382 85.8276897,0.246971344 85.3082241,0.0594242727 C85.1993231,0.0201068159 85.0844213,2.64326659e-15 84.9686401,2.66453526e-15 L75.8841227,7.99360578e-15 C75.0287635,2.07304004e-15 74.2680876,0.543954058 73.9915387,1.35337365 L61.6913555,37.3542732 L49.8553385,1.37501383 C49.5854201,0.554512974 48.8192562,1.6272631e-14 47.9554984,1.64313008e-14 L38.4373587,1.42108547e-14 C37.5736009,1.43695245e-14 36.807437,0.554512974 36.5375187,1.37501383 L24.7015016,37.3542732 L11.9366917,1.33198414 C11.6537733,0.533588714 10.8985919,1.16989547e-14 10.0515511,1.11022302e-14 L1.42421708,2.22044605e-15 C0.871932326,1.34084432e-15 0.424217076,0.44771525 0.424217076,1 C0.424217076,1.11578124 0.444323892,1.23068299 0.483641349,1.33958401 Z" id="W2" fill="#009B90"></path>
                </g>
                <g id="Word" transform="translate(0.000000, 205.000000)" fill="#445566">
                  <path d="M151.447854,52.5405405 L145.718624,52.5405405 L144.549393,49.212973 C140.749393,52.0735135 138.469393,52.8908108 136.014008,52.8908108 C130.343239,52.8908108 126.426316,48.0454054 126.426316,38.1794595 C126.426316,27.612973 131.103239,22.7675676 137.124777,22.7675676 C139.287854,22.7675676 141.217085,23.5264865 143.906316,25.6864865 L143.906316,11.6756757 L151.447854,11.6756757 L151.447854,52.5405405 Z M143.847854,43.5502703 L143.847854,31.932973 C141.860162,30.2983784 140.223239,29.3643243 138.703239,29.3643243 C135.955547,29.3643243 134.026316,32.0497297 134.026316,37.9459459 C134.026316,43.4335135 135.7217,46.1189189 138.469393,46.1189189 C139.989393,46.1189189 141.8017,45.2432432 143.847854,43.5502703 Z" id="ord-d"></path>
                  <path d="M116.55247,33.1589189 L116.55247,52.5405405 L108.894008,52.5405405 L108.894008,23.3513514 L114.974008,23.3513514 L115.675547,26.2118919 C118.540162,23.8767568 120.35247,22.7675676 123.100162,22.7675676 C124.678624,22.7675676 125.614008,23.1178378 125.67247,23.1178378 L124.970931,30.0648649 C124.444777,29.8897297 123.334008,29.7145946 122.106316,29.7145946 C120.060162,29.7145946 118.07247,31.4659459 116.55247,33.1589189 Z" id="ord-r"></path>
                  <path d="M90.8355466,52.9491892 C82.2417005,52.9491892 77.6817005,47.2281081 77.6817005,37.9459459 C77.6817005,28.6637838 82.2417005,22.7675676 90.8355466,22.7675676 C99.3709312,22.7675676 104.690931,28.6637838 104.690931,37.9459459 C104.690931,47.2281081 99.9555466,52.9491892 90.8355466,52.9491892 Z M96.9155466,37.8875676 C96.9155466,32.4 95.4540082,28.9556757 91.1863159,28.9556757 C86.860162,28.9556757 85.340162,32.5167568 85.340162,37.8875676 C85.340162,43.2583784 86.9770851,46.7027027 91.2447774,46.7027027 C95.6878543,46.7027027 96.9155466,43.2 96.9155466,37.8875676 Z" id="ord-o"></path>
                  <path d="M0.482530772,1.33902018 L18.4571836,51.2185809 C18.7430237,52.0117856 19.4956059,52.5405405 20.3387418,52.5405405 L28.9286456,52.5405405 C29.7926924,52.5405405 30.559044,51.9856626 30.8287307,51.1647814 L43.1153846,13.7662527 L55.8656778,51.1856027 C56.1417537,51.9958257 56.9028287,52.5405405 57.7587955,52.5405405 L65.8920274,52.5405405 C66.7351633,52.5405405 67.4877455,52.0117856 67.7735856,51.2185809 L85.7482385,1.33902018 C85.9354741,0.819442231 85.6660575,0.246456576 85.1464795,0.0592208993 C85.0377444,0.0200369681 84.9230393,-5.1282576e-15 84.8074594,-5.10702591e-15 L75.7453022,7.99360578e-15 C74.8895208,1.42315025e-14 74.1285676,0.54448255 73.8523472,1.35446033 L61.5756119,37.3542732 L49.7621488,1.3760722 C49.4925595,0.55503126 48.726129,1.801043e-14 47.8619609,1.50990331e-14 L38.3688084,1.28785871e-14 C37.5046402,1.30373322e-14 36.7382097,0.55503126 36.4686204,1.3760722 L24.6551573,37.3542732 L11.9146903,1.33309798 C11.6320991,0.534126746 10.8766298,1.3611087e-14 10.0291555,1.37667655e-14 L1.42330987,1.99840144e-15 C0.871025122,1.60932711e-15 0.423309872,0.44771525 0.423309872,1 C0.423309872,1.11557994 0.44334684,1.23028499 0.482530772,1.33902018 Z" id="W1"></path>
                </g>
                <g id="W-logo" filter="url(#filter-3)" transform="translate(37.000000, 2.000000)">
                  <path d="M0.946842015,10.7194851 L51.3342892,150.118841 C53.9116133,157.249136 60.6805653,162 68.2623658,162 L80.5657889,162 C81.4130509,162 82.1683793,161.466137 82.4511308,160.667447 L124.969661,40.5651421 C125.153972,40.0445193 125.725433,39.7718843 126.246056,39.9561948 C126.527072,40.0556797 126.74905,40.2753512 126.851465,40.5553122 L167.003411,150.314086 C169.570852,157.332407 176.248458,162 183.721649,162 L194.761226,162 C195.603649,162 196.355754,161.472126 196.642124,160.679871 L253.75298,2.67987128 C254.128463,1.64108033 253.590745,0.494585134 252.551954,0.119102596 C252.333945,0.0403008916 252.103896,-1.42534382e-14 251.872083,-1.42108547e-14 L233.889583,-1.77635684e-15 C229.695299,-1.00587935e-15 225.946703,2.61740729 224.501745,6.55493357 L183.944418,117.074035 C183.754152,117.592511 183.179603,117.858578 182.661127,117.668313 C182.381814,117.565813 182.162648,117.344261 182.063177,117.063855 L141.952924,3.99404261 C141.103609,1.59984388 138.838559,4.21518425e-16 136.29818,8.8817842e-16 L118.320903,0 C114.086938,7.77766659e-16 110.311854,2.66640647 108.896329,6.65673768 L69.715286,117.107132 C69.5306427,117.627636 68.9590072,117.899906 68.4385024,117.715263 C68.1616352,117.617047 67.9419597,117.402058 67.837798,117.127372 L23.9121814,1.2908661 C23.6175375,0.51385881 22.8731168,2.95597287e-15 22.0421202,3.10862447e-15 L8.47043163,-7.10542736e-15 C4.05215363,-6.29380286e-15 0.470431633,3.581722 0.470431633,8 C0.470431633,8.9272544 0.631635199,9.84744992 0.946842015,10.7194851 Z" id="W" fill="#445566"></path>
                  <path d="M29.1754224,10.7194851 C28.8602156,9.84744992 28.699012,8.9272544 28.699012,8 C28.699012,3.581722 32.280734,8.11624501e-16 36.699012,0 L51.7114561,4.4408921e-15 C52.5538784,2.78969907e-15 53.3059842,0.527873788 53.5923535,1.32012872 L110.70321,159.320129 C110.782012,159.538138 110.822313,159.768186 110.822313,160 C110.822313,161.104569 109.926882,162 108.822313,162 L96.4909462,162 C88.9091457,162 82.1401937,157.249136 79.5628695,150.118841 L29.1754224,10.7194851 Z M230.744035,70.1705617 L254.188987,6.54254997 C255.637469,2.61146841 259.382821,5.68434189e-14 263.572272,5.68434189e-14 L281.529568,2.84217094e-14 C282.634138,2.84217094e-14 283.529568,0.8954305 283.529568,2 C283.529568,2.23951376 283.486546,2.47708011 283.402551,2.70138262 L244.396485,106.863742 C244.202803,107.380952 243.626512,107.643223 243.109302,107.449542 C242.830636,107.345189 242.612918,107.122155 242.515317,106.841053 L230.718642,72.8655513 C230.415102,71.9913306 230.424077,71.0389074 230.744035,70.1705617 Z M138.513045,6.47936779 C139.979308,2.58123968 143.708035,1.57278357e-14 147.872807,4.08562073e-14 L164.517504,1.36779477e-13 C167.062412,1.47613648e-13 169.330469,1.60546607 170.176363,4.00567899 L224.918315,159.335226 C224.993577,159.548783 225.032028,159.773569 225.032028,160 C225.032028,161.104569 224.136598,162 223.032028,162 L203.726269,162 C199.451301,162 195.649123,159.282517 194.264958,155.237837 L155.063703,40.6875126 C154.964192,40.3967327 154.7365,40.1678609 154.446238,40.0668501 C153.924634,39.8853329 153.354643,40.1610272 153.173125,40.6826304 L130.152596,106.833854 C130.054578,107.115518 129.83596,107.338733 129.556397,107.442591 C129.038684,107.634923 128.463079,107.371149 128.270747,106.853435 L115.120443,71.4557407 C114.784639,70.5518294 114.786665,69.5570363 115.12615,68.6545007 L138.513045,6.47936779 Z" id="W-gradient" fill="url(#linearGradient-4)" transform="translate(156.114290, 81.000000) scale(-1, 1) translate(-156.114290, -81.000000) "></path>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div className="w100" id="firebaseui-auth-container">
          <div className="firebaseui-container firebaseui-page-provider-sign-in firebaseui-id-page-provider-sign-in"><div className="firebaseui-card-content">
            <div>
              <ul className="firebaseui-idp-list">
                <li className="firebaseui-list-item">
                  <button style={{marginBottom:5}} onClick={() => this.providerLogin('google')} className="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-google firebaseui-id-idp-button">
                    <span className="firebaseui-idp-icon-wrapper">
                      <img className="firebaseui-idp-icon" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" />
                    </span>
                    <span className="firebaseui-idp-text firebaseui-idp-text-long">Sign in with Google</span>
                    <span className="firebaseui-idp-text firebaseui-idp-text-short">Google</span>
                  </button>
                  <button style={{marginBottom:5}} onClick={() => this.providerLogin('facebook')} className="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-facebook firebaseui-id-idp-button">
                    <span className="firebaseui-idp-icon-wrapper">
                      <img className="firebaseui-idp-icon" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/facebook.svg" />
                    </span>
                    <span className="firebaseui-idp-text firebaseui-idp-text-long">Sign in with Facebook</span>
                    <span className="firebaseui-idp-text firebaseui-idp-text-short">Facebook</span>
                  </button>
                  <button onClick={() => this.providerLogin('github')} className="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-github firebaseui-id-idp-button">
                    <span className="firebaseui-idp-icon-wrapper">
                      <img className="firebaseui-idp-icon" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/github.svg" />
                    </span>
                    <span className="firebaseui-idp-text firebaseui-idp-text-long">Sign in with GitHub</span>
                    <span className="firebaseui-idp-text firebaseui-idp-text-short">GitHub</span>
                  </button>                  
                  <br/>
                  <br/>
                  <div className="tac" style={{color:"#445566",fontSize:10}}>
                    <a target="_blank" style={{color:"#445566"}} href="/privacypolicy.htm">Privacy Policy</a> | <a target="_blank"  style={{color:"#445566"}} href="/termsofservice.htm">Terms of Service</a>
                  </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }


}




                  // <li className="firebaseui-list-item">
                  //   <button className="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-idp-password firebaseui-id-idp-button" >
                  //     <span className="firebaseui-idp-icon-wrapper">
                  //       <img className="firebaseui-idp-icon" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/mail.svg" />
                  //     </span>
                  //     <span className="firebaseui-idp-text firebaseui-idp-text-long">Sign in with email</span>
                  //     <span className="firebaseui-idp-text firebaseui-idp-text-short">Email</span>
                  //   </button>
                  // </li>
  // initFirebaseUI = () => {
  //   // const { firebase } = this.props
  //   // const { router } = this.context
  //   var uiConfig = {
  //     signInSuccessUrl: '/games',
  //     signInOptions: [
  //       // Leave the lines as is for the providers you want to offer your users.
  //       getFirebase().auth.GoogleAuthProvider.PROVIDER_ID,
  //       // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  //       // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  //       // firebase.auth.GithubAuthProvider.PROVIDER_ID,
  //       // firebase.auth.EmailAuthProvider.PROVIDER_ID,
  //       // firebase.auth.PhoneAuthProvider.PROVIDER_ID
  //     ],
  //     // Terms of service url.
  //     tosUrl: 'https://wordweaver.io'
  //   };
  //   console.log(this.ui)
  //   // The start method will wait until the DOM is loaded.
  //   this.ui.start('#firebaseui-auth-container', uiConfig);     
  // }
