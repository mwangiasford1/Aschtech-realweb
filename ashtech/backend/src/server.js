const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const sequelize = require('./mysql');
const User = require('./models/User');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const userSocketMap = {}; // userId: socketId
const onlineUsers = new Set();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register userId with socket
  socket.on('register', (userId) => {
    // If user is already connected, disconnect the old socket
    if (userSocketMap[userId] && userSocketMap[userId] !== socket.id) {
      const oldSocketId = userSocketMap[userId];
      io.to(oldSocketId).emit('force logout', 'You have been logged out because your account was logged in elsewhere.');
      io.sockets.sockets.get(oldSocketId)?.disconnect(true);
    }
    userSocketMap[userId] = socket.id;
    onlineUsers.add(userId);
    io.emit('online users', Array.from(onlineUsers)); // Notify all clients
  });

  // Private chat message: { from, to, text, time }
  socket.on('private message', (msg) => {
    const recipientSocketId = userSocketMap[msg.to];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private message', msg);
    }
    // Also send to sender for their own chat window
    socket.emit('private message', msg);
  });

  // Real-time notifications
  socket.on('notify', (notification) => {
    io.emit('notify', notification);
  });

  socket.on('disconnect', () => {
    // Remove user from map and online set on disconnect
    for (const [userId, sockId] of Object.entries(userSocketMap)) {
      if (sockId === socket.id) {
        delete userSocketMap[userId];
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit('online users', Array.from(onlineUsers)); // Notify all clients
    console.log('User disconnected:', socket.id);
  });
});

sequelize.sync({ alter: true }).then(() => {
  console.log('MySQL tables synced');
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('MySQL connection error:', err);
});

module.exports = { io }; 