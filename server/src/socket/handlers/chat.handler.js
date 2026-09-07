import logger from '../../configs/logger.js';

const getRoomId = value => value?.toString();

const getChatRoomIds = (senderId, receiverId) => {
  return [
    `chat_${senderId}_${receiverId}`,
    `chat_${receiverId}_${senderId}`,
  ];
};

const emitToChatRooms = (socket, senderId, receiverId, eventName, payload) => {
  for (const roomId of getChatRoomIds(senderId, receiverId)) {
    socket.to(roomId).emit(eventName, payload);
  }
};

const emitReadState = (io, senderId, receiverId, payload) => {
  for (const roomId of getChatRoomIds(senderId, receiverId)) {
    io.to(roomId).emit('message_read', payload);
  }

  io.to(getRoomId(receiverId)).emit('message_read', payload);
  io.to(getRoomId(senderId)).emit('message_read', payload);
};

export const registerChatHandlers = (io, socket) => {
  // Join Room
  socket.on('join_room', roomId => {
    try {
      if (!roomId) return;

      const roomIdStr = getRoomId(roomId);
      socket.join(roomIdStr);
      logger.info(`User ${socket.id} joined room: ${roomIdStr}`);

      // If generic room join, check if it's user room or something else?
      // Legacy logic preserved:
      if (!roomId.includes(':') && roomIdStr === socket.user?.id) {
        // Already handled in register_user usually, but okay
      }

      socket.emit('room_joined', { roomId: roomIdStr, success: true });
    } catch (error) {
      logger.error('Error joining room:', error);
      socket.emit('error', {
        message: 'Failed to join room',
        error: error.message,
      });
    }
  });

  // Leave Room
  socket.on('leave_room', roomId => {
    try {
      if (!roomId) return;
      const roomIdStr = getRoomId(roomId);
      socket.leave(roomIdStr);
      logger.info(`User ${socket.id} left room: ${roomIdStr}`);
      socket.emit('room_left', { roomId: roomIdStr, success: true });
    } catch (error) {
      logger.error('Error leaving room:', error);
    }
  });

  // Send Message (Incoming from Client)
  socket.on('send_message', data => {
    // Note: Usually messages are sent via API (POST /messages) and then emitted via SocketService.
    // However, if client sends via socket directly:
    logger.info('Socket received direct message (legacy/chat-only):', data);

    if (!data.message || !data.receiverId || !data.senderId) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }

    const { message, receiverId, senderId } = data;
    const receiverIdStr = getRoomId(receiverId);
    const senderIdStr = getRoomId(senderId);

    // Emitting to receiver
    socket.to(receiverIdStr).emit('new_message', message);

    // Sync to other sender devices
    if (senderIdStr !== socket.id) {
      socket.to(senderIdStr).emit('new_message', message);
    }

    emitToChatRooms(socket, senderIdStr, receiverIdStr, 'new_message', message);

    socket.emit('message_sent', {
      success: true,
      messageId: message._id,
      timestamp: new Date(),
    });
  });

  // Mark as Read
  socket.on('mark_as_read', data => {
    // Similar to send_message, usually done via API.
    // logic ...
    if (!data.messageIds) return;

    if (data.receiverId && data.senderId) {
      emitReadState(io, data.senderId, data.receiverId, data);
    }
    socket.emit('read_confirmed', {
      success: true,
      messageIds: data.messageIds,
    });
  });

  // Typing - support both event names for compatibility
  const registerTypingEvent = (eventName, targetEvent) => {
    socket.on(eventName, data => {
      if (!data.senderId || !data.receiverId) {
        return;
      }

      socket.to(getRoomId(data.receiverId)).emit(targetEvent, data);
      emitToChatRooms(socket, data.senderId, data.receiverId, targetEvent, data);
    });
  };

  registerTypingEvent('typing', 'user_typing');
  registerTypingEvent('user_typing', 'user_typing');
  registerTypingEvent('stop_typing', 'user_stop_typing');
  registerTypingEvent('user_stop_typing', 'user_stop_typing');
};
