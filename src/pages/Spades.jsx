import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import shark from "../assets/fish/shark.png"
import "./Spades.css"

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

function Spades() {
  const navigate = useNavigate()
  const [deck, setDeck] = useState([])
  const [playerHand, setPlayerHand] = useState([])
  const [computerHand, setComputerHand] = useState([])

  useEffect(() => {
    setDeck(createDeck())
  }, [])
  return (
    <main className="scene spades-scene">
        <button 
          className="spades-back-button" 
          type="button"
          onClick={() => navigate("-1")}
        >
          ← Back
        </button>
    </main>
    )
  }

  export default Spades