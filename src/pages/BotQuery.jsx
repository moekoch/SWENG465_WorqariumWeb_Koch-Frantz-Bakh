import { environmentStyle } from "../environmentImages.js"
import "./GameRoom.css"

function BotQuery() {
  return (
    <main
      className="scene game-room environment env-games"
      style={environmentStyle("gamesBackground")}
    >
      <div className="game-table">
        <h1>Bot Query</h1>
      </div>
    </main>
  )
}

export default BotQuery
