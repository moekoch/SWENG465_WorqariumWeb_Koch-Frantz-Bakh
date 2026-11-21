import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { connectSocket, disconnectSocket } from './socket.js'
import { SessionContext } from './sessionContext.js'

// everyone shares one session for now (the "Glasshouse Commons")
const SESSION_ID = 'main'

// how long a speech bubble stays over a fish
const CHAT_BUBBLE_MILLISECONDS = 6000

// how long to wait for the server to confirm a message
const CHAT_ACK_TIMEOUT_MILLISECONDS = 2500

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

  // speech bubbles currently showing, keyed by player id: { text, at }
  const [chatBubbles, setChatBubbles] = useState({})

  // most recent chat message anywhere in the room: { id, username, text, at }
  const [latestMessage, setLatestMessage] = useState(null)

  // socket for move() so it doesn't reconnect
  const socketRef = useRef(null)

  // timers that take each bubble down again, keyed by player id
  const bubbleTimersRef = useRef(new Map())

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket

    // the same Map for the whole life of the provider
    const bubbleTimers = bubbleTimersRef.current

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
    // someone said something: show it over their fish for a few seconds
    const handleChatMessage = (message) => {
      if (!message || typeof message.text !== 'string') return
      setLatestMessage(message)
      setChatBubbles((prev) => ({ ...prev, [message.id]: message }))

      // a new message replaces that fish's old timer
      clearTimeout(bubbleTimers.get(message.id))
      bubbleTimers.set(
        message.id,
        setTimeout(() => {
          setChatBubbles((prev) => {
            const next = { ...prev }
            delete next[message.id]
            return next
          })
          bubbleTimers.delete(message.id)
        }, CHAT_BUBBLE_MILLISECONDS),
      )
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
    socket.on('chat:message', handleChatMessage)
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
      socket.off('chat:message', handleChatMessage)
      socket.off('session:error', handleSessionError)
      socket.off('connect_error', handleConnectError)
      socket.off('disconnect', handleDisconnect)
      socket.emit('session:leave')
      disconnectSocket()
      socketRef.current = null

      // stop bubble timers
      bubbleTimers.forEach((timer) => clearTimeout(timer))
      bubbleTimers.clear()
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

  // say something to the room. Resolves { ok: true } or { ok: false, error }.
  const sendChat = useCallback(
    (text) =>
      new Promise((resolve) => {
        const socket = socketRef.current
        if (!socket?.connected) {
          resolve({ ok: false, error: 'Not connected yet.' })
          return
        }
        // a server that doesn't know about chat never answers, so give up after a moment
        socket.timeout(CHAT_ACK_TIMEOUT_MILLISECONDS).emit('chat:send', { text }, (timeoutError, response) => {
          if (timeoutError) resolve({ ok: false, error: "Chat isn't available on the server yet." })
          else resolve(response ?? { ok: true })
        })
      }),
    [],
  )

  // usernames of everyone currently in the Commons (used for "online" dots)
  const onlineUsernames = useMemo(() => {
    const names = new Set(Object.values(players).map((player) => player.username))
    if (self) names.add(self.username)
    return names
  }, [players, self])

  // how many fish are in the room (including you)
  const fishCount = Object.keys(players).length + (self ? 1 : 0)

  const value = useMemo(
    () => ({
      self, players, connected, error, move, onlineUsernames,
      chatBubbles, latestMessage, sendChat, fishCount,
    }),
    [self, players, connected, error, move, onlineUsernames, chatBubbles, latestMessage, sendChat, fishCount],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
