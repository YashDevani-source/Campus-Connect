module.exports = (io) => {
  io.on('connection', (socket) => {
    // console.log(`Socket connected: ${socket.id}`);

    // Join user's own room for notifications
    socket.on('setup', (userData) => {
      if (userData && userData._id) {
        socket.join(userData._id);
        socket.emit('connected');
      }
    });

    // Join a specific chat room (group, course, dm)
    socket.on('join chat', (room) => {
      socket.join(room);
      // console.log(`User joined room: ${room}`);
    });

    // Typing indicators
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    // Leave room
    socket.on('leave chat', (room) => {
      socket.leave(room);
    });

    // New message event if sent via socket directly (fallback)
    socket.on('new message', (newMessage) => {
      const chat = newMessage.chat;
      if (!chat) return;
      socket.to(chat._id).emit('message received', newMessage);
    });

    socket.on('disconnect', () => {
      // console.log('Socket disconnected');
    });
  });
};
