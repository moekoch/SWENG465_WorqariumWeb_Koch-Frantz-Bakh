import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import shark from "../assets/fish/shark.png"
import { connectSocket, disconnectSocket } from "../socket.js"
import "./GoFish.css"

const cardImages = import.meta.glob("../assets/cards/*.png", {
  eager: true,
  import: "default",
  query: "?url",
})

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const rankNames = {
  A: "Ace",
  J: "Jack",
  Q: "Queen",
  K: "King",
}

function formatRank(rank) {
  return rankNames[rank] ?? rank
}

function imageForCard(code) {
  return cardImages[`../assets/cards/${code}.png`]
}

function GoFishX() {
  const navigate = useNavigate()
  const [connected, setConnected] = useState(false)
  const [game, setGame] = useState(null)
  const [error, setError] = useState("")
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket

    const handleConnect = () => {
      setConnected(true)
      setError("")
    }
    const handleDisconnect = () => {
      setConnected(false)
      setError("Connection lost. Rejoin the challenge when you reconnect.")
    }
    const handleState = (nextGame) => {
      setGame({
        ...nextGame,
        youId: nextGame.selfId,
        turnPlayerId: nextGame.turnUserId,
        winner: nextGame.winnerId,
      })
      setError("")
    }
    const handleWaiting = () => {
      setGame({
        status: "waiting",
        message: "Waiting for another player to join…",
      })
      setError("")
    }
    const handleError = ({ message }) => setError(message)

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("gofish:state", handleState)
    socket.on("gofish:waiting", handleWaiting)
    socket.on("gofish:error", handleError)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("gofish:state", handleState)
      socket.off("gofish:waiting", handleWaiting)
      socket.off("gofish:error", handleError)
      socket.emit("gofish:leave")
      disconnectSocket()
    }
  }, [])

  const findOpponent = () => {
    setError("")
    socketRef.current?.emit("gofish:queue:join")
  }

  const askForRank = (rank) => {
    socketRef.current?.emit("gofish:ask", { rank })
  }

  const startAnotherGame = () => {
    setGame(null)
    findOpponent()
  }

  const myTurn = game?.status === "playing" && game.isYourTurn

  const sortedHand = useMemo(
    () =>
      [...(game?.hand ?? [])].sort(
        (first, second) => ranks.indexOf(first.rank) - ranks.indexOf(second.rank),
      ),
    [game?.hand],
  )

  return (
    <main className="scene go-fish-scene">
      <button
        className="go-fish-back-button"
        type="button"
        onClick={() => navigate("/games")}
      >
        ← Back
      </button>
      <div className="go-fish-table">
        <h1>Go Fish · Challenge</h1>
        <p className="go-fish-message" aria-live="polite">
          {game?.message ?? "Challenge another player to a live Go Fish game."}
        </p>

        {error && (
          <p className="go-fish-error" role="alert">
            {error}
          </p>
        )}

        {!game && (
          <section className="go-fish-lobby card" aria-labelledby="challenge-heading">
            <h2 id="challenge-heading">Play against another user</h2>
            <p>
              {connected
                ? "Find another player who is ready for a game."
                : "Connecting to the game server…"}
            </p>
            <button
              className="btn-primary"
              type="button"
              onClick={findOpponent}
              disabled={!connected}
            >
              Find a player
            </button>
          </section>
        )}

        {game && (
          <>
            <section className="go-fish-opponent" aria-label="Opponent's hand">
              <img className="go-fish-shark" src={shark} alt="" aria-hidden="true" />
              <div className="go-fish-opponent-content">
                <h2>
                  {game.opponent?.username ??
                    (game.status === "waiting" ? "Waiting for a player" : "Opponent")}
                  {game.opponent && ` · ${game.opponent.cardCount} cards`}
                </h2>
                {game.opponent ? (
                  <>
                    <div className="go-fish-card-row">
                      {Array.from({ length: game.opponent.cardCount }, (_, index) => (
                        <img
                          className="go-fish-card-back"
                          key={index}
                          src={cardImages["../assets/cards/gray_back.png"]}
                          alt="Face-down card"
                        />
                      ))}
                      {game.opponent.cardCount === 0 && <span>No cards</span>}
                    </div>
                    <p className="go-fish-books">
                      Books: {game.opponent.books}
                    </p>
                  </>
                ) : (
                  <p>Looking for another player…</p>
                )}
              </div>
              <div className="go-fish-deck" aria-label="Cards remaining">
                {game.deckCount > 0 ? (
                  <img src={cardImages["../assets/cards/gray_back.png"]} alt="" />
                ) : (
                  <span>Deck empty</span>
                )}
                <span>{game.deckCount} cards left</span>
              </div>
            </section>

            {game.status === "playing" && (
              <section className="go-fish-player" aria-label="Your hand">
                <h2>
                  Your hand · {game.hand.length} cards
                  {myTurn ? " · Your turn" : " · Opponent's turn"}
                </h2>
                <div className="go-fish-player-hand">
                  {sortedHand.map((card) => (
                    <button
                      className="go-fish-player-card"
                      key={card.code}
                      type="button"
                      disabled={!myTurn}
                      onClick={() => askForRank(card.rank)}
                      aria-label={`Ask for ${formatRank(card.rank)}s`}
                      title={`Ask for ${formatRank(card.rank)}s`}
                    >
                      <img
                        src={imageForCard(card.code)}
                        alt={`${formatRank(card.rank)} playing card`}
                      />
                    </button>
                  ))}
                  {game.hand.length === 0 && <span>No cards in your hand</span>}
                </div>
                <p className="go-fish-books">Your books: {game.books.length}</p>
              </section>
            )}

            {game.status === "finished" && (
              <section className="go-fish-game-over-card">
                <h2>{game.winner === game.youId ? "You win!" : "Challenge complete"}</h2>
                <p>
                  You collected {game.books.length} books. {game.opponent?.username}{" "}
                  collected {game.opponent?.books ?? 0}.
                </p>
                <button
                  className="btn-primary go-fish-restart"
                  type="button"
                  onClick={startAnotherGame}
                  disabled={!connected}
                >
                  Find another player
                </button>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}

export default GoFishX
