import { Server } from '@hocuspocus/server'

const server = new Server({
  port: 1234,

  onConnect({ socketId }) {
    console.log(`[+] Client connected: ${socketId}`)
  },

  onDisconnect({ socketId }) {
    console.log(`[-] Client disconnected: ${socketId}`)
  },
})

server.listen().then(() => {
  console.log('Hocuspocus server running on ws://localhost:1234')
}).catch((err) => {
  console.error('Failed to start server:', err)
})
