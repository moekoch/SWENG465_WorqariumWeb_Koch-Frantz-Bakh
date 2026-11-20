import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoCheckmark } from 'react-icons/io5'
import { api, clearToken } from '../api.js'
import { applySettingsToPage, loadSettings, saveSettings } from '../settings.js'
import './Settings.css'

// choices for the dropdowns: [value, label]
const TEXT_SIZES = [['standard', 'Standard'], ['large', 'Large'], ['larger', 'Larger']]
const FOCUS_LENGTHS = [[15, '15 minutes'], [25, '25 minutes'], [45, '45 minutes']]
const WHO_OPTIONS = [['friends', 'Friends only'], ['everyone', 'Everyone'], ['nobody', 'No one']]
const CHAT_NOTIFICATION_OPTIONS = [['mentions', 'Mentions'], ['all', 'All messages'], ['none', 'None']]

// one row: title and hint on the left, a control on the right
function SettingRow({ id, title, hint, children }) {
  return (
    <div className="setting-row">
      <div className="setting-text">
        <h3 id={id}>{title}</h3>
        <p>{hint}</p>
      </div>
      {children}
    </div>
  )
}

// on / off switch with its state written out next to it
function Toggle({ labelledBy, checked, onChange }) {
  return (
    <div className="toggle">
      <span className="toggle-state" aria-hidden="true">{checked ? 'On' : 'Off'}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelledBy}
        className="switch"
        onClick={() => onChange(!checked)}
      >
        <span className="switch-thumb" />
      </button>
    </div>
  )
}

// dropdown (native, so it works with keyboards and screen readers)
function Select({ labelledBy, value, options, onChange }) {
  return (
    <select
      className="setting-select"
      aria-labelledby={labelledBy}
      value={value}
      // focus length is a number, everything else is text
      onChange={(event) => onChange(typeof value === 'number' ? Number(event.target.value) : event.target.value)}
    >
      {options.map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>{optionLabel}</option>
      ))}
    </select>
  )
}

