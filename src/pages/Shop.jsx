import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api.js"
import { DEFAULT_FISH_KEY, getFishImage } from "../fishImages.js"
import "./Shop.css"

// placeholder tiles in items panel
const ITEM_COUNT = 14

function Shop() {
  // used to send user to login if token rejected
  const navigate = useNavigate()

  // fish for sale from server
  const [avatars, setAvatars] = useState([])

  // user's points, owned fish, worn fish
  const [wallet, setWallet] = useState({ points: 0, ownedAvatarIds: [], avatarId: null })

  // false until shop data has loaded
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState("")

  // id of fish picked in grid
  const [selectedId, setSelectedId] = useState(null)

  // true while waiting for server, and messages for user
  const [busy, setBusy] = useState(false)
  const [buyError, setBuyError] = useState("")
  const [message, setMessage] = useState("")

  // ref to buy popup
  const buyDialog = useRef(null)

  // load fish and user's points when page opens
  useEffect(() => {
    Promise.all([api("/api/avatars"), api("/api/users/me")])
      .then(([fish, me]) => {
        setAvatars(fish)
        setWallet({
          points: me.points,
          ownedAvatarIds: me.ownedAvatarIds,
          avatarId: me.avatarId,
        })
        setLoaded(true)
      })
      .catch((error) => {
        // not logged in or token expired, send to login
        if (error.status === 401) navigate("/")
        else setLoadError("Could not load the shop.")
      })
  }, [navigate])

  // worn fish
  const equipped =
    avatars.find((a) => a._id === wallet.avatarId) ??
    avatars.find((a) => a.imageKey === DEFAULT_FISH_KEY)

  // fish picked in grid
  const selected = avatars.find((a) => a._id === selectedId)

  // free fish belong to everyone
  const isOwned = (avatar) => avatar.price === 0 || wallet.ownedAvatarIds.includes(avatar._id)
  const isEquipped = (avatar) => avatar._id === equipped?._id

  // preview shows picked fish or the user's current fish
  const shown = selected ?? equipped

  // text under each tile
  const tileLabel = (avatar) => {
    if (isEquipped(avatar)) return "In use"
    if (isOwned(avatar)) return avatar.price === 0 ? "Free" : "Owned"
    return `${avatar.price}`
  }

  // can user pay for picked fish
  const canAfford = selected ? wallet.points >= selected.price : false

  // pick a fish
  const handleSelect = (avatar) => {
    setSelectedId(avatar._id)
    setMessage("")
  }

  // open buy popup
  const openBuy = () => {
    setBuyError("")
    buyDialog.current.showModal()
  }

  // buy picked fish
  const handleBuy = async () => {
    setBusy(true)
    setBuyError("")
    try {
      const updated = await api(`/api/avatars/${selected._id}/purchase`, { method: "POST" })

      // use new balance and owned fish from server
      setWallet((prev) => ({
        ...prev,
        points: updated.points,
        ownedAvatarIds: updated.ownedAvatarIds,
      }))

      buyDialog.current.close()
      setMessage(`You bought ${selected.name}!`)
    } catch (error) {
      // not enough points, already owned, server down
      setBuyError(error.message)
    } finally {
      setBusy(false)
    }
  }

  // wear picked fish in sessions
  const handleEquip = async () => {
    setBusy(true)
    try {
      await api("/api/users/me/avatar", { method: "PATCH", body: { avatarId: selected._id } })
      setWallet((prev) => ({ ...prev, avatarId: selected._id }))
      setMessage(`${selected.name} is now your fish.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  // button under preview
  let action = { label: "Buy", disabled: true, onClick: undefined }
  if (selected) {
    if (!isOwned(selected)) action = { label: "Buy", disabled: false, onClick: openBuy }
    else if (isEquipped(selected)) action = { label: "In use", disabled: true, onClick: undefined }
    else action = { label: "Use", disabled: false, onClick: handleEquip }
  }

  return (
    <main className="scene shop-scene">
      <div className="shop-container">

        {/* preview box */}
        <section className="shop-preview card" aria-live="polite">

          {/* image display */}
          <div className="preview-image">
            {shown && <img src={getFishImage(shown.imageKey)} alt={shown.name} />}
          </div>

          {/* name of the fish shown */}
          {shown && <p className="preview-name">{shown.name}</p>}

          {/* result of the last buy or use */}
          {message && <p className="preview-note">{message}</p>}

          {/* buy, use, in use, disabled */}
          <button
            className="btn-primary preview-buy"
            disabled={action.disabled || busy}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        </section>

        {/* side by side panels */}
        <div className="shop-layout">

          {/* avatars panel */}
          <section className="shop-panel">

            {/* title and points */}
            <div className="shop-panel-header">
              <h2>Avatars</h2>
              <span className="shop-balance">{loaded ? wallet.points : "…"} pts</span>
            </div>

            {/* section description */}
            <p className="shop-description">Customize your avatar</p>

            {/* status messages */}
            {loadError && <p className="error-msg" role="alert">{loadError}</p>}
            {!loaded && !loadError && <p className="shop-description">Loading fish...</p>}

            {/* one tile per fish from server */}
            <div className="shop-grid">
              {avatars.map((avatar) => (
                <button
                  // highlight tile when selected
                  className={`shop-tile${avatar._id === selectedId ? " is-selected" : ""}`}
                  // track each item in list
                  key={avatar._id}
                  // screen reader label
                  aria-label={`${avatar.name}, ${tileLabel(avatar)}${isOwned(avatar) ? "" : " pts"}`}
                  // tell screen reader if selected
                  aria-pressed={avatar._id === selectedId}
                  // select tile
                  onClick={() => handleSelect(avatar)}
                >
                  {/* fish image */}
                  <span className="tile-square">
                    <img src={getFishImage(avatar.imageKey)} alt="" />
                  </span>
                  <span className="tile-price">{tileLabel(avatar)}</span>
                </button>
              ))}
            </div>
          </section>

          {/* items panel */}
          <section className="shop-panel">
            <div className="shop-panel-header">
              <h2>Items</h2>
              <span className="shop-balance">{loaded ? wallet.points : "…"} pts</span>
            </div>
            <p className="shop-description">Coming soon</p>

            {/* disabled placeholder tiles */}
            <div className="shop-grid">
              {Array.from({ length: ITEM_COUNT }).map((_, index) => (
                <button
                  className="shop-tile"
                  key={index}
                  disabled
                  aria-label={`Item ${index + 1}, coming soon`}
                >
                  <span className="tile-square" />
                  <span className="tile-price">100</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* buy popup */}
      <dialog ref={buyDialog} className="dialog" onClose={() => setBuyError("")}>
        {selected && (
          <>
            <h2>Buy {selected.name}?</h2>

            {/* picture of fish */}
            <div className="preview-image buy-image">
              <img src={getFishImage(selected.imageKey)} alt="" />
            </div>

            {/* cost and balance */}
            <p className="buy-detail">
              This costs {selected.price} pts. You have {wallet.points} pts
              {canAfford ? ` and will have ${wallet.points - selected.price} left.` : "."}
            </p>

            {/* not enough points */}
            {!canAfford && (
              <p className="error-msg" role="alert">
                You need {selected.price - wallet.points} more points.
              </p>
            )}

            {/* error from the server */}
            {buyError && (
              <p className="error-msg" role="alert">
                {buyError}
              </p>
            )}

            {/* popup buttons */}
            <div className="dialog-actions">
              {/* close without buying */}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => buyDialog.current.close()}
              >
                Cancel
              </button>

              {/* confirm buy */}
              <button
                type="button"
                className="btn-primary"
                onClick={handleBuy}
                disabled={!canAfford || busy}
              >
                {busy ? "Buying..." : "Buy"}
              </button>
            </div>
          </>
        )}
      </dialog>
    </main>
  )
}

export default Shop