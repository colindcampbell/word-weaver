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
      <div className="df acc jcc fww posf" style={{top:0,bottom:0,right:0,left:0,overflowY:"auto"}}>
        <div className="w100 tac" style={{marginBottom:30,marginTop:60}} >
          <svg style={{maxWidth:"80%"}} width="359px" height="54px" viewBox="0 0 359 54" version="1.1">
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
            </defs>
            <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="WordWeaver">
                <g id="Weaver" transform="translate(155.000000, 1.000000)">
                  <path d="M194.447894,33.1589189 C195.970752,31.4659459 197.96218,29.7145946 200.01218,29.7145946 C201.24218,29.7145946 202.355037,29.8897297 202.88218,30.0648649 L203.585037,23.1178378 C203.526466,23.1178378 202.589323,22.7675676 201.007894,22.7675676 C198.255037,22.7675676 196.439323,23.8767568 193.569323,26.2118919 L192.866466,23.3513514 L186.775037,23.3513514 L186.775037,52.5405405 L194.447894,52.5405405 L194.447894,33.1589189 Z" id="r" fill-opacity="0.85" fill="#5A35F0"></path>
                  <path d="M181.568346,50.7308108 C177.351203,52.3654054 174.598346,52.8908108 171.259774,52.8908108 C162.239774,52.8908108 157.495489,48.2789189 157.495489,38.0627027 C157.495489,27.9632432 162.122631,22.7675676 170.556917,22.7675676 C177.292631,22.7675676 182.15406,26.8540541 182.15406,35.7275676 C182.15406,37.0118919 182.095489,38.7632432 181.919774,40.2227027 L164.992631,40.2227027 C164.992631,45.0097297 167.921203,46.9362162 171.90406,46.9362162 C174.305489,46.9362162 176.82406,46.4691892 180.279774,45.5351351 L181.568346,50.7308108 Z M174.832631,34.8518919 L174.832631,34.4432432 C174.832631,31.1156757 173.485489,28.4886486 169.971203,28.4886486 C166.398346,28.4886486 164.992631,31.5827027 164.93406,34.8518919 L174.832631,34.8518919 Z" id="e2" fill="url(#linearGradient-1)"></path>
                  <polygon id="v" fill="#007AD5" points="157.911654 23.3513514 148.598797 52.5405405 140.047369 52.5405405 130.793083 23.3513514 138.700226 23.3513514 144.381654 44.9513514 150.121654 23.3513514"></polygon>
                  <path d="M124.004963,52.5405405 L122.833534,49.6216216 C120.19782,52.0151351 118.440677,52.9491892 115.394963,52.9491892 C110.592106,52.9491892 106.082106,49.3297297 106.082106,43.5502703 C106.082106,37.8291892 110.35782,34.1513514 119.729248,34.1513514 L122.130677,34.1513514 C122.130677,30.9989189 120.724963,28.6054054 117.269248,28.6054054 C115.043534,28.6054054 111.236391,29.0724324 108.600677,29.772973 L107.312106,24.6356757 C111.119248,23.4097297 115.27782,22.7675676 118.96782,22.7675676 C126.816391,22.7675676 129.62782,26.6789189 129.62782,32.6918919 L129.62782,52.5405405 L124.004963,52.5405405 Z M122.013534,39.7556757 L119.494963,39.7556757 C114.86782,39.7556757 113.872106,41.0983784 113.872106,43.2583784 C113.872106,45.36 115.160677,46.9362162 117.034963,46.9362162 C118.616391,46.9362162 119.904963,46.0021622 122.013534,43.7837838 L122.013534,39.7556757 Z" id="a" fill="#007AD5"></path>
                  <path d="M103.276843,50.7308108 C99.0596997,52.3654054 96.3068426,52.8908108 92.9682712,52.8908108 C83.9482712,52.8908108 79.2039854,48.2789189 79.2039854,38.0627027 C79.2039854,27.9632432 83.8311283,22.7675676 92.265414,22.7675676 C99.0011283,22.7675676 103.862557,26.8540541 103.862557,35.7275676 C103.862557,37.0118919 103.803985,38.7632432 103.628271,40.2227027 L86.7011283,40.2227027 C86.7011283,45.0097297 89.6296997,46.9362162 93.6125569,46.9362162 C96.0139854,46.9362162 98.5325569,46.4691892 101.988271,45.5351351 L103.276843,50.7308108 Z M96.5411283,34.8518919 L96.5411283,34.4432432 C96.5411283,31.1156757 95.1939854,28.4886486 91.6796997,28.4886486 C88.1068426,28.4886486 86.7011283,31.5827027 86.6425569,34.8518919 L96.5411283,34.8518919 Z" id="e1" fill="url(#linearGradient-2)"></path>
                  <path d="M0.967282698,2.67916802 L18.2538491,50.5592926 C18.6830985,51.7482222 19.8115317,52.5405405 21.0755763,52.5405405 L28.2629673,52.5405405 C29.5584217,52.5405405 30.7075491,51.7090013 31.1125727,50.4784899 L42.2638544,16.5995276 C42.4365261,16.0749298 43.0017748,15.7896373 43.5263726,15.962309 C43.8241956,16.0603376 44.0587994,16.2923762 44.1600965,16.5891033 L55.7399695,50.5097629 C56.1545761,51.7242607 57.295773,52.5405405 58.5790905,52.5405405 L65.3172808,52.5405405 C66.5813254,52.5405405 67.7097587,51.7482222 68.139008,50.5592926 L85.4255744,2.67916802 C85.8006686,1.64023676 85.2625223,0.493942688 84.223591,0.118848545 C84.005789,0.0402136317 83.7759855,3.64118285e-15 83.544423,5.32907052e-15 L77.3143088,3.55271368e-15 C75.6035904,-2.21072512e-15 74.0822385,1.08790812 73.5291407,2.70674729 L62.6555963,34.5320765 C62.4770354,35.0546991 61.9086138,35.3336163 61.3859911,35.1550553 C61.0893187,35.0536933 60.8573541,34.8190662 60.7593843,34.5212564 L50.3076737,2.75002767 C49.767837,1.10902595 48.2355092,1.38935152e-14 46.5079936,1.42108547e-14 L39.8848635,1.50990331e-14 C38.1573479,1.54163726e-14 36.6250201,1.10902595 36.0851834,2.75002767 L25.6162568,34.5735901 C25.4436716,35.0982164 24.87847,35.3836022 24.3538436,35.211017 C24.0598151,35.1142911 23.8271519,34.8868585 23.7237665,34.5951049 L12.4086918,2.66396827 C11.8428551,1.06717743 10.3324922,1.4244415e-14 8.63841072,1.15463195e-14 L2.84843415,4.4408921e-15 C1.74386465,2.68168864e-15 0.848434152,0.8954305 0.848434152,2 C0.848434152,2.23156247 0.888647784,2.46136598 0.967282698,2.67916802 Z" id="W2" fill="#009B90"></path>
                </g>
                <g id="Word" transform="translate(0.000000, 1.000000)" fill="#445566">
                  <path d="M151.447854,52.5405405 L145.718624,52.5405405 L144.549393,49.212973 C140.749393,52.0735135 138.469393,52.8908108 136.014008,52.8908108 C130.343239,52.8908108 126.426316,48.0454054 126.426316,38.1794595 C126.426316,27.612973 131.103239,22.7675676 137.124777,22.7675676 C139.287854,22.7675676 141.217085,23.5264865 143.906316,25.6864865 L143.906316,11.6756757 L151.447854,11.6756757 L151.447854,52.5405405 Z M143.847854,43.5502703 L143.847854,31.932973 C141.860162,30.2983784 140.223239,29.3643243 138.703239,29.3643243 C135.955547,29.3643243 134.026316,32.0497297 134.026316,37.9459459 C134.026316,43.4335135 135.7217,46.1189189 138.469393,46.1189189 C139.989393,46.1189189 141.8017,45.2432432 143.847854,43.5502703 Z" id="ord-d"></path>
                  <path d="M116.55247,33.1589189 L116.55247,52.5405405 L108.894008,52.5405405 L108.894008,23.3513514 L114.974008,23.3513514 L115.675547,26.2118919 C118.540162,23.8767568 120.35247,22.7675676 123.100162,22.7675676 C124.678624,22.7675676 125.614008,23.1178378 125.67247,23.1178378 L124.970931,30.0648649 C124.444777,29.8897297 123.334008,29.7145946 122.106316,29.7145946 C120.060162,29.7145946 118.07247,31.4659459 116.55247,33.1589189 Z" id="ord-r"></path>
                  <path d="M90.8355466,52.9491892 C82.2417005,52.9491892 77.6817005,47.2281081 77.6817005,37.9459459 C77.6817005,28.6637838 82.2417005,22.7675676 90.8355466,22.7675676 C99.3709312,22.7675676 104.690931,28.6637838 104.690931,37.9459459 C104.690931,47.2281081 99.9555466,52.9491892 90.8355466,52.9491892 Z M96.9155466,37.8875676 C96.9155466,32.4 95.4540082,28.9556757 91.1863159,28.9556757 C86.860162,28.9556757 85.340162,32.5167568 85.340162,37.8875676 C85.340162,43.2583784 86.9770851,46.7027027 91.2447774,46.7027027 C95.6878543,46.7027027 96.9155466,43.2 96.9155466,37.8875676 Z" id="ord-o"></path>
                  <path d="M0.965061543,2.67804036 L18.2189922,50.5576011 C18.6477523,51.7474081 19.7766256,52.5405405 21.0413295,52.5405405 L28.2045942,52.5405405 C29.5006644,52.5405405 30.6501919,51.7082236 31.0547219,50.4769018 L42.1826396,16.6053733 C42.3550189,16.0806793 42.9201085,15.7950718 43.4448026,15.9674511 C43.7430581,16.0654379 43.9779859,16.2978007 44.079241,16.5949626 L55.6348366,50.5081338 C56.0489504,51.7234683 57.1905629,52.5405405 58.4745132,52.5405405 L65.1894397,52.5405405 C66.4541436,52.5405405 67.5830169,51.7474081 68.011777,50.5576011 L85.2657077,2.67804036 C85.640179,1.63888446 85.1013458,0.492913151 84.0621898,0.118441799 C83.8447195,0.0400739362 83.6153094,1.28980425e-15 83.3841495,1.33226763e-15 L77.1763561,0 C75.4647934,-5.76628326e-15 73.942887,1.0889651 73.3904462,2.70892067 L62.5400416,34.5262178 C62.3617807,35.0489429 61.7935193,35.3281863 61.2707942,35.1499254 C60.9736871,35.0486053 60.7413982,34.8136543 60.6434701,34.5154118 L50.2139829,2.7521444 C49.6748044,1.11006252 48.1419434,7.67611555e-15 46.4136071,7.99360578e-15 L39.8171622,1.24344979e-14 C38.0888259,1.27519881e-14 36.5559649,1.11006252 36.0167863,2.7521444 L25.5700795,34.5678545 C25.3977866,35.0925769 24.8327441,35.3782775 24.3080217,35.2059846 C24.0135562,35.1092967 23.7805656,34.8815364 23.6772181,34.5893416 L12.3861988,2.66619595 C11.8210165,1.06825349 10.3100779,1.18522009e-14 8.61512913,1.0658141e-14 L2.84661974,3.99680289e-15 C1.74205024,2.23759943e-15 0.846619745,0.8954305 0.846619745,2 C0.846619745,2.23115987 0.886693681,2.46056999 0.965061543,2.67804036 Z" id="W1"></path>
                </g>
              </g>
            </g>
          </svg>
        </div>
        <div className="w100 tac" style={{marginBottom:15}} >
          <img src="/gameplay-sample.gif" alt="Gameplay Sample" style={{borderRadius:3,boxShadow:"0 2px 140px -20px rgba(0,0,0,.7)",maxWidth:"90%"}}/>
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
