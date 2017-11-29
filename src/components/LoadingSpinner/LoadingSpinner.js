import React, { PropTypes } from 'react'
import classes from './LoadingSpinner.scss'

export const LoadingSpinner = ({ size }) => (
<div class="spinner">
  <div class="bounce1"></div>
  <div class="bounce2"></div>
  <div class="bounce3"></div>
</div>
)

LoadingSpinner.propTypes = {
  size: PropTypes.number
}

export default LoadingSpinner