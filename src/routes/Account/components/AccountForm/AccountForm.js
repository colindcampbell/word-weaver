import React, { PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import { ACCOUNT_FORM_NAME } from 'constants'
import ProviderDataForm from '../ProviderDataForm'
// import classes from './AccountForm.scss'

export const AccountForm = ({ account, handleSubmit, submitting }) => (
  <form onSubmit={handleSubmit}>
    <h4>Account</h4>
    <div>
      <label htmlFor="displayName">Display Name</label>
      <Field name="displayName" component="input" type="text" value={account.displayName}/>    
    </div> 
    <div>
      <label htmlFor="email">Email</label>
      <Field name="email" component="input" type="email" value={account.email}/>    
    </div>
    {
      !!account && !!account.providerData &&
        <div>
          <h4>Linked Accounts</h4>
          <ProviderDataForm
            providerData={account.providerData}
          />
        </div>
    }
    <button
      label='Save'
      type='submit'
    >Submit</button>
  </form>
)

AccountForm.propTypes = {
  account: PropTypes.object,
  handleSubmit: PropTypes.func,
  submitting: PropTypes.bool
}

export default reduxForm({
  form: ACCOUNT_FORM_NAME
})(AccountForm)