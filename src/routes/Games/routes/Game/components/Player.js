import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  isLoaded,
  isEmpty
} from 'react-redux-firebase'
import './player.scss'
import AnimateOnChange from 'utils/AnimateOnChange'

export default class Player extends Component {
  componentWillMount() {
    this.setState({
      animate:false
    })
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.playerGame.notification.text !== this.props.playerGame.notification.text) {
      this.setState({
        animate:true
      })
    }
  }
  componentWillUpdate(nextProps, nextState) {
    if (nextState.animate === true && this.state.animate === true && this.animTimeout !== 'cleared') {
      clearTimeout(this.animTimeout)
      this.animTimeout = 'cleared'
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.animate !== false && this.state.animate !== false) {
      this.animTimeout = setTimeout(() => {
        this.setState({
          animate:false
        })
      },800)
    }
  }
  render() {
    const { profile, id, playerGame } = this.props
    const notification = !isEmpty(playerGame.notification) && playerGame.notification.text !== '' &&
      playerGame.notification.text
    return (
      <div key={id} style={{ width: "33%", textAlign:"center", }} >
        <img src={ profile.avatarUrl } style={{width:80,height:"auto",borderRadius:40,border:`4px solid ${playerGame.color}`}}/>
        <h3>{ profile.displayName }</h3>
        <h3>{ !isEmpty(playerGame) ? playerGame.score : 'Loading Score...' }</h3>
        <div style={{color:playerGame.color,fontWeight:"bold"}}>
          <AnimateOnChange
            baseClassName="notification"
            animationClassName="notification-animation"
            animate={this.state.animate}>
            { notification }
          </AnimateOnChange>
        </div>
      </div>
    )
  }
}

Player.propTypes = {
  profile     : PropTypes.object.isRequired,
  playerGame  : PropTypes.object.isRequired
}