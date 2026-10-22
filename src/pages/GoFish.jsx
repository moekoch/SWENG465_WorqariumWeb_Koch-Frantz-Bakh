import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import shark from "../assets/fish/shark.png"
import "./GoFish.css"

const cardImages = import.meta.glob("../assets/cards/*.png", {
  eager: true,
  import: "default",
  query: "?url",
})

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const rankNames = {
  A: "Aces",
  J: "Jacks",
  Q: "Queens",
  K: "Kings",
}

function createDeck() {
  const deck = Object.entries(cardImages)
    .map(([path, image]) => {
      const code = path.split("/").pop().replace(".png", "")
      return {
        code,
        rank: code.slice(0, -1),
        image,
      }
    })
    .filter((card) => ranks.includes(card.rank))

  for (let index = deck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const card = deck[index]
    deck[index] = deck[swapIndex]
    deck[swapIndex] = card
  }

  return deck
}

function collectBooks(hand, existingBooks) {
  const counts = hand.reduce((result, card) => {
    result[card.rank] = (result[card.rank] ?? 0) + 1
    return result
  }, {})
  const completedRanks = Object.keys(counts).filter((rank) => counts[rank] === 4)

  return {
    hand: hand.filter((card) => !completedRanks.includes(card.rank)),
    books: [...existingBooks, ...completedRanks],
  }
}

function createGame() {
  const deck = createDeck()
  const playerHand = deck.splice(0, 7)
  const computerHand = deck.splice(0, 7)
  const player = collectBooks(playerHand, [])
  const computer = collectBooks(computerHand, [])

  return {
    deck,
    playerHand: player.hand,
    computerHand: computer.hand,
    playerBooks: player.books,
    computerBooks: computer.books,
    turn: "player",
    message: "Your turn: choose a card rank to ask for.",
    gameOver: false,
  }
}

function finishIfNeeded(game) {
  const playerRanks = new Set(game.playerHand.map((card) => card.rank))
  const canAskForHeldRank = game.computerHand.some((card) =>
    playerRanks.has(card.rank),
  )
  const gameOver =
    game.playerBooks.length + game.computerBooks.length === 13 ||
    (game.turn === "Shark" &&
      game.playerHand.length === 0 &&
      game.deck.length === 1) ||
    (game.deck.length === 0 &&
      (game.playerHand.length === 0 ||
        game.computerHand.length === 0 ||
        !canAskForHeldRank))

  if (!gameOver) return game

  const message =
    game.playerBooks.length > game.computerBooks.length
      ? "You win! You collected the most books."
      : game.playerBooks.length < game.computerBooks.length
        ? "The Shark wins this round."
        : "It’s a tie!"

  return { ...game, gameOver: true, turn: "finished", message }
}

function askForRank(game, rank) {
  const matches = game.computerHand.filter((card) => card.rank === rank)

  if (matches.length > 0) {
    const player = collectBooks(
      [...game.playerHand, ...matches],
      game.playerBooks,
    )
    return finishIfNeeded({
      ...game,
      playerHand: player.hand,
      computerHand: game.computerHand.filter((card) => card.rank !== rank),
      playerBooks: player.books,
      message: `The Shark had ${matches.length} ${rankNames[rank] ?? rank + "s"}! Ask again.`,
    })
  }

  if (game.deck.length === 0) {
    return finishIfNeeded({
      ...game,
      turn: "Shark",
      message: "Go Fish! The deck is empty. The Shark’s turn.",
    })
  }

  const [drawnCard, ...deck] = game.deck
  const player = collectBooks([...game.playerHand, drawnCard], game.playerBooks)
  const drewRequestedRank = drawnCard.rank === rank

  return finishIfNeeded({
    ...game,
    deck,
    playerHand: player.hand,
    playerBooks: player.books,
    turn: drewRequestedRank ? "player" : "Shark",
    message: drewRequestedRank
      ? `Go Fish! You drew the ${rankNames[rank]?.slice(0, -1) ?? rank} you asked for. Ask again.`
      : "Go Fish! You drew a card. The Shark’s turn.",
  })
}

function playComputerTurn(game) {
  if (game.turn !== "Shark" || game.gameOver) return game

  if (game.computerHand.length === 0) {
    if (game.deck.length === 0) return finishIfNeeded(game)
    const [drawnCard, ...deck] = game.deck
    const computer = collectBooks([...game.computerHand, drawnCard], game.computerBooks)
    return finishIfNeeded({
      ...game,
      deck,
      computerHand: computer.hand,
      computerBooks: computer.books,
      turn: "player",
      message: "The Shark drew a card because its hand was empty. Your turn.",
    })
  }

  const rank =
    game.computerHand[Math.floor(Math.random() * game.computerHand.length)].rank
  const matches = game.playerHand.filter((card) => card.rank === rank)

  if (matches.length > 0) {
    const computer = collectBooks(
      [...game.computerHand, ...matches],
      game.computerBooks,
    )
    return finishIfNeeded({
      ...game,
      computerHand: computer.hand,
      playerHand: game.playerHand.filter((card) => card.rank !== rank),
      computerBooks: computer.books,
      turn: "Shark",
      message: `The Shark asked for ${rankNames[rank] ?? rank + "s"} and got them. It asks again.`,
    })
  }

  if (game.deck.length === 0) {
    return finishIfNeeded({
      ...game,
      turn: "player",
      message: "The Shark went fish, but the deck is empty. Your turn.",
    })
  }

  const [drawnCard, ...deck] = game.deck
  const computer = collectBooks([...game.computerHand, drawnCard], game.computerBooks)
  const drewRequestedRank = drawnCard.rank === rank

  return finishIfNeeded({
    ...game,
    deck,
    computerHand: computer.hand,
    computerBooks: computer.books,
    turn: drewRequestedRank ? "Shark" : "player",
    message: drewRequestedRank
      ? `The Shark went fish and drew the rank it asked for. It asks again.`
      : "The Shark went fish. Your turn.",
  })
}

function formatRank(rank) {
  return rankNames[rank]?.slice(0, -1) ?? rank
}

function GoFish() {
  const navigate = useNavigate()
  const [game, setGame] = useState(createGame)

  useEffect(() => {
    if (game.turn !== "Shark" || game.gameOver) return undefined

    const timeout = window.setTimeout(() => {
      setGame((currentGame) => playComputerTurn(currentGame))
    }, 900)

    return () => window.clearTimeout(timeout)
  }, [game])

  return (
    <main className="scene go-fish-scene">
      <button
        className="go-fish-back-button"
        type="button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <div className="go-fish-table">
        <h1>Go Fish</h1>
        <p className="go-fish-message" aria-live="polite">
          {game.message}
        </p>

        <section className="go-fish-opponent" aria-label="Shark's hand">
          <img className="go-fish-shark" src={shark} alt="" aria-hidden="true" />
          <div className="go-fish-opponent-content">
            <h2>Shark · {game.computerHand.length} cards</h2>
            <div className="go-fish-card-row">
              {game.computerHand.map((card) => (
                <img
                  className="go-fish-card-back"
                  key={card.code}
                  src={cardImages["../assets/cards/gray_back.png"]}
                  alt="Face-down card"
                />
              ))}
              {game.computerHand.length === 0 && <span>No cards</span>}
            </div>
            <p className="go-fish-books">Books: {game.computerBooks.length}</p>
          </div>
          <div className="go-fish-deck" aria-label="Cards remaining">
          {game.deck.length > 0 ? (
            <img
              src={cardImages["../assets/cards/gray_back.png"]}
              alt=""
            />
          ) : (
            <span>Deck empty</span>
          )}
          <span>{game.deck.length} cards left</span>
        </div>
        </section>

        <section className="go-fish-player" aria-label="Your hand">
          <h2>Your hand · {game.playerHand.length} cards</h2>
          <div className="go-fish-player-hand">
            {game.playerHand.map((card) => (
              <button
                className="go-fish-player-card"
                key={card.code}
                type="button"
                disabled={game.turn !== "player" || game.gameOver}
                onClick={() => setGame((currentGame) => askForRank(currentGame, card.rank))}
                aria-label={`Ask for ${formatRank(card.rank)}s`}
                title={`Ask for ${formatRank(card.rank)}s`}
              >
                <img src={card.image} alt={`${formatRank(card.rank)} playing card`} />
              </button>
            ))}
            {game.playerHand.length === 0 && <span>No cards in your hand</span>}
          </div>
          <p className="go-fish-books">Your books: {game.playerBooks.length}</p>
        </section>
      </div>
      {game.gameOver && (
        <div className="go-fish-game-over">
          <section
            className="go-fish-game-over-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="go-fish-game-over-heading"
          >
            <h2 id="go-fish-game-over-heading">{game.message}</h2>
            <button
              className="btn-primary go-fish-restart"
              type="button"
              onClick={() => setGame(createGame())}
              autoFocus
            >
              Play again
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

export default GoFish
