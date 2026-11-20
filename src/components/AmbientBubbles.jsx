import './AmbientBubbles.css'

// 14 slow bubbles drifting up behind every screen.
// Values are derived from the index so the layout is the same on every render.
const AMBIENT_BUBBLES = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  leftPercent: (index * 37 + 11) % 100,
  sizePixels: 8 + ((index * 7) % 20),
  durationSeconds: 11 + ((index * 5) % 9),
  delaySeconds: -((index * 2.3) % 14),
}))

function AmbientBubbles() {
  return (
    <div className="ambient-bubbles" aria-hidden="true">
      {AMBIENT_BUBBLES.map((bubble) => (
        <span
          key={bubble.id}
          className="ambient-bubble"
          style={{
            left: `${bubble.leftPercent}%`,
            width: bubble.sizePixels,
            height: bubble.sizePixels,
            animationDuration: `${bubble.durationSeconds}s`,
            animationDelay: `${bubble.delaySeconds}s`,
          }}
        />
      ))}
    </div>
  )
}

export default AmbientBubbles
