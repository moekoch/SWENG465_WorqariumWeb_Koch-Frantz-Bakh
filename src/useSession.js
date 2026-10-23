import { useCallback, useEffect, useRef, useState } from 'react'
import { connectSocket, disconnectSocket } from './socket.js'

// join live session and keeps track of fish
export function useSession(sessionId) {
  // user's fish
  const [self, setSelf] = useState(null)

  // eothers' fish
  const [players, setPlayers] = useState({})

  // error message
  const [error, setError] = useState('')

  // socket for screen so move() can use without reconnecting
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket

    // ask to join
    socket.on('connect', () => {
      setError('')
      socket.emit('session:join', { sessionId })
    })

    // server sends user's fish then everyone already here
    socket.on('session:self', (player) => setSelf(player))
    socket.on('session:players', (list) => {
      setPlayers(Object.fromEntries(list.map((p) => [p.id, p])))
    })

    // someone arrived
    socket.on('player:join', (player) => {
      setPlayers((prev) => ({ ...prev, [player.id]: player }))
    })

    // someone moved
    socket.on('player:move', ({ id, x, y }) => {
      setPlayers((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id], x, y } } : prev))
    })

    // someone left
    socket.on('player:leave', ({ id }) => {
      setPlayers((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    })

    // server refused something
    socket.on('session:error', (data) => setError(data.error))
    socket.on('connect_error', (err) => {
      setError(err.message === 'unauthorized' ? 'unauthorized' : 'Could not reach the server.')
    })

    // server ended connection
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        setError('You joined from another tab or device, so this one was disconnected.')
      }
    })

    // tell server leaving screen and close connection
    return () => {
      socket.emit('session:leave')
      disconnectSocket()
      socketRef.current = null
    }
  }, [sessionId])

  // move user's fish
  const move = useCallback((x, y) => {
    const nextX = Math.min(1, Math.max(0, x))
    const nextY = Math.min(1, Math.max(0, y))

    // show right away instead of waiting for server
    setSelf((prev) => (prev ? { ...prev, x: nextX, y: nextY } : prev))

    // tell everyone else
    socketRef.current?.emit('move', { x: nextX, y: nextY })
  }, [])

  return { self, players, error, move }
}