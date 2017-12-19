import React, { PropTypes } from 'react'
import { Field, reduxForm } from 'redux-form'
import { ACCOUNT_FORM_NAME } from 'constants'
import { Link } from 'react-router'
// import ProviderDataForm from '../ProviderDataForm'
// import classes from './AccountForm.scss'

export const AccountForm = ({ account, handleSubmit, submitting, onLogout, onDelete }) => (
  <form onSubmit={handleSubmit}>
    <div style={{marginBottom:10}}>
      <label style={{fontSize:18}} htmlFor="userName">Display Name: </label>
      <Field style={{padding:3,borderRadius:2,border:"none",boxShadow:"0 1px 5px -2px rgba(0,0,0,.5)",fontSize:18}} name="userName" component="input" type="text" maxlength="24" value={account.userName}/>    
    </div>
    <button
      className="button small bgP2"
      label='Save'
      type='submit'
      style={{marginRight:5,border:"none"}}
    >Update</button>
    <div className="button small bgP1 dib" style={{marginRight:5}} onClick={onLogout}>Logout</div>
    <Link onClick={onDelete} style={{color:"#ffffff",background:"#dd0033",marginRight:5}} className="button small dib" to="/games">Delete Account</Link>
    <Link style={{color:"#ffffff"}} className="button small bgP3 dib" to="/games">Back</Link>
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