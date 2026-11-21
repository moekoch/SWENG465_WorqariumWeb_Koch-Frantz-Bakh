import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoArrowBack, IoStarOutline } from 'react-icons/io5'
import { api } from '../api.js'
import BubbleLoader from '../components/BubbleLoader.jsx'
import { environmentStyle } from '../environmentImages.js'
import { DEFAULT_FISH_KEY, getFishImage } from '../fishImages.js'
import { getItemImage } from '../itemImages.js'
import './Shop.css'

// the two tabs: fish looks and tank decor
const TABS = [
  {
    kind: 'avatar',
    label: 'Avatar decoration',
    heading: 'A fresh look for your fish.',
    subheading: 'Pick a fish to wear around the Commons.',
  },
  {
    kind: 'item',
    label: 'Tank furniture',
    heading: 'A little home beneath the current.',
    subheading: 'Plants, decor, and cozy corners for your tank.',
  },
]

// short lines under each product name (the server sends names only)
const BLURBS = {
  'Seagrass planter': 'A little patch of green.',
  'Coral garden': 'A soft splash of color.',
  'Stone arch': 'A calm hideaway.',
  'Bubble lamp': 'A gentle glow.',
}
const blurbFor = (kind, name) =>
  BLURBS[name] ?? (kind === 'item' ? 'A little something for your tank.' : 'A new look for your fish.')

// image for a fish or an item
const imageFor = (kind, imageKey) => (kind === 'item' ? getItemImage(imageKey) : getFishImage(imageKey))

