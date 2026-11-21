import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import SwimmingFish from '../components/SwimmingFish.jsx'
import { environmentStyle } from '../environmentImages.js'
import { DEFAULT_FISH_KEY, FISH_IMAGES, getFishImage } from '../fishImages.js'
import { getItemImage } from '../itemImages.js'
import { useSession } from '../sessionContext.js'
import { useShell } from '../shellContext.js'
import './Tank.css'

// fish tint choices (same palette the old avatar editor had)
const AVATAR_COLORS = [
  '#ffffff', '#e60000', '#ff8c32', '#fff000',
  '#00e84a', '#00740f', '#009f89', '#00aaff', '#063cff',
  '#7400ff', '#d000ff', '#ff00a8', '#451c00',
  '#888888', '#111111',
]

// browser storage keys (the first two are what the old Avatar page used)
const FISH_KEY_STORAGE = 'selectedAvatar'
const FISH_COLOR_STORAGE = 'selectedAvatarColor'
const LAYOUT_STORAGE = 'tankLayout'

// where decor sits in the tank, as { [itemId]: { x, y } } with x/y from 0 to 1
function readSavedLayout() {
  try {
    return JSON.parse(localStorage.getItem(LAYOUT_STORAGE)) ?? {}
  } catch {
    return {}
  }
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

// Your own place, like the Club Penguin igloo: swim around, decorate with
// things you own, change your fish, and (later) invite friends over.
function Tank() {
  const { self, chatBubbles } = useSession()
  const { setFriendsOpen } = useShell()

  // fish + color the user picked (kept in this browser, like before)
  const [fishKey, setFishKey] = useState(() => {
    const savedKey = localStorage.getItem(FISH_KEY_STORAGE)
    return savedKey in FISH_IMAGES ? savedKey : DEFAULT_FISH_KEY
  })
  const [fishColor, setFishColor] = useState(
    () => localStorage.getItem(FISH_COLOR_STORAGE) ?? AVATAR_COLORS[0],
  )

  // where the fish is swimming inside the tank
  const [fishPosition, setFishPosition] = useState({ x: 0.5, y: 0.7 })

  // decorating mode and the fish editor drawer
  const [isDecorating, setIsDecorating] = useState(false)
  const [isEditingFish, setIsEditingFish] = useState(false)

  // owned decor from the server and where each piece is placed
  const [ownedItems, setOwnedItems] = useState([])
  const [points, setPoints] = useState(null)
  const [loadError, setLoadError] = useState('')
  const [layout, setLayout] = useState(readSavedLayout)

  // the item currently being dragged
  const [draggingItemId, setDraggingItemId] = useState(null)
  const roomRef = useRef(null)

  // load what the user owns
  useEffect(() => {
    let cancelled = false
    Promise.all([api('/api/items'), api('/api/users/me')])
      .then(([allItems, me]) => {
        if (cancelled) return
        const ownedIds = me.ownedItemIds ?? []
        // free items belong to everyone
        setOwnedItems(allItems.filter((item) => item.price === 0 || ownedIds.includes(item._id)))
        setPoints(me.points)
      })
      .catch(() => {
        if (!cancelled) setLoadError('Could not load your decor.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  // remember decor positions
  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE, JSON.stringify(layout))
  }, [layout])

  // swim to where the user clicked (when not decorating)
  const handleRoomClick = (event) => {
    if (isDecorating) return
    const rect = event.currentTarget.getBoundingClientRect()
    setFishPosition({
      x: clamp((event.clientX - rect.left) / rect.width, 0.06, 0.94),
      y: clamp((event.clientY - rect.top) / rect.height, 0.45, 0.92), // stays in the lower, open water
    })
  }

  // put a piece in the room, or take it back to the inventory
  const togglePlaced = (itemId) => {
    setLayout((prev) => {
      const next = { ...prev }
      if (next[itemId]) delete next[itemId]
      else next[itemId] = { x: 0.5, y: 0.72 }
      return next
    })
  }

  // dragging decor around (pointer events so it works with mouse and touch)
  const handleDecorPointerDown = (event, itemId) => {
    if (!isDecorating) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingItemId(itemId)
  }
  const handleDecorPointerMove = (event, itemId) => {
    if (draggingItemId !== itemId) return
    const rect = roomRef.current.getBoundingClientRect()
    setLayout((prev) => ({
      ...prev,
      [itemId]: {
        x: clamp((event.clientX - rect.left) / rect.width, 0.04, 0.96),
        y: clamp((event.clientY - rect.top) / rect.height, 0.3, 0.95),
      },
    }))
  }
  const handleDecorPointerUp = () => setDraggingItemId(null)

  // save fish choice
  const saveFish = () => {
    localStorage.setItem(FISH_KEY_STORAGE, fishKey)
    localStorage.setItem(FISH_COLOR_STORAGE, fishColor)
    setIsEditingFish(false)
  }

  const placedItems = ownedItems.filter((item) => layout[item._id])

  return (
    <div className="tank-page">
      {/* ---------- the room ---------- */}
      <section className="tank-room-card">
        <header className="tank-room-header">
          <h1>Your Tank</h1>
          <p>A corner of the aquarium that feels like you.</p>
        </header>

        <div
          ref={roomRef}
          className={`tank-room environment env-tank${isDecorating ? ' is-decorating' : ''}`}
          style={environmentStyle('tankBackground')}
          onClick={handleRoomClick}
          aria-label={isDecorating ? 'Your tank. Drag decor to move it.' : 'Your tank. Click to swim.'}
        >
          {/* decor */}
          {placedItems.map((item) => (
            <img
              key={item._id}
              className={`tank-decor${draggingItemId === item._id ? ' is-dragging' : ''}`}
              src={getItemImage(item.imageKey)}
              alt={item.name}
              draggable="false"
              style={{
                left: `${layout[item._id].x * 100}%`,
                top: `${layout[item._id].y * 100}%`,
                zIndex: Math.round(layout[item._id].y * 100),
              }}
              onPointerDown={(event) => handleDecorPointerDown(event, item._id)}
              onPointerMove={(event) => handleDecorPointerMove(event, item._id)}
              onPointerUp={handleDecorPointerUp}
            />
          ))}

          <SwimmingFish
            player={{
              id: 'tank-self',
              username: self?.username ?? 'You',
              avatarKey: fishKey,
              x: fishPosition.x,
              y: fishPosition.y,
            }}
            isSelf
            tint={fishColor}
            chatText={self ? chatBubbles[self.id]?.text : undefined}
          />
        </div>

        <footer className="tank-room-footer">
          {self ? `${self.username.toUpperCase()}'S TANK` : 'YOUR TANK'} · FRIENDS ONLY
        </footer>
      </section>

      {/* ---------- side panel ---------- */}
      <aside className="tank-side">
        <section className="tank-card">
          <h2>Make it yours</h2>
          <p className="tank-card-text">Plant a corner. Set the light. Invite a little company.</p>

          <button
            type="button"
            className="tank-button tank-button-primary"
            aria-pressed={isDecorating}
            onClick={() => setIsDecorating((on) => !on)}
          >
            {isDecorating ? 'Done decorating' : 'Edit your tank'}
          </button>
          <button
            type="button"
            className="tank-button"
            aria-expanded={isEditingFish}
            onClick={() => setIsEditingFish((open) => !open)}
          >
            Customize your fish
          </button>
          <button type="button" className="tank-button" onClick={() => setFriendsOpen(true)}>
            Invite friends
          </button>

          {/* fish editor (the old "my avatar" tab) */}
          {isEditingFish && (
            <div className="fish-editor">
              <h3>Fish</h3>
              <div className="fish-editor-fish">
                {Object.keys(FISH_IMAGES).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className="fish-choice"
                    aria-pressed={fishKey === key}
                    aria-label={`Fish ${key}`}
                    onClick={() => setFishKey(key)}
                  >
                    <img src={getFishImage(key)} alt="" />
                  </button>
                ))}
              </div>
              <h3>Color</h3>
              <div className="fish-editor-colors">
                {AVATAR_COLORS.map((color, index) => (
                  <button
                    key={color}
                    type="button"
                    className="color-choice"
                    style={{ '--tile-color': color }}
                    aria-pressed={fishColor === color}
                    aria-label={`Color ${index + 1}`}
                    onClick={() => setFishColor(color)}
                  />
                ))}
              </div>
              <button type="button" className="tank-button tank-button-primary" onClick={saveFish}>
                Save fish
              </button>
            </div>
          )}
        </section>

        <section className="tank-card">
          <h3>Your decor</h3>
          {loadError && <p className="tank-card-text">{loadError}</p>}
          {!loadError && ownedItems.length === 0 && (
            <p className="tank-card-text">Nothing yet. Find something in the store.</p>
          )}
          <ul className="decor-list">
            {ownedItems.map((item) => (
              <li key={item._id} className="decor-row">
                <img src={getItemImage(item.imageKey)} alt="" />
                <span>{item.name}</span>
                <button type="button" className="decor-toggle" onClick={() => togglePlaced(item._id)}>
                  {layout[item._id] ? 'Remove' : 'Place'}
                </button>
              </li>
            ))}
          </ul>
          {isDecorating && placedItems.length > 0 && (
            <p className="tank-card-text">Drag placed decor to move it.</p>
          )}
        </section>

        <section className="tank-card tank-store-card">
          <div>
            <h3>Your fish, your style.</h3>
            <p className="tank-card-text">{points === null ? '…' : `${points} coins`}</p>
          </div>
          <Link to="/shop" className="tank-button tank-button-primary tank-store-link">
            Visit store →
          </Link>
        </section>
      </aside>
    </div>
  )
}

export default Tank
