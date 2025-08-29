const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const path = require('path')

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const PORT = process.env.PORT || 3000

// Serve static files
app.use(express.static(path.join(__dirname, 'public')))

// Track connected users
const users = new Map()
const rooms = new Map()

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id)

  // Join room
  socket.on('join-room', (data) => {
    const { roomId, userId } = data
    
    socket.join(roomId)
    users.set(socket.id, { userId, roomId })
    
    // Get current room users
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set())
    }
    rooms.get(roomId).add(socket.id)
    
    // Notify other users in the room
    const roomUsers = Array.from(rooms.get(roomId))
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      roomUsers: roomUsers
    })
    
    // Send current users to the new user
    socket.emit('room-users', {
      roomUsers: roomUsers,
      yourId: socket.id
    })
    
    console.log(`User ${socket.id} joined room ${roomId}`)
  })

  // Handle signaling
  socket.on('signal', (data) => {
    const { to, signal } = data
    io.to(to).emit('signal', {
      from: socket.id,
      signal: signal
    })
  })

  // Handle whiteboard events
  socket.on('draw', (data) => {
    const user = users.get(socket.id)
    if (user) {
      socket.to(user.roomId).emit('draw', data)
    }
  })

  socket.on('clear-board', () => {
    const user = users.get(socket.id)
    if (user) {
      socket.to(user.roomId).emit('clear-board')
    }
  })

  socket.on('undo', () => {
    const user = users.get(socket.id)
    if (user) {
      socket.to(user.roomId).emit('undo')
    }
  })

  // Handle chat messages
  socket.on('chat-message', (data) => {
    const user = users.get(socket.id)
    if (user) {
      io.to(user.roomId).emit('chat-message', {
        from: socket.id,
        message: data.message,
        timestamp: new Date().toISOString()
      })
    }
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id)
    
    if (user && rooms.has(user.roomId)) {
      rooms.get(user.roomId).delete(socket.id)
      
      // Remove room if empty
      if (rooms.get(user.roomId).size === 0) {
        rooms.delete(user.roomId)
      }
      
      // Notify other users
      socket.to(user.roomId).emit('user-left', {
        userId: socket.id
      })
    }
    
    users.delete(socket.id)
    console.log('Client disconnected:', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Open http://localhost:${PORT} in two browser windows to test`)
})