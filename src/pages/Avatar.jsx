import "./Avatar.css"

function Avatar() {
  const avatarColors = [
    "#ffffff", "#e60000", "#ff8c32", "#fff000",
    "#00e84a", "#00e5c7", "#00aaff", "#063cff",
    "#7400ff", "#d000ff", "#ff00a8", "#6b0000",
    "#888888", "#111111"
  ]
  const fishes = [
    "/src/assets/fish/blueTang.png",
    "/src/assets/fish/linedButterflyfish.png",
    "/src/assets/fish/moorishIdol.png",
    "/src/assets/fish/orangeClownfish.png",
    "/src/assets/fish/schoolingBannerfish.png"
  ]

  return (
    <main className="avatar-scene">
      <div className="avatar-container">
        <h1>Customize your Avatar</h1>
        <img
          className="avatar-preview"
          src="/src/assets/fish/blueTang.png"
          alt="Your Avatar, a blue tang fish"
        />

        <div className="avatar-layout">

          <section className="color-palette">
            <h2 className="color-header">Color Palette</h2>
              <div className="color-grid">
                {avatarColors.map((color, index) => (
                <button
                  className="avatar-tile"
                  key={color}
                  aria-label={`Avatar color ${index + 1}`}
                  style={{ "--tile-color": color }}
                >
                  <span className="color-square" />
                </button>
                ))}
            </div>
          </section>

          <section className="fish-selection">
            <h2 className="fish-header">Fish Selection</h2>
              <div className="fish-grid">
                {fishes.map((fish, index) => (
                <button
                  className="fish-tile"
                  key={fish}
                  aria-label={`Fish selection ${index + 1}`}
                >
                  <img
                    className="fish-image"
                    src={fish}
                    alt={`Fish selection ${index + 1}`}
                  />
                </button>
                ))}
            </div>
          </section>
        </div>  
      </div>
    </main>
  )
}

export default Avatar