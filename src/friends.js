import { useEffect, useMemo, useState } from 'react'
import { api } from './api.js'
import { useSession } from './sessionContext.js'

// ---------------------------------------------------------------------------
// PLACEHOLDER DATA: the server has no "my friends" endpoint yet (the existing
// /api/friends routes are not mounted and are not per-user). Until it does,
// these stand in so the panel can be built and styled. `previewOnline` only
// exists to show the green dot in dev; it is ignored once real data loads.
// When the endpoint exists, return [{ id, username, avatarKey, online? }] from
//   GET /api/users/me/friends
// and this hook will use it automatically.
// ---------------------------------------------------------------------------
const PLACEHOLDER_FRIENDS = [
  { id: 'placeholder-1', username: 'Friend1', avatarKey: 'linedButterflyfish', previewOnline: true },
  { id: 'placeholder-2', username: 'Friend2', avatarKey: 'orangeClownfish', previewOnline: false },
  { id: 'placeholder-3', username: 'Friend3', avatarKey: 'moorishIdol', previewOnline: true },
]

// friends list with an `online` flag, online friends first, then A to Z
export function useFriends() {
  // who is swimming in the Commons right now
  const { onlineUsernames } = useSession()

  // null until the server answers (or fails)
  const [serverFriends, setServerFriends] = useState(null)

  useEffect(() => {
    let cancelled = false
    api('/api/users/me/friends')
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setServerFriends(list)
      })
      .catch(() => {
        // endpoint missing or server down: keep the placeholder list
      })
    return () => {
      cancelled = true
    }
  }, [])

  return useMemo(() => {
    const usingPlaceholders = serverFriends === null
    const source = usingPlaceholders ? PLACEHOLDER_FRIENDS : serverFriends

    const withStatus = source.map((friend) => ({
      ...friend,
      online:
        onlineUsernames.has(friend.username) ||
        Boolean(friend.online) ||
        (usingPlaceholders && friend.previewOnline),
    }))

    return withStatus.sort(
      (a, b) => Number(b.online) - Number(a.online) || a.username.localeCompare(b.username),
    )
  }, [serverFriends, onlineUsernames])
}
