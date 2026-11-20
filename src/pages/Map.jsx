import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BubbleLoader from '../components/BubbleLoader.jsx'
import SwimmingFish from '../components/SwimmingFish.jsx'
import { environmentStyle } from '../environmentImages.js'
import { useSession } from '../sessionContext.js'
import { swimSeconds } from '../swimMath.js'
import './Map.css'

// where fish are allowed to swim (fractions of the map)
const SWIM_BOUNDS = { minX: 0.04, maxX: 0.96, minY: 0.12, maxY: 0.95 }

// The three places on the map. `hit` is the clickable area over the artwork and
// `swimTo` is where your fish swims to before the door "opens".
// All numbers are fractions (0 to 1) of mapBackground.jpg.
const HOTSPOTS = [
  {
    id: 'library',
    label: 'Library',
    blurb: 'Co-working',
    to: '/library',
    hit: { left: 0.01, top: 0.25, width: 0.43, height: 0.55 },
    swimTo: { x: 0.23, y: 0.84 },
  },
  {
    id: 'tank',
    label: 'Your Tank',
    blurb: 'Your own space · Friends only',
    to: '/tank',
    hit: { left: 0.47, top: 0.2, width: 0.2, height: 0.42 },
    swimTo: { x: 0.57, y: 0.72 },
  },
  {
    id: 'games',
    label: 'Games',
    blurb: 'Friendly rounds',
    to: '/games',
    hit: { left: 0.74, top: 0.22, width: 0.2, height: 0.34 },
    swimTo: { x: 0.86, y: 0.64 },
  },
]

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

function WorldMap() {
  const navigate = useNavigate()
  const { self, players, error, move } = useSession()

  // bubble bursts shown where the user clicked
  const [bursts, setBursts] = useState([])

  // pending "swim to a door then go inside" timer
  const arrivalTimerRef = useRef(null)
  const burstCounterRef = useRef(0)

  // never navigate after leaving the map
  useEffect(() => () => clearTimeout(arrivalTimerRef.current), [])

  // pop a little burst of bubbles at a spot on the map
  const showBurst = (x, y) => {
    burstCounterRef.current += 1
    const burstId = burstCounterRef.current
    setBursts((prev) => [...prev, { id: burstId, x, y }])
    setTimeout(() => setBursts((prev) => prev.filter((burst) => burst.id !== burstId)), 900)
  }

  // swim to wherever the user clicked
  const handleStageClick = (event) => {
    if (!self) return
    clearTimeout(arrivalTimerRef.current) // changed their mind about a door

    const rect = event.currentTarget.getBoundingClientRect()
    const targetX = clamp((event.clientX - rect.left) / rect.width, SWIM_BOUNDS.minX, SWIM_BOUNDS.maxX)
    const targetY = clamp((event.clientY - rect.top) / rect.height, SWIM_BOUNDS.minY, SWIM_BOUNDS.maxY)

    showBurst(targetX, targetY)
    move(targetX, targetY)
  }

  // swim to a door, then go inside when the fish arrives
  const handleHotspotClick = (event, hotspot) => {
    event.stopPropagation() // don't also trigger the plain swim click
    if (!self) {
      navigate(hotspot.to)
      return
    }
    clearTimeout(arrivalTimerRef.current)

    const { x, y } = hotspot.swimTo
    showBurst(x, y)
    move(x, y)

    const travelMilliseconds = swimSeconds(self.x, self.y, x, y) * 1000
    arrivalTimerRef.current = setTimeout(() => navigate(hotspot.to), travelMilliseconds + 150)
  }

  // user's fish and everyone else's
  const everyone = self ? [self, ...Object.values(players)] : Object.values(players)

  return (
    <div className="map-page">
      <section
        className="map-stage"
        style={environmentStyle('mapBackground')}
        aria-label="The Commons. Click the water to swim."
        onClick={handleStageClick}
      >
        {/* title card */}
        <div className="map-title-card">
          <h1>Glasshouse Commons</h1>
          <p>
            {everyone.length} fish here · A little space to play and focus.
          </p>
        </div>

        {/* doors into each place */}
        {HOTSPOTS.map((hotspot) => (
          <button
            key={hotspot.id}
            type="button"
            className="map-hotspot"
            style={{
              left: `${hotspot.hit.left * 100}%`,
              top: `${hotspot.hit.top * 100}%`,
              width: `${hotspot.hit.width * 100}%`,
              height: `${hotspot.hit.height * 100}%`,
            }}
            onClick={(event) => handleHotspotClick(event, hotspot)}
            aria-label={`${hotspot.label}. ${hotspot.blurb}`}
          >
            <span className="map-hotspot-label">
              <strong>{hotspot.label}</strong>
              <small>{hotspot.blurb}</small>
            </span>
          </button>
        ))}

        {/* bubble bursts where the user clicked */}
        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="bubble-burst"
            style={{ left: `${burst.x * 100}%`, top: `${burst.y * 100}%` }}
            aria-hidden="true"
          >
            <i /><i /><i /><i /><i />
          </span>
        ))}

        {/* one fish per player */}
        {everyone.map((player) => (
          <SwimmingFish key={player.id} player={player} isSelf={player.id === self?.id} />
        ))}

        {/* status */}
        {!self && !error && (
          <div className="map-status">
            <BubbleLoader label="Diving in…" />
          </div>
        )}
        {error && error !== 'unauthorized' && (
          <p className="error-msg map-status map-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </div>
  )
}

export default WorldMap
