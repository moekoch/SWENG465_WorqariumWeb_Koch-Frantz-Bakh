import { io } from 'socket.io-client'
import { API_URL, getToken } from './api.js'

// one shared connection for whole app
let socket = null

// connect to server
export function connectSocket() {
  if (socket) return socket

  socket = io(API_URL, {
    // sent on every connect/reconnect so current token is always used
    auth: (cb) => cb({ token: getToken() }),
  })

  return socket
}

// disconnect when leaving  session screen, logging out, or deleting account
export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}