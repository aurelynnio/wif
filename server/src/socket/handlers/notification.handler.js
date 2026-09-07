import logger from "../../configs/logger.js";

const getSocketUserId = (userId) => userId?.toString();

const withTimestamp = (payload) => ({
  ...payload,
  timestamp: new Date(),
});

export const registerNotificationHandlers = (io, socket) => {
  // Send Notification (Direct from client - rare but supported)
  socket.on("send_notification", (data) => {
    try {
      if (!data || !data.recipient) return;
      
      const recipientStr = getSocketUserId(data.recipient);
      const payload = withTimestamp(data);

      socket.to(recipientStr).emit("notification:new", payload);
      io.emit(`user:${recipientStr}:notification`, payload); // Legacy emit
      
      socket.emit("notification_sent", { success: true, recipient: recipientStr });
    } catch (error) {
      logger.error("Error sending notification:", error);
    }
  });

  // Register for notifications
  socket.on("notification:register", (userId) => {
    try {
      if (!userId) return;
      const userIdStr = getSocketUserId(userId);
      socket.join(userIdStr);
      socket.user = { id: userIdStr }; // Ensure user attached
      logger.info(`User ${socket.id} registered for notifications: ${userIdStr}`);
      socket.emit("notification:registered", { userId: userIdStr, success: true });
    } catch (error) {
        logger.error("Notification register error", error);
    }
  });
};
