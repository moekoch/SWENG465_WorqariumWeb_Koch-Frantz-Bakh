import { useNavigate } from "react-router-dom"
import goFishImage from "../assets/games/GoFish.png"
import hangmanImage from "../assets/games/Hangman.png"
import ticTacToeImage from "../assets/games/TicTacToe.png"
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
        <section className="card card-center games-card" aria-label="Hangman">
          <div className="card-content">
            <img className="games-card-image" src={hangmanImage} alt="Hangman" />
            <button className="btn-primary" onClick={() => navigate("/hangman")}>
              Hangman
            </button>
          </div>
        </section>
        <section className="card card-center games-card" aria-label="Tic Tac Toe">
          <div className="card-content">
            <img className="games-card-image" src={ticTacToeImage} alt="Tic Tac Toe" />
            <button className="btn-primary" onClick={() => navigate("/tictactoe")}>
              Tic Tac Toe
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Games