import { useNavigate } from "react-router-dom"
import goFishImage from "../assets/games/GoFish.png"
import blackjackImage from "../assets/games/BlackJack.png"
import spadesImage from "../assets/games/Spades.png"
import { environmentStyle } from "../environmentImages.js"
import "./GameRoom.css"
import "./Games.css"

// one station per game: art, a short line, and what its buttons do
const STATIONS = [
  {
    id: "go-fish",
    name: "Go Fish",
    blurb: "Find your pairs.",
    image: goFishImage,
    actions: [
      { label: "Play Go Fish →", to: "/go-fish" },
      { label: "Challenge a player", to: "/go-fish/challenge", secondary: true },
    ],
  },
  {
    id: "blackjack",
    name: "Blackjack",
    blurb: "A friendly game of 21.",
    image: blackjackImage,
    actions: [{ label: "Play Blackjack →", to: "/blackjack" }],
  },
  {
    id: "spades",
    name: "Spades",
    blurb: "Team up. Take tricks.",
    image: spadesImage,
    actions: [{ label: "Play Spades →", to: "/spades" }],
  },
]

function Games() {
  const navigate = useNavigate()

  return (
    <main
      className="scene game-room environment env-games games-scene"
      style={environmentStyle("gamesBackground")}
    >
      <button type="button" className="games-outside" onClick={() => navigate("/map")}>
        Outside →
      </button>

      <header className="games-header">
        <h1 id="games-heading">Games room</h1>
        <p>You&rsquo;re inside. Pick a station and settle into a friendly round.</p>
      </header>

      <div className="games-grid">
        {STATIONS.map((station) => (
          <section key={station.id} className="game-station" aria-label={station.name}>
            {/* the art sits on a glass bubble */}
            <div className="game-station-art">
              <img src={station.image} alt="" />
            </div>
            <h2>{station.name}</h2>
            <p>{station.blurb}</p>
            <div className="game-station-actions">
              {station.actions.map((action) => (
                <button
                  key={action.to}
                  type="button"
                  className={`game-station-button${action.secondary ? " is-secondary" : ""}`}
                  onClick={() => navigate(action.to)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="games-footnote">STEADY LIGHTS · NO FLASHING · NO WAGERS</p>
    </main>
  )
}

export default Games
