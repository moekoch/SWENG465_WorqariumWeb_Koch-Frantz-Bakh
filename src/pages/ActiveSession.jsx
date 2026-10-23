import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../api.js'
import { getFishImage } from '../fishImages.js'
import { useSession } from '../useSession.js'
import './ActiveSession.css'

// everyone shares one session for now
const SESSION_ID = 'main'

function ActiveSession() {
  const navigate = useNavigate()

  // join session and get everyone's fish
  const { self, players, error, move } = useSession(SESSION_ID)

  // send the user back to login if server rejects token
  useEffect(() => {
    if (error === 'unauthorized') {
      clearToken()
      navigate('/')
    }
  }, [error, navigate])

  // swim to where user clicked
  const handleClick = (e) => {
    // turn the click position into a fraction of the area (0 to 1)
    const rect = e.currentTarget.getBoundingClientRect()
    move((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height)
  }

  // user's fish and everyone else's
  const everyone = self ? [self, ...Object.values(players)] : Object.values(players)

  return (
    <main className="scene">
      {/* water area click to swim */}
      <section
        className="session-area"
        aria-label="Active session, click to swim"
        onClick={handleClick}
      >
        {/* status messages */}
        {!self && !error && <p className="session-message">Diving in...</p>}
        {error && error !== 'unauthorized' && (
          <p className="error-msg session-message" role="alert">
            {error}
          </p>
        )}

        {/* one fish per player */}
        {everyone.map((player) => (
          <div
            // track each item in list
            key={player.id}
            // highlight user's own fish
            className={`fish${player.id === self?.id ? ' is-self' : ''}`}
            // position as percentage of area
            style={{ left: `${player.x * 100}%`, top: `${player.y * 100}%` }}
          >
            <img src={getFishImage(player.avatarKey)} alt="" />
            <span className="fish-name">{player.username}</span>
          </div>
        ))}
      </section>
    </main>
  )
}

export default ActiveSession