import "./Avatar.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import blueTang from "../assets/fish/blueTang.png"
import linedButterflyfish from "../assets/fish/linedButterflyfish.png"
import moorishIdol from "../assets/fish/moorishIdol.png"
import orangeClownfish from "../assets/fish/orangeClownfish.png"
import schoolingBannerfish from "../assets/fish/schoolingBannerfish.png"

function Avatar() {
  const navigate = useNavigate()
  const fishes = [
    { id: "blueTang", src: blueTang },
    { id: "linedButterflyfish", src: linedButterflyfish },
    { id: "moorishIdol", src: moorishIdol },
    { id: "orangeClownfish", src: orangeClownfish },
    { id: "schoolingBannerfish", src: schoolingBannerfish },
  ]
  const [selectedFish, setSelectedFish] = useState(
    () => fishes.find((fish) => fish.id === localStorage.getItem("selectedAvatar")) ?? fishes[0],
  )
  const avatarColors = [
    "#ffffff", "#e60000", "#ff8c32", "#fff000",
    "#00e84a", "#00740f", "#009f89", "#00aaff", "#063cff",
    "#7400ff", "#d000ff", "#ff00a8", "#451c00",
    "#888888", "#111111"
  ]
  const [selectedColor, setSelectedColor] = useState(
    () => localStorage.getItem("selectedAvatarColor") ?? avatarColors[0],
  )

  return (
    <main className="avatar-scene">
      <button
        className="avatar-back-button"
        type="button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <button
        className="avatar-save-button"
        type="button"
        onClick={() => {
          localStorage.setItem("selectedAvatar", selectedFish.id)
          localStorage.setItem("selectedAvatarColor", selectedColor)
          navigate("/profile")
        }}
      >
        Save
      </button>
      <div className="avatar-container">
        <h1>Customize your Avatar</h1>
        <div className="avatar-preview">
          <img
            className="avatar-preview-image"
            src={selectedFish.src}
            alt={`Your Avatar, a ${selectedFish.id}`}
          />
          <span
            className="avatar-preview-tint"
            style={{
              backgroundColor: selectedColor,
              WebkitMaskImage: `url("${selectedFish.src}")`,
              maskImage: `url("${selectedFish.src}")`,
            }}
            aria-hidden="true"
          />
        </div>

        <div className="avatar-layout">

          <section className="color-palette">
            <h2 className="color-header">Color Palette</h2>
              <div className="color-grid">
                {avatarColors.map((color, index) => (
                <button
                  className={`avatar-tile${selectedColor === color ? " is-selected" : ""}`}
                  key={color}
                  aria-label={`Avatar color ${index + 1}`}
                  aria-pressed={selectedColor === color}
                  style={{ "--tile-color": color }}
                  onClick={() => setSelectedColor(color)}
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
                  key={fish.id}
                  aria-label={`Fish selection ${index + 1}`}
                  aria-pressed={selectedFish.id === fish.id}
                  onClick={() => setSelectedFish(fish)}
                >
                  <img
                    className="fish-image"
                    src={fish.src}
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