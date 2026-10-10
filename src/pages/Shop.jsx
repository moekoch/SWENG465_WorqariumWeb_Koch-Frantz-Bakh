import blueTang from "../assets/fish/blueTang.png"
import { useState } from "react"
import "./Shop.css"

function Shop() {
  // total points user can spend
  const pointBalance = 1000;

  // config for each panel
  const sections = [
    { type: "avatar", title: "Avatars", description: "Customize your avatar", price: 500, count: 14 },
    { type: "item",   title: "Items",   description: "Browse available items", price: 100, count: 14 },
  ]

  // selection state for display
  const [selected, setSelected] = useState(null)

  // if exact tile is selected
  const isSelected = (type, index) =>
    selected?.type === type && selected?.index === index

  return (
    <main className="scene shop-scene">
      <div className="shop-container">

        {/* preview box */}
        <section className="shop-preview card" aria-live="polite">

          {/* image display */}
          <div className="preview-image">
            <img src={blueTang} alt="Blue Tang" />
          </div>

          {/* disable button when nothing selected */}
          <button className="btn-primary preview-buy" disabled={!selected}>Buy</button>
        </section>

        {/* side by side panels */}
        <div className="shop-layout">
          {/* one panel per entry in sections */}
          {sections.map(({ type, title, description, price, count }) => (
            <section className="shop-panel" key={type}>

              {/* title and points */}
              <div className="shop-panel-header">
                <h2>{title}</h2>
                <span className="shop-balance">{pointBalance} pts</span>
              </div>

              {/* section description */}
              <p className="shop-description">{description}</p>

              {/* tile grid */}
              <div className="shop-grid">
                {/* create enough tiles for imgs */}
                {Array.from({ length: count }).map((_, index) => (
                  <button
                    // highlight tile when selected
                    className={`shop-tile${isSelected(type, index) ? " is-selected" : ""}`}
                    // track each item in list
                    key={index}
                    // screen reader label
                    aria-label={`${title.slice(0, -1)} ${index + 1}, ${price} pts`}
                    // tell screen reader if selected
                    aria-pressed={isSelected(type, index)}
                    // select tile
                    onClick={() => setSelected({ type, index })}
                  >
                    {/* tile */}
                    <span className="tile-square" />
                    <span className="tile-price">{price}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

export default Shop