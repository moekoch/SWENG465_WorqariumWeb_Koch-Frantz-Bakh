import { useState } from 'react'
import { getFishImage } from '../fishImages.js'
import { swimSeconds } from '../swimMath.js'
import TintedFish from './TintedFish.jsx'
import './SwimmingFish.css'

// One fish. Glides to wherever `player.x / player.y` points, turns to face the
// way it swims, leaves a bubble trail while moving, and sits lower = closer.
function SwimmingFish({ player, isSelf = false, tint, chatText }) {
  // what we last rendered, so we can work out direction and swim time
  const [track, setTrack] = useState({
    x: player.x,
    y: player.y,
    facing: 1, // 1 = facing right (the artwork faces right), -1 = flipped
    seconds: 0,
    moving: false,
  })

  // target changed: update direction + duration while rendering (no effect needed)
  if (player.x !== track.x || player.y !== track.y) {
    const horizontalChange = player.x - track.x
    setTrack({
      x: player.x,
      y: player.y,
      facing: Math.abs(horizontalChange) > 0.002 ? (horizontalChange > 0 ? 1 : -1) : track.facing,
      seconds: swimSeconds(track.x, track.y, player.x, player.y),
      moving: true,
    })
  }

  // fish further down the screen look bigger and draw in front
  const depthScale = 0.8 + player.y * 0.4

  return (
    <div
      className={`swimmer${isSelf ? ' is-self' : ''}${track.moving ? ' is-moving' : ''}`}
      style={{
        left: `${player.x * 100}%`,
        top: `${player.y * 100}%`,
        // a fish that is talking draws above the others so its bubble can be read
        zIndex: chatText ? 150 : Math.round(player.y * 100),
        '--swim-seconds': `${track.seconds}s`,
        '--depth-scale': depthScale,
      }}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'left') setTrack((prev) => ({ ...prev, moving: false }))
      }}
    >
      <div className="swimmer-depth">
        <div className="swimmer-sway">
          <div className="swimmer-body" style={{ transform: `scaleX(${track.facing})` }}>
            <TintedFish src={getFishImage(player.avatarKey)} tint={tint} />
          </div>
          {/* bubble trail only while swimming */}
          <span className="swimmer-trail swimmer-trail-a" aria-hidden="true" />
          <span className="swimmer-trail swimmer-trail-b" aria-hidden="true" />
          <span className="swimmer-trail swimmer-trail-c" aria-hidden="true" />
        </div>
        <span className="swimmer-name">{player.username}</span>

        {/* speech bubble (keyed by text so a new message pops in again) */}
        {chatText && (
          <div key={chatText} className="swimmer-chat" role="status">
            {chatText}
          </div>
        )}
      </div>
    </div>
  )
}

export default SwimmingFish
