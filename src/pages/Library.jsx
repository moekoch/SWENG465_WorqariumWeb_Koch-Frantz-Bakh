import { useEffect, useReducer } from 'react'
import { environmentStyle } from '../environmentImages.js'
import { useSession } from '../sessionContext.js'
import { loadSettings } from '../settings.js'
import './Library.css'

// focus length comes from Settings (25 by default), then 5 minutes drift, repeating
const DRIFT_MINUTES = 5
const buildPhases = (focusMinutes) => ({
  focus: { label: 'Focus', seconds: focusMinutes * 60, next: 'drift' },
  drift: { label: 'Drift', seconds: DRIFT_MINUTES * 60, next: 'focus' },
})

const buildInitialTimer = (focusMinutes) => ({
  phase: 'focus',
  remaining: focusMinutes * 60,
  running: false,
  focusMinutes,
})

function timerReducer(state, action) {
  const phases = buildPhases(state.focusMinutes)
  switch (action) {
    case 'toggle':
      return { ...state, running: !state.running }
    case 'reset':
      return buildInitialTimer(state.focusMinutes)
    case 'tick': {
      if (state.remaining > 1) return { ...state, remaining: state.remaining - 1 }
      // phase finished: roll into the next one
      const nextPhase = phases[state.phase].next
      return { ...state, phase: nextPhase, remaining: phases[nextPhase].seconds, running: true }
    }
    default:
      return state
  }
}

const formatClock = (totalSeconds) => {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

// quiet co-working room with a shared-style focus timer
function Library() {
  const { onlineUsernames } = useSession()
  const [timer, dispatch] = useReducer(timerReducer, loadSettings().focusMinutes, buildInitialTimer)

  // count down once a second while running
  useEffect(() => {
    if (!timer.running) return undefined
    const intervalId = setInterval(() => dispatch('tick'), 1000)
    return () => clearInterval(intervalId)
  }, [timer.running])

  return (
    <div className="library-page">
      <section className="library-card">
        <header>
          <h1>The Kelp Library</h1>
          <p>A shared room for a little deep work.</p>
        </header>

        <div className="library-room environment env-library" style={environmentStyle('libraryBackground')}>
          <div className="focus-panel" aria-live="polite">
            <span className="focus-eyebrow">SETTLE IN TOGETHER</span>
            <h2>Find your flow.</h2>
            <p>{onlineUsernames.size} fish in the Commons · Chat stays quiet</p>

            <div className="focus-clock">
              <span className="focus-clock-label">{buildPhases(timer.focusMinutes)[timer.phase].label.toUpperCase()} TOGETHER</span>
              <span className="focus-clock-time">{formatClock(timer.remaining)}</span>
              <span className="focus-clock-cycle">{timer.focusMinutes} min focus / {DRIFT_MINUTES} min drift</span>
            </div>

            <button type="button" className="focus-button focus-button-primary" onClick={() => dispatch('toggle')}>
              {timer.running ? 'Pause' : 'Join focus session'}
            </button>
            <button type="button" className="focus-button" onClick={() => dispatch('reset')}>
              Reset
            </button>
            <small>OPT-IN PRESENCE. NO PRESSURE TO REPLY.</small>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Library
