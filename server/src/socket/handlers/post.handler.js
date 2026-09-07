import logger from "../../configs/logger.js";

const getPostRoomId = (postId) => `post:${postId}`;

export const registerPostHandlers = (io, socket) => {
    const registerPostRoomEvent = (eventName, action, options = {}) => {
        socket.on(eventName, (postId) => {
            try {
                if (!postId) return;

                const roomId = getPostRoomId(postId);
                socket[action](roomId);

                if (options.logMessage) {
                    logger.info(options.logMessage(postId));
                }

                if (options.emitEvent) {
                    socket.emit(options.emitEvent, { postId, success: true });
                }
            } catch (error) {
                logger.error(options.errorMessage, error);
            }
        });
    };

    registerPostRoomEvent("post:like:listen", "join", {
        emitEvent: "post:like:listening",
        errorMessage: "Error listening to post:",
        logMessage: postId => `User ${socket.id} listening to post: ${postId}`,
    });

    registerPostRoomEvent("join_post", "join", {
        errorMessage: "Error joining post room:",
    });

    registerPostRoomEvent("leave_post", "leave", {
        errorMessage: "Error leaving post room:",
    });

    // Client emitting like (usually done via API, but for immediate feedback/optimistic UI)
    socket.on("post:like", (data) => {
        try {
            const { postId, userId, action } = data;
            if (!postId) return;
            
            const roomId = getPostRoomId(postId);
            const payload = { postId, userId, action, timestamp: new Date() };
            
            io.to(roomId).emit("post:like:update", payload);
            io.emit(`post:${postId}:like:update`, payload); // Global fallback
        } catch (error) {
             logger.error("Error handling post:like:", error);
        }
    });
}
