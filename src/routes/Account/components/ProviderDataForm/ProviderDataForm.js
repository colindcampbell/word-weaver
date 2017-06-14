import React, { PropTypes } from 'react'

export const ProviderData = ({ providerData }) => (
  <div>
    <ul>
      {
        providerData.map((providerAccount, i) => (
          <li key={i}>
            <h6>Provider: {providerAccount.providerId}</h6>
            <p>Display Name: {providerAccount.displayName}</p>
            <h5>Email: {providerAccount.email}</h5>
          </li>
        ))
      }
    </ul>
  </div>
)

ProviderData.propTypes = {
  providerData: PropTypes.array.isRequired
}

export default ProviderData