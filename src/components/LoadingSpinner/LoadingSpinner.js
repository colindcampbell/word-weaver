import React, { PropTypes } from 'react'
// import classes from './LoadingSpinner.scss'

export const LoadingSpinner = ({ size }) => (
  <div>
    <div>
      Loading...
    </div>
  </div>
)

LoadingSpinner.propTypes = {
  size: PropTypes.number
}

export default LoadingSpinner