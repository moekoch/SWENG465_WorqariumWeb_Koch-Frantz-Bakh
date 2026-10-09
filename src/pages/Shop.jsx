
import "./Shop.css"

function Shop() {
  const avatarColors = [
    "#ffffff", "#e60000", "#ff8c32", "#fff000",
    "#00e84a", "#00e5c7", "#00aaff", "#063cff",
    "#7400ff", "#d000ff", "#ff00a8", "#6b0000",
    "#888888", "#111111"
  ]

  const pointBalance = 1000;
  const avatarPrice = 500
  const itemPrice = 100
  const items = Array.from({ length: 8 })

  return (
    <main className="scene shop-scene">
      <div className="shop-container">
        <h1>Shop</h1>

        <div className="shop-layout">
          {/* avatar customization panel */}
          <section className="shop-panel">
            <div className="shop-panel-header">
              <h2>Avatar</h2>
              <span className="shop-balance">{pointBalance} pts</span>
            </div>

            <p className="shop-description">
              Customize your avatar
            </p>

            <div className="avatar-grid">
              {avatarColors.map((color, index) => (
                <button
                  className="avatar-tile"
                  key={color}
                  aria-label={`Avatar color ${index + 1}`}
                  style={{ "--tile-color": color }}
                >
                  <span className="color-square" />
                  <span className="tile-price">
                    {avatarPrice}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* items panel */}
          <section className="shop-panel">
            <div className="shop-panel-header">
              <h2>Items</h2>
              <span className="shop-balance">{pointBalance} points</span>
            </div>

            <p className="shop-description">
              Browse available items
            </p>

            <div className="items-grid">
              {items.map((_, index) => (
                <button
                  className="item-tile"
                  key={index}
                  aria-label={`Item ${index + 1}, ${itemPrice} coins`}
                >
                  <span className="item-square" />
                  <span className="tile-price">
                    {itemPrice}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default Shop