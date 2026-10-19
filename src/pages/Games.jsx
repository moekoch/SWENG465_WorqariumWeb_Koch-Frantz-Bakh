import { useNavigate } from "react-router-dom"
import goFishImage from "../assets/games/GoFish.png"
import blackjackImage from "../assets/games/Blackjack.png"
import "./Games.css"

function Games() {
  const navigate = useNavigate()

  return (
    <main className="scene games-scene">
      <h1 id="games-heading" className="games-heading">Choose a game</h1>
      <div className="games-grid">
        <section className="card card-center games-card" aria-label="Go Fish">
          <div className="card-content">
            <img className="games-card-image" src={goFishImage} alt="Go Fish" />
            <button className="btn-primary" onClick={() => navigate("/go-fish")}>
              Go Fish
            </button>
          </div>
        </section>
        <section className="card card-center games-card" aria-label="Blackjack">
          <div className="card-content">
            <img className="games-card-image" src={blackjackImage} alt="Blackjack" />
            <button className="btn-primary" onClick={() => navigate("/blackjack")}>
              Blackjack
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Games