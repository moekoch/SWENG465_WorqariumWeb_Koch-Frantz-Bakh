import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, clearToken } from '../api.js'
import './Settings.css'

// options for online status picker
const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'friends', label: 'Friends' },
  { value: 'nobody', label: 'No one' },
]

function Settings() {
  // used to send the user to the login page after logging out
  const navigate = useNavigate()

  // notifications on or off
  const [notifications, setNotifications] = useState(true)

  // user status
  const [visibility, setVisibility] = useState('friends')

  // password form fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // message shown under password fields
  const [passwordError, setPasswordError] = useState('')

  // refs to each popup so buttons can open and close them
  const passwordDialog = useRef(null)
  const logoutDialog = useRef(null)
  const deleteDialog = useRef(null)

  // clear the password form
  const resetPasswordForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
  }

  // toggle notifications on or off
  const handleNotifications = () => {
    const next = !notifications
    setNotifications(next)
  }

  // change who can see the user's online status
  const handleVisibility = (value) => {
    setVisibility(value)
  }

  // check password form then save
  const handlePasswordSubmit = async (e) => {
    // stop the browser from reloading the page
    e.preventDefault()

    // every field must be filled in
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Fill in all three fields.')
      return
    }

    // new password must be long enough
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.')
      return
    }

    // both new password fields must match
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    // change password
    try {
      // check current password and save new one
      await api('/api/users/me/password', {
        method: 'PATCH',
        body: { currentPassword, newPassword }
      })

      // close popup
      passwordDialog.current.close()
    } catch (error) {
      setPasswordError(error.message)
    }
  }

  // log user out
  const handleLogout = () => {
    // forget the login token
    clearToken()

    // close popup and go back to login
    logoutDialog.current.close()
    navigate('/')
  }

  // delete user account
  const handleDelete = () => {
    deleteDialog.current.close()
  }

  return (
    <main className="scene">
      {/* frosted card that holds all settings */}
      <div className="card settings-card">
        <h1>Settings</h1>

        {/* notifications section */}
        <section className="settings-section" aria-labelledby="notifications-heading">
          {/* title and description on the left, switch on the right */}
          <div className="setting-row">
            <div className="setting-text">
              <h2 id="notifications-heading">Notifications</h2>
              {/* text changes with the switch */}
              <p>{notifications ? 'You will get notifications.' : 'Notifications are off.'}</p>
            </div>

            {/* on/off switch */}
            <button
              type="button"
              // tell screen readers this is a switch
              role="switch"
              // tell screen reader if switched on
              aria-checked={notifications}
              // screen reader label
              aria-labelledby="notifications-heading"
              className="switch"
              // toggle the switch
              onClick={handleNotifications}
            >
              {/* white sliding circle */}
              <span className="switch-thumb" />
            </button>
          </div>
        </section>

        {/* online status section */}
        <section className="settings-section" aria-labelledby="visibility-heading">
          <div className="setting-text">
            <h2 id="visibility-heading">Who can see when you’re online</h2>
          </div>

          {/* three-way choice, only one picked */}
          <div className="segmented" role="radiogroup" aria-labelledby="visibility-heading">
            {/* one button per entry */}
            {VISIBILITY_OPTIONS.map((option) => (
              <button
                // track each item in list
                key={option.value}
                type="button"
                // tell screen readers this is a radio option
                role="radio"
                // tell screen reader if selected
                aria-checked={visibility === option.value}
                className="segment"
                // select option
                onClick={() => handleVisibility(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        {/* account section */}
        <section className="settings-section settings-actions" aria-labelledby="account-heading">
          <h2 id="account-heading">Account</h2>

          {/* open change password popup */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => passwordDialog.current.showModal()}
          >
            Change password
          </button>

          {/* open log out popup */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => logoutDialog.current.showModal()}
          >
            Log out
          </button>

          {/* open delete account popup */}
          <button
            type="button"
            className="btn-danger-outline"
            onClick={() => deleteDialog.current.showModal()}
          >
            Delete account
          </button>
        </section>
      </div>

      {/* change password popup */}
      <dialog ref={passwordDialog} className="dialog" onClose={resetPasswordForm}>
        <h2>Change password</h2>

        {/* show own error message instead of browser's */}
        <form className="form" onSubmit={handlePasswordSubmit} noValidate>
          {/* current password field */}
          <div className="field">
            <label htmlFor="current-password">Current password</label>
            <input
              id="current-password"
              type="password"
              // lets password managers fill this in
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          {/* new password field */}
          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              // lets password managers suggest a new password
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          {/* confirm new password field */}
          <div className="field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {/* only show the error when there is one */}
          {passwordError && (
            // screen readers read the error out loud
            <p className="error-msg" role="alert">
              {passwordError}
            </p>
          )}

          {/* popup buttons */}
          <div className="dialog-actions">
            {/* close without saving */}
            <button
              type="button"
              className="btn-secondary"
              onClick={() => passwordDialog.current.close()}
            >
              Cancel
            </button>

            {/* submit form */}
            <button type="submit" className="btn-primary">
              Save password
            </button>
          </div>
        </form>
      </dialog>

      {/* log out popup */}
      <dialog ref={logoutDialog} className="dialog">
        <h2>Log out?</h2>
        <p>You'll need to log in again to get back in.</p>

        {/* popup buttons */}
        <div className="dialog-actions">
          {/* stay logged in */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => logoutDialog.current.close()}
          >
            Cancel
          </button>

          {/* confirm log out */}
          <button type="button" className="btn-primary" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </dialog>

      {/* delete account popup */}
      <dialog ref={deleteDialog} className="dialog">
        <h2>Delete your account?</h2>
        <p>This permanently deletes your account and can't be undone.</p>

        {/* popup buttons */}
        <div className="dialog-actions">
          {/* keep account */}
          <button
            type="button"
            className="btn-secondary"
            onClick={() => deleteDialog.current.close()}
          >
            Cancel
          </button>

          {/* confirm delete */}
          <button type="button" className="btn-danger" onClick={handleDelete}>
            Delete account
          </button>
        </div>
      </dialog>
    </main>
  )
}

export default Settings