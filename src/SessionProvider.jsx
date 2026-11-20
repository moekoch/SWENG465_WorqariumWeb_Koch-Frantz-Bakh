import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { connectSocket, disconnectSocket } from './socket.js'
import { SessionContext } from './sessionContext.js'

// everyone shares one session for now (the "Glasshouse Commons")
const SESSION_ID = 'main'

// Keeps ONE live connection for the whole signed-in app so that:
//  - the map has every fish's position
//  - the Friends panel can tell who is online from any page
// (The server only allows one socket per user, so games share this same socket.)
export function SessionProvider({ children }) {
  // user's fish
  const [self, setSelf] = useState(null)

  // everyone else's fish, keyed by id
  const [players, setPlayers] = useState({})

  // false until the socket connects
  const [connected, setConnected] = useState(false)

  // error message from the server or the network
  const [error, setError] = useState('')

  // socket for move() so it doesn't reconnect
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket

    // ask to join whenever we (re)connect
    const handleConnect = () => {
      setConnected(true)
      setError('')
      socket.emit('session:join', { sessionId: SESSION_ID })
    }
    // server sends user's fish, then everyone already here
    const handleSelf = (player) => setSelf(player)
    const handlePlayers = (list) => {
      setPlayers(Object.fromEntries(list.map((p) => [p.id, p])))
    }
    // someone arrived / moved / left
    const handleJoin = (player) => setPlayers((prev) => ({ ...prev, [player.id]: player }))
    const handleMove = ({ id, x, y }) => {
      setPlayers((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], x, y } } : prev))
    }
    const handleLeave = ({ id }) => {
      setPlayers((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }
    // server refused something or can't be reached
    const handleSessionError = (data) => setError(data.error)
    const handleConnectError = (err) => {
      setError(err.message === 'unauthorized' ? 'unauthorized' : 'Could not reach the server.')
    }
    const handleDisconnect = (reason) => {
      setConnected(false)
      if (reason === 'io server disconnect') {
        setError('You joined from another tab or device, so this one was disconnected.')
      }
    }

    socket.on('connect', handleConnect)
    socket.on('session:self', handleSelf)
    socket.on('session:players', handlePlayers)
    socket.on('player:join', handleJoin)
    socket.on('player:move', handleMove)
    socket.on('player:leave', handleLeave)
    socket.on('session:error', handleSessionError)
    socket.on('connect_error', handleConnectError)
    socket.on('disconnect', handleDisconnect)

    // leaving the signed-in app (logout, delete account) closes the connection
    return () => {
      socket.off('connect', handleConnect)
      socket.off('session:self', handleSelf)
      socket.off('session:players', handlePlayers)
      socket.off('player:join', handleJoin)
      socket.off('player:move', handleMove)
      socket.off('player:leave', handleLeave)
      socket.off('session:error', handleSessionError)
      socket.off('connect_error', handleConnectError)
      socket.off('disconnect', handleDisconnect)
      socket.emit('session:leave')
      disconnectSocket()
      socketRef.current = null
    }
  }, [])

  // move user's fish (positions are fractions 0 to 1 of the map)
  const move = useCallback((x, y) => {
    const nextX = Math.min(1, Math.max(0, x))
    const nextY = Math.min(1, Math.max(0, y))

    // show right away instead of waiting for the server
    setSelf((prev) => (prev ? { ...prev, x: nextX, y: nextY } : prev))

    // tell everyone else
    socketRef.current?.emit('move', { x: nextX, y: nextY })
  }, [])

  // usernames of everyone currently in the Commons (used for "online" dots)
  const onlineUsernames = useMemo(() => {
    const names = new Set(Object.values(players).map((player) => player.username))
    if (self) names.add(self.username)
    return names
  }, [players, self])

  const value = useMemo(
    () => ({ self, players, connected, error, move, onlineUsernames }),
    [self, players, connected, error, move, onlineUsernames],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
