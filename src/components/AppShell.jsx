import { Suspense, useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { IoPeopleOutline, IoBookOutline } from 'react-icons/io5'
import { clearToken } from '../api.js'
import { SessionProvider } from '../SessionProvider.jsx'
import { useSession } from '../sessionContext.js'
import { ShellContext } from '../shellContext.js'
import { useFriends } from '../friends.js'
import AmbientBubbles from './AmbientBubbles.jsx'
import BubbleLoader from './BubbleLoader.jsx'
import ChatBar from './ChatBar.jsx'
import Dock from './Dock.jsx'
import FriendsPanel from './FriendsPanel.jsx'
import './AppShell.css'

// breadcrumb text for each route (longest matching prefix wins)
const ROOM_NAMES = [
  ['/go-fish', 'Games / Go Fish'],
  ['/blackjack', 'Games / Blackjack'],
  ['/spades', 'Games / Spades'],
  ['/games', 'Games'],
  ['/tank', 'Your Tank'],
  ['/library', 'Kelp Library'],
  ['/shop', 'Store'],
  ['/settings', 'Settings'],
  ['/profile', 'Profile'],
  ['/map', 'Map'],
]

function ShellFrame() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { self, error, fishCount } = useSession()
  const friends = useFriends()
  const [friendsOpen, setFriendsOpen] = useState(false)

  const roomName = ROOM_NAMES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? ''
  const onlineFriendCount = friends.filter((friend) => friend.online).length

  // send the user back to login if the server rejects the token
  useEffect(() => {
    if (error === 'unauthorized') {
      clearToken()
      navigate('/')
    }
  }, [error, navigate])

  const shellValue = useMemo(() => ({ friendsOpen, setFriendsOpen }), [friendsOpen])

  return (
    <ShellContext.Provider value={shellValue}>
      <div className="shell">
        <AmbientBubbles />

        <header className="shell-header">
          <Link to="/map" className="shell-brand">
            <span className="shell-logo" aria-hidden="true" />
            Worqarium
          </Link>
          <span className="shell-crumb">/ {roomName}</span>

          <div className="shell-actions">
            <Link to="/library" className="pill-button pill-find-focus">
              <IoBookOutline size={18} aria-hidden="true" />
              <span>Find your focus</span>
            </Link>

            <button
              type="button"
              className={`pill-button pill-friends${friendsOpen ? ' is-active' : ''}`}
              onClick={() => setFriendsOpen((isOpen) => !isOpen)}
              aria-expanded={friendsOpen}
              aria-controls="friends-panel"
            >
              <IoPeopleOutline size={18} aria-hidden="true" />
              <span>Friends</span>
              {onlineFriendCount > 0 && (
                <span className="pill-badge" aria-label={`${onlineFriendCount} online`}>
                  {onlineFriendCount}
                </span>
              )}
            </button>

            {self && (
              <Link to="/profile" className="shell-user" title="Profile">
                {self.username}
              </Link>
            )}
          </div>
        </header>

        <main className="shell-main">
          {/* lazy pages show the bubble loader while they load */}
          <Suspense fallback={<BubbleLoader label="Loading…" fullscreen />}>
            <Outlet />
          </Suspense>
        </main>

        {/* one rounded card: places on the left, room chat on the right */}
        <footer className="bottom-panel">
          <div className="bottom-nav">
            <span className="bottom-label">ROOM CHAT · {fishCount} FISH</span>
            <Dock />
          </div>
          <div className="bottom-divider" aria-hidden="true" />
          <ChatBar />
        </footer>

        <div id="friends-panel">
          <FriendsPanel open={friendsOpen} onClose={() => setFriendsOpen(false)} />
        </div>
      </div>
    </ShellContext.Provider>
  )
}

// everything signed-in lives inside the live session connection
function AppShell() {
  return (
    <SessionProvider>
      <ShellFrame />
    </SessionProvider>
  )
}

export default AppShell
