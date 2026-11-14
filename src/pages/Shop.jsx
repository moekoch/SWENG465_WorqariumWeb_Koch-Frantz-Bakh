import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api.js"
import { DEFAULT_FISH_KEY, getFishImage } from "../fishImages.js"
import { getItemImage } from "../itemImages.js"
import "./Shop.css"

// image for a fish or an item
const imageFor = (kind, imageKey) =>
  kind === "item" ? getItemImage(imageKey) : getFishImage(imageKey)

function Shop() {
  // used to send user to login if token rejected
  const navigate = useNavigate()

  // fish for sale from server
  const [avatars, setAvatars] = useState([])

  // items for sale from server
  const [items, setItems] = useState([])

  // user's points, owned fish and items, worn fish
  const [wallet, setWallet] = useState({
    points: 0,
    ownedAvatarIds: [],
    ownedItemIds: [],
    avatarId: null,
  })

  // false until shop data has loaded
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState("")

  // what is picked in the grids
  const [selection, setSelection] = useState(null)

  // true while waiting for server, and messages for user
  const [busy, setBusy] = useState(false)
  const [buyError, setBuyError] = useState("")
  const [message, setMessage] = useState("")

  // ref to buy popup
  const buyDialog = useRef(null)

  // load fish, items, and user's points when page opens
  useEffect(() => {
    Promise.all([api("/api/avatars"), api("/api/items"), api("/api/users/me")])
      .then(([fish, decorations, me]) => {
        setAvatars(fish)
        setItems(decorations)
        setWallet({
          points: me.points,
          ownedAvatarIds: me.ownedAvatarIds,
          ownedItemIds: me.ownedItemIds ?? [],
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

  // kind of thing picked and the thing itself
  const kind = selection?.kind
  const selected = selection
    ? (kind === "item" ? items : avatars).find((thing) => thing._id === selection.id)
    : undefined

  // free things belong to everyone
  const isOwned = (thing, thingKind) => {
    const ownedIds = thingKind === "item" ? wallet.ownedItemIds : wallet.ownedAvatarIds
    return thing.price === 0 || ownedIds.includes(thing._id)
  }

  // only fish can be worn
  const isEquipped = (avatar) => avatar._id === equipped?._id

  // is this exact tile picked
  const isPicked = (thingKind, id) => selection?.kind === thingKind && selection?.id === id

  // preview shows picked fish or item, or user's current fish
  const shown = selected ?? equipped
  const shownKind = selected ? kind : "avatar"

  // text under each tile
  const tileLabel = (thing, thingKind) => {
    if (thingKind === "avatar" && isEquipped(thing)) return "In use"
    if (isOwned(thing, thingKind)) return thing.price === 0 ? "Free" : "Owned"
    return `${thing.price}`
  }

  // can user pay for picked thing
  const canAfford = selected ? wallet.points >= selected.price : false

  // pick a fish or item
  const handleSelect = (thingKind, thing) => {
    setSelection({ kind: thingKind, id: thing._id })
    setMessage("")
  }

  // open buy popup
  const openBuy = () => {
    setBuyError("")
    buyDialog.current.showModal()
  }

  // buy picked fish or item
  const handleBuy = async () => {
    setBusy(true)
    setBuyError("")
    try {
      const route = kind === "item" ? "items" : "avatars"
      const updated = await api(`/api/${route}/${selected._id}/purchase`, { method: "POST" })

      // use new balance and owned things from server
      setWallet((prev) => ({ ...prev, ...updated }))

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
    if (!isOwned(selected, kind)) action = { label: "Buy", disabled: false, onClick: openBuy }
    else if (kind === "item") action = { label: "Owned", disabled: true, onClick: undefined }
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
            {shown && <img src={imageFor(shownKind, shown.imageKey)} alt={shown.name} />}
          </div>

          {/* name of fish or item shown */}
          {shown && <p className="preview-name">{shown.name}</p>}

          {/* result of last buy or use */}
          {message && <p className="preview-note">{message}</p>}

          {/* buy, use, owned, in use, disabled */}
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
                  className={`shop-tile${isPicked("avatar", avatar._id) ? " is-selected" : ""}`}
                  // track each item in list
                  key={avatar._id}
                  // screen reader label
                  aria-label={`${avatar.name}, ${tileLabel(avatar, "avatar")}${isOwned(avatar, "avatar") ? "" : " pts"}`}
                  // tell screen reader if selected
                  aria-pressed={isPicked("avatar", avatar._id)}
                  // select tile
                  onClick={() => handleSelect("avatar", avatar)}
                >
                  {/* fish image */}
                  <span className="tile-square">
                    <img src={getFishImage(avatar.imageKey)} alt="" />
                  </span>
                  <span className="tile-price">{tileLabel(avatar, "avatar")}</span>
                </button>
              ))}
            </div>
          </section>

          {/* decorations panel */}
          <section className="shop-panel">

            {/* title and points */}
            <div className="shop-panel-header">
              <h2>Decorations</h2>
              <span className="shop-balance">{loaded ? wallet.points : "…"} pts</span>
            </div>

            {/* section description */}
            <p className="shop-description">Obtain profile decorations</p>

            {/* status messages */}
            {loadError && <p className="error-msg" role="alert">{loadError}</p>}
            {!loaded && !loadError && <p className="shop-description">Loading decorations...</p>}

            {/* one tile per item from server */}
            <div className="shop-grid">
              {items.map((item) => (
                <button
                  // highlight tile when selected
                  className={`shop-tile${isPicked("item", item._id) ? " is-selected" : ""}`}
                  // track each item in list
                  key={item._id}
                  // screen reader label
                  aria-label={`${item.name}, ${tileLabel(item, "item")}${isOwned(item, "item") ? "" : " pts"}`}
                  // tell screen reader if selected
                  aria-pressed={isPicked("item", item._id)}
                  // select tile
                  onClick={() => handleSelect("item", item)}
                >
                  {/* item image */}
                  <span className="tile-square">
                    <img src={getItemImage(item.imageKey)} alt="" />
                  </span>
                  <span className="tile-price">{tileLabel(item, "item")}</span>
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

            {/* picture of fish or item */}
            <div className="preview-image buy-image">
              <img src={imageFor(kind, selected.imageKey)} alt="" />
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

            {/* error from server */}
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