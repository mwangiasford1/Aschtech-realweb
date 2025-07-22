const jwt = require('jsonwebtoken');

const userSocketMap = {}; // userId → socketId
const onlineUsers = new Set();

const registerEvents = (io, socket) => {
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      if (userSocketMap[userId] && userSocketMap[userId] !== socket.id) {
        const oldSocketId = userSocketMap[userId];
        io.to(oldSocketId).emit('force logout', 'Logged in elsewhere.');
        io.sockets.sockets.get(oldSocketId)?.disconnect(true);
      }

      socket.userId = userId;
      userSocketMap[userId] = socket.id;
      onlineUsers.add(userId);
      io.emit('online users', Array.from(onlineUsers));
    } catch (err) {
      socket.emit('auth error', 'Invalid token');
      socket.disconnect();
    }
  });

  socket.on('private message', (msg) => {
    const recipientSocketId = userSocketMap[msg.to];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('private message', msg);
    }
    socket.emit('private message', msg); // loop back
  });

  socket.on('notify', (notification) => {
    io.emit('notify', notification);
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of Object.entries(userSocketMap)) {
      if (sid === socket.id) {
        delete userSocketMap[uid];
        onlineUsers.delete(uid);
        break;
      }
    }
    io.emit('online users', Array.from(onlineUsers));
    console.log('User disconnected:', socket.id);
  });
};

module.exports = registerEvents;
