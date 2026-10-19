import { useNavigate } from "react-router-dom"
import shark from '../assets/fish/shark.png'

function GoFish() {
  return (
    <main className="scene">
      <h1 id="go-fish-heading">Go Fish</h1>
      <div className="games-grid">
        <img src={shark} alt="Shark" />
      </div>
    </main>
  )
}

export default GoFish