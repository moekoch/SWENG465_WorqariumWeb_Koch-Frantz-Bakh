import { useState } from "react"
import { useNavigate } from "react-router-dom"
import shark from "../assets/fish/shark.png"
import "./Blackjack.css"

const cardImages = import.meta.glob("../assets/cards/*.png", {
  eager: true,
  import: "default",
  query: "?url",
})

const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
const cardBack = cardImages["../assets/cards/gray_back.png"]

function createDeck() {
  const deck = Object.entries(cardImages)
    .map(([path, image]) => {
      const code = path.split("/").pop().replace(".png", "")
      return { code, rank: code.slice(0, -1), image }
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

function getScore(hand) {
  let score = 0
  let aces = 0

  for (const card of hand) {
    if (card.rank === "A") {
      score += 11
      aces += 1
    } else {
      score += ["J", "Q", "K"].includes(card.rank)
        ? 10
        : Number(card.rank)
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10
    aces -= 1
  }

  return score
}

function settleHand(playerHand, dealerHand) {
  const playerScore = getScore(playerHand)
  const dealerScore = getScore(dealerHand)
  let message

  if (playerScore > 21) {
    message = "Bust! The dealer wins."
  } else if (dealerScore > 21) {
    message = "The dealer busts! You win."
  } else if (playerScore > dealerScore) {
    message = "You win!"
  } else if (playerScore < dealerScore) {
    message = "The dealer wins."
  } else {
    message = "It’s a tie."
  }

  return {
    playerHand,
    dealerHand,
    phase: "finished",
    message,
  }
}

function createGame() {
  const deck = createDeck()
  const playerHand = [deck.pop(), deck.pop()]
  const dealerHand = [deck.pop(), deck.pop()]
  const playerNatural = getScore(playerHand) === 21
  const dealerNatural = getScore(dealerHand) === 21

  if (playerNatural || dealerNatural) {
    let message
    if (playerNatural && dealerNatural) {
      message = "Both have Blackjack. It’s a tie."
    } else if (playerNatural) {
      message = "Blackjack! You win."
    } else {
      message = "The dealer has Blackjack."
    }

    return {
      deck,
      ...settleHand(playerHand, dealerHand),
      message,
    }
  }

  return {
    deck,
    playerHand,
    dealerHand,
    phase: "player",
    message: "Your turn. Hit or stand?",
  }
}

function hit(game) {
  if (game.phase !== "player" || game.deck.length === 0) return game

  const [card, ...deck] = game.deck
  const playerHand = [...game.playerHand, card]

  if (getScore(playerHand) > 21) {
    const settled = settleHand(playerHand, game.dealerHand)
    return {
      ...game,
      ...settled,
      deck,
    }
  }

  const nextGame = {
    ...game,
    deck,
    playerHand,
    message: "Your turn. Hit or stand?",
  }

  if (getScore(playerHand) === 21 || deck.length === 0) {
    const settled = stand(nextGame)
    return {
      ...settled,
      message:
        getScore(playerHand) === 21
          ? "21! " + settled.message
          : "No cards remain. " + settled.message,
    }
  }

  return nextGame
}

function stand(game) {
  if (game.phase !== "player") return game

  let deck = [...game.deck]
  let dealerHand = [...game.dealerHand]

  while (getScore(dealerHand) < 17 && deck.length > 0) {
    dealerHand.push(deck.pop())
  }

  return {
    ...game,
    ...settleHand(game.playerHand, dealerHand),
    deck,
  }
}

function PlayingCards({ cards, hideSecondCard = false }) {
  return (
    <div className="blackjack-card-row">
      {cards.map((card, index) => (
        <img
          className="blackjack-card"
          key={card.code}
          src={hideSecondCard && index === 1 ? cardBack : card.image}
          alt={
            hideSecondCard && index === 1
              ? "Face-down card"
              : `${card.rank} playing card`
          }
        />
      ))}
    </div>
  )
}

function Blackjack() {
  const navigate = useNavigate()
  const [game, setGame] = useState(createGame)
  const playerScore = getScore(game.playerHand)
  const showDealerScore = game.phase === "finished"

  return (
    <main className="scene blackjack-scene">
      <button
        className="blackjack-back-button"
        type="button"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="blackjack-table">
        <h1>Blackjack</h1>
        <p className="blackjack-message" aria-live="polite">
          {game.message}
        </p>

        <section
          className="blackjack-hand blackjack-dealer-hand"
          aria-label="Dealer hand"
        >
          <img className="blackjack-shark" src={shark} alt="" aria-hidden="true" />
          <div className="blackjack-dealer-content">
            <div className="blackjack-hand-heading">
              <h2>Dealer</h2>
              {showDealerScore && <span>Score: {getScore(game.dealerHand)}</span>}
            </div>
            <PlayingCards
              cards={game.dealerHand}
              hideSecondCard={game.phase === "player"}
            />
          </div>
        </section>

        <section className="blackjack-hand" aria-label="Your hand">
          <div className="blackjack-hand-heading">
            <h2>Your hand</h2>
            <span>Score: {playerScore}</span>
          </div>
          <div className="blackjack-player-layout">
            <PlayingCards cards={game.playerHand} />
            {game.phase === "player" && (
              <div className="blackjack-actions">
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => setGame((currentGame) => hit(currentGame))}
                >
                  Hit
                </button>
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => setGame((currentGame) => stand(currentGame))}
                >
                  Stand
                </button>
              </div>
            )}
          </div>
        </section>

        {game.phase === "finished" && (
          <div className="blackjack-game-over">
            <section
              className="blackjack-game-over-card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="blackjack-game-over-heading"
            >
              <h2 id="blackjack-game-over-heading">{game.message}</h2>
              <button
                className="btn-primary blackjack-play-again"
                type="button"
                onClick={() => setGame(createGame())}
                autoFocus
              >
                Play again
              </button>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}

export default Blackjack