function Shop() {
  // used to send user to login if token rejected, and back to the tank
  const navigate = useNavigate()

  // fish and items for sale from server
  const [avatars, setAvatars] = useState([])
  const [items, setItems] = useState([])

  // user's coins, owned fish and items, worn fish
  const [wallet, setWallet] = useState({ points: 0, ownedAvatarIds: [], ownedItemIds: [], avatarId: null })

  // false until shop data has loaded
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState('')

  // which tab is open
  const [activeKind, setActiveKind] = useState('item')

  // what the buy popup is asking about, { kind, id }
  const [pending, setPending] = useState(null)

  // true while waiting for server, and messages for user
  const [busy, setBusy] = useState(false)
  const [buyError, setBuyError] = useState('')
  const [shopkeeperNote, setShopkeeperNote] = useState('')

  // ref to buy popup
  const buyDialog = useRef(null)

  // load fish, items, and user's coins when page opens
  useEffect(() => {
    Promise.all([api('/api/avatars'), api('/api/items'), api('/api/users/me')])
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
        if (error.status === 401) navigate('/')
        else setLoadError('Could not load the shop.')
      })
  }, [navigate])

  // worn fish
  const equipped =
    avatars.find((avatar) => avatar._id === wallet.avatarId) ??
    avatars.find((avatar) => avatar.imageKey === DEFAULT_FISH_KEY)

  // free things belong to everyone
  const isOwned = (thing, kind) => {
    const ownedIds = kind === 'item' ? wallet.ownedItemIds : wallet.ownedAvatarIds
    return thing.price === 0 || ownedIds.includes(thing._id)
  }

  // thing the popup is about
  const pendingThing = pending
    ? (pending.kind === 'item' ? items : avatars).find((thing) => thing._id === pending.id)
    : undefined
  const canAfford = pendingThing ? wallet.points >= pendingThing.price : false

  // open buy popup
  const openBuy = (kind, thing) => {
    setPending({ kind, id: thing._id })
    setBuyError('')
    setShopkeeperNote('')
    buyDialog.current.showModal()
  }

  // buy the thing in the popup
  const handleBuy = async () => {
    setBusy(true)
    setBuyError('')
    try {
      const route = pending.kind === 'item' ? 'items' : 'avatars'
      const updated = await api(`/api/${route}/${pendingThing._id}/purchase`, { method: 'POST' })

      // use new balance and owned things from server
      setWallet((prev) => ({ ...prev, ...updated }))
      buyDialog.current.close()
      setShopkeeperNote(`${pendingThing.name} is yours. Enjoy!`)
    } catch (error) {
      // not enough coins, already owned, server down
      setBuyError(error.message)
    } finally {
      setBusy(false)
    }
  }

  // wear a fish in sessions
  const handleEquip = async (avatar) => {
    setBusy(true)
    try {
      await api('/api/users/me/avatar', { method: 'PATCH', body: { avatarId: avatar._id } })
      setWallet((prev) => ({ ...prev, avatarId: avatar._id }))
      setShopkeeperNote(`${avatar.name} looks wonderful on you.`)
    } catch (error) {
      setShopkeeperNote(error.message)
    } finally {
      setBusy(false)
    }
  }

  // what a product's button says and does
  const actionFor = (kind, thing) => {
    if (!isOwned(thing, kind)) {
      return { label: `Buy · ${thing.price} coins`, disabled: false, onClick: () => openBuy(kind, thing) }
    }
    if (kind === 'item') return { label: 'Owned', disabled: true }
    if (thing._id === equipped?._id) return { label: 'In use', disabled: true }
    return { label: 'Use', disabled: busy, onClick: () => handleEquip(thing) }
  }

  const activeTab = TABS.find((tab) => tab.kind === activeKind)
  const products = activeKind === 'item' ? items : avatars

  return (
    <div className="shop-page">
      {/* ---------- the shop and its keeper ---------- */}
      <aside className="shop-portrait environment env-shop" style={environmentStyle('shopBackground')}>
        <button type="button" className="shop-back" onClick={() => navigate('/tank')}>
          <IoArrowBack size={14} aria-hidden="true" /> Your Tank
        </button>
        <div className="shop-sign">
          <h2>Russ&rsquo;s Reef Shop</h2>
          <p>A few treasures. A lot of heart.</p>
        </div>
      </aside>

      <div className="shop-main">
        {/* ---------- greeting and balance ---------- */}
        <section className="shop-greeting">
          <div className="shop-greeting-text" aria-live="polite">
            <span className="shop-eyebrow">RUSS · YOUR SHOPKEEPER</span>
            <h1>&ldquo;Keep it simple, stupid.&rdquo;</h1>
            <p>Make a little splash. Every unlock is yours to keep.</p>
            <strong>{shopkeeperNote || 'What catches your eye today?'}</strong>
          </div>
          <div className="shop-balance-box">
            <span className="shop-eyebrow">YOUR BALANCE</span>
            <span className="shop-balance-amount">
              <IoStarOutline size={18} aria-hidden="true" />
              {loaded ? `${wallet.points} coins` : '…'}
            </span>
          </div>
        </section>

        {/* ---------- tabs ---------- */}
        <div className="shop-tabs" role="tablist" aria-label="Shop sections">
          {TABS.map((tab) => (
            <button
              key={tab.kind}
              type="button"
              role="tab"
              id={`shop-tab-${tab.kind}`}
              aria-selected={activeKind === tab.kind}
              aria-controls="shop-products"
              className="shop-tab"
              onClick={() => setActiveKind(tab.kind)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ---------- products ---------- */}
        <section id="shop-products" role="tabpanel" aria-labelledby={`shop-tab-${activeKind}`}>
          <h2 className="shop-section-title">{activeTab.heading}</h2>
          <p className="shop-section-sub">{activeTab.subheading}</p>

          {loadError && <p className="shop-error" role="alert">{loadError}</p>}
          {!loaded && !loadError && <BubbleLoader label="Setting out the shelves…" />}

          <div className="shop-products">
            {products.map((thing) => {
              const action = actionFor(activeKind, thing)
              return (
                <article key={thing._id} className="product-card">
                  <div className="product-top">
                    <span className="product-thumb">
                      <img src={imageFor(activeKind, thing.imageKey)} alt="" />
                    </span>
                    <div>
                      <h3>{thing.name}</h3>
                      <p>{blurbFor(activeKind, thing.name)}</p>
                    </div>
                  </div>
                  <span className="product-price">
                    <IoStarOutline size={13} aria-hidden="true" />
                    {thing.price === 0 ? 'Free' : `${thing.price} coins`}
                  </span>
                  <button
                    type="button"
                    className="product-button"
                    disabled={action.disabled}
                    onClick={action.onClick}
                  >
                    {action.label}
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      </div>

      {/* ---------- buy popup ---------- */}
      <dialog ref={buyDialog} className="dialog" onClose={() => setBuyError('')}>
        {pendingThing && (
          <>
            <h2>Buy {pendingThing.name}?</h2>
            <span className="product-thumb buy-thumb">
              <img src={imageFor(pending.kind, pendingThing.imageKey)} alt="" />
            </span>
            <p className="buy-detail">
              This costs {pendingThing.price} coins. You have {wallet.points} coins
              {canAfford ? ` and will have ${wallet.points - pendingThing.price} left.` : '.'}
            </p>
            {!canAfford && (
              <p className="shop-error" role="alert">
                You need {pendingThing.price - wallet.points} more coins.
              </p>
            )}
            {buyError && <p className="shop-error" role="alert">{buyError}</p>}
            <div className="dialog-actions">
              <button type="button" className="btn-secondary" onClick={() => buyDialog.current.close()}>
                Cancel
              </button>
              <button type="button" className="btn-primary" onClick={handleBuy} disabled={!canAfford || busy}>
                {busy ? 'Buying…' : 'Buy'}
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  )
}

export default Shop
