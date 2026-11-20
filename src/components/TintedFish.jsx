// fish image with an optional color tint (same multiply-mask trick the old
// avatar editor used, so saved colors keep working)
function TintedFish({ src, tint, alt = '' }) {
  return (
    <span className="tinted-fish">
      <img className="tinted-fish-image" src={src} alt={alt} draggable="false" />
      {tint && tint !== '#ffffff' && (
        <span
          className="tinted-fish-tint"
          style={{
            backgroundColor: tint,
            WebkitMaskImage: `url("${src}")`,
            maskImage: `url("${src}")`,
          }}
          aria-hidden="true"
        />
      )}
    </span>
  )
}

export default TintedFish