function Settings() {
  // used to send the user to the login page after logging out
  const navigate = useNavigate()

  // comfort and privacy preferences (saved in this browser)
  const [settings, setSettings] = useState(loadSettings)

  // "Preferences saved" chip, hidden a moment after each change
  const [showSavedChip, setShowSavedChip] = useState(false)
  const savedChipTimer = useRef(null)
  useEffect(() => () => clearTimeout(savedChipTimer.current), [])

  // password in delete popup and error under it
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteError, setDeleteError] = useState('')

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

  // change one preference: save it, apply it, and flash the saved chip
  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    applySettingsToPage(next)

    setShowSavedChip(true)
    clearTimeout(savedChipTimer.current)
    savedChipTimer.current = setTimeout(() => setShowSavedChip(false), 2500)
  }

  // clear the password form
  const resetPasswordForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
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
  const handleDelete = async () => {
    // password needed to prove account owner
    if (!deletePassword) {
      setDeleteError('Enter your password to delete your account.')
      return
    }

    try {
      // server deletes account the token belongs to
      await api('/api/users/me', { method: 'DELETE', body: { password: deletePassword } })

      // forget token and go to login
      clearToken()
      deleteDialog.current.close()
      navigate('/')
    } catch (error) {
      // keep the popup open to show error
      setDeleteError(error.message)
    }
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <h1>Make yourself comfortable.</h1>
          <p>Your space, your pace. Adjust what feels right.</p>
        </div>
        {/* announced politely to screen readers */}
        <div role="status" aria-live="polite">
          {showSavedChip && (
            <span className="saved-chip">
              <IoCheckmark size={16} aria-hidden="true" /> Preferences saved
            </span>
          )}
        </div>
      </header>

      <div className="settings-columns">
        {/* ---------- comfort ---------- */}
        <section className="settings-card" aria-labelledby="comfort-heading">
          <h2 id="comfort-heading">Comfort &amp; accessibility</h2>

          <SettingRow id="reduced-motion-label" title="Reduced motion" hint="Keep bubbles and transitions still.">
            <Toggle
              labelledBy="reduced-motion-label"
              checked={settings.reducedMotion}
              onChange={(value) => updateSetting('reducedMotion', value)}
            />
          </SettingRow>

          <SettingRow id="ambient-audio-label" title="Ambient audio" hint="A quieter aquarium, by default.">
            <Toggle
              labelledBy="ambient-audio-label"
              checked={settings.ambientAudio}
              onChange={(value) => updateSetting('ambientAudio', value)}
            />
          </SettingRow>

          <SettingRow id="text-size-label" title="Text size" hint="Choose a comfortable reading size.">
            <Select
              labelledBy="text-size-label"
              value={settings.textSize}
              options={TEXT_SIZES}
              onChange={(value) => updateSetting('textSize', value)}
            />
          </SettingRow>

          <SettingRow id="focus-duration-label" title="Focus duration" hint="Make room for a pause when needed.">
            <Select
              labelledBy="focus-duration-label"
              value={settings.focusMinutes}
              options={FOCUS_LENGTHS}
              onChange={(value) => updateSetting('focusMinutes', value)}
            />
          </SettingRow>
        </section>

        {/* ---------- privacy ---------- */}
        <section className="settings-card" aria-labelledby="privacy-heading">
          <h2 id="privacy-heading">Privacy &amp; notifications</h2>

          <SettingRow id="tank-visitors-label" title="Tank visitors" hint="You choose who can drop in.">
            <Select
              labelledBy="tank-visitors-label"
              value={settings.tankVisitors}
              options={WHO_OPTIONS}
              onChange={(value) => updateSetting('tankVisitors', value)}
            />
          </SettingRow>

          <SettingRow id="direct-messages-label" title="Direct messages" hint="Keep your conversations comfortable.">
            <Select
              labelledBy="direct-messages-label"
              value={settings.directMessages}
              options={WHO_OPTIONS}
              onChange={(value) => updateSetting('directMessages', value)}
            />
          </SettingRow>

          <SettingRow id="online-status-label" title="Online status" hint="Who can see when you’re online.">
            <Select
              labelledBy="online-status-label"
              value={settings.onlineStatus}
              options={WHO_OPTIONS}
              onChange={(value) => updateSetting('onlineStatus', value)}
            />
          </SettingRow>

          <SettingRow id="focus-status-label" title="Show focus status" hint="Let friends know you are focusing.">
            <Toggle
              labelledBy="focus-status-label"
              checked={settings.showFocusStatus}
              onChange={(value) => updateSetting('showFocusStatus', value)}
            />
          </SettingRow>

          <SettingRow id="chat-notifications-label" title="Chat notifications" hint="Only the messages you want.">
            <Select
              labelledBy="chat-notifications-label"
              value={settings.chatNotifications}
              options={CHAT_NOTIFICATION_OPTIONS}
              onChange={(value) => updateSetting('chatNotifications', value)}
            />
          </SettingRow>
        </section>
      </div>

      {/* ---------- account ---------- */}
      <section className="settings-card settings-account" aria-labelledby="account-heading">
        <h2 id="account-heading">Account</h2>
        <div className="settings-account-actions">
          <button type="button" className="settings-button" onClick={() => passwordDialog.current.showModal()}>
            Change password
          </button>
          <button type="button" className="settings-button" onClick={() => logoutDialog.current.showModal()}>
            Log out
          </button>
          <button type="button" className="settings-button settings-button-danger" onClick={() => deleteDialog.current.showModal()}>
            Delete account
          </button>
        </div>
      </section>

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
      <dialog
        ref={deleteDialog}
        className="dialog"
        onClose={() => {
          setDeletePassword('')
          setDeleteError('')
        }}
      >
        <h2>Delete your account?</h2>
        <p>This permanently deletes your account and can't be undone.</p>

        {/* password field to confirm owner */}
        <div className="field delete-password">
          <label htmlFor="delete-password">Enter your password to confirm</label>
          <input
            id="delete-password"
            type="password"
            autoComplete="current-password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </div>

        {/* only show error when there is one */}
        {deleteError && (
          // screen readers read the error out loud
          <p className="error-msg" role="alert">
            {deleteError}
          </p>
        )}

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
    </div>
  )
}

export default Settings
