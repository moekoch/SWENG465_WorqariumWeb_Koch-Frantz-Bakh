import { useEffect, useRef } from 'react'
import { IoClose } from 'react-icons/io5'
import { getFishImage } from '../fishImages.js'
import { useFriends } from '../friends.js'

// right-side drawer listing friends top to bottom with an online / offline dot
function FriendsPanel({ open, onClose }) {
  const friends = useFriends()
  const onlineCount = friends.filter((friend) => friend.online).length
  const closeButtonRef = useRef(null)

  // Escape closes, and focus moves into the panel when it opens
  useEffect(() => {
    if (!open) return undefined
    closeButtonRef.current?.focus()
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  return (
    <>
      {/* click outside to close */}
      <div className={`friends-backdrop${open ? ' is-open' : ''}`} onClick={onClose} aria-hidden="true" />

      <aside
        className={`friends-panel${open ? ' is-open' : ''}`}
        aria-label="Friends"
        aria-hidden={!open}
        inert={!open}
      >
        <header className="friends-panel-header">
          <div>
            <h2>Friends</h2>
            <p>
              {onlineCount} of {friends.length} online
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="friends-close"
            onClick={onClose}
            aria-label="Close friends"
          >
            <IoClose size={22} aria-hidden="true" />
          </button>
        </header>

        <ul className="friends-list">
          {friends.map((friend) => (
            <li key={friend.id ?? friend.username} className="friend-row">
              {/* round bubble frame around the fish */}
              <span className="friend-avatar">
                <img src={getFishImage(friend.avatarKey)} alt="" />
              </span>
              <span className="friend-name">{friend.username}</span>
              <span className={`friend-status${friend.online ? ' is-online' : ''}`}>
                <span className="friend-status-dot" aria-hidden="true" />
                {friend.online ? 'Online' : 'Offline'}
              </span>
            </li>
          ))}
          {friends.length === 0 && <li className="friend-empty">No friends yet.</li>}
        </ul>
      </aside>
    </>
  )
}

export default FriendsPanel
