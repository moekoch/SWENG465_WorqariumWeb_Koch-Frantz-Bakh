import './BubbleLoader.css'

// bubble-themed loader: a stream of bubbles rising with a label under it
function BubbleLoader({ label = 'Diving in…', fullscreen = false }) {
  const bubbleIndexes = [0, 1, 2, 3, 4]

  return (
    <div className={`bubble-loader${fullscreen ? ' is-fullscreen' : ''}`} role="status" aria-live="polite">
      {/* decorative, screen readers only get the label */}
      <div className="bubble-loader-stack" aria-hidden="true">
        {bubbleIndexes.map((index) => (
          <span key={index} className={`bubble-loader-dot bubble-loader-dot-${index}`} />
        ))}
      </div>
      <p className="bubble-loader-label">{label}</p>
    </div>
  )
}

export default BubbleLoader
