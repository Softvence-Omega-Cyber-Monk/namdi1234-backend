import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import chatService from './chat.service';

interface SocketUser {
    userId: string;
    socketId: string;
}

class SocketService {
    private io: Server;
    private connectedUsers: Map<string, string> = new Map(); // userId -> socketId

    constructor() {
        this.io = null as any;
    }

    /**
     * Initialize Socket.IO server
     */
    initialize(httpServer: HTTPServer) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                credentials: true,
            },
        });

        this.io.on('connection', (socket: Socket) => {
            console.log('User connected:', socket.id);

            // Handle user authentication
            socket.on('authenticate', (userId: string) => {
                this.connectedUsers.set(userId, socket.id);
                console.log(`User ${userId} authenticated with socket ${socket.id}`);
            });

            // Join a conversation room
            socket.on('join-conversation', (conversationId: string) => {
                socket.join(conversationId);
                console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
            });

            // Leave a conversation room
            socket.on('leave-conversation', (conversationId: string) => {
                socket.leave(conversationId);
                console.log(`Socket ${socket.id} left conversation ${conversationId}`);
            });

            // Send a message
            socket.on('send-message', async (data) => {
                try {
                    const { conversationId, senderId, senderType, message } = data;

                    // Save message to database
                    const conversation = await chatService.sendMessage({
                        conversationId,
                        senderId,
                        senderType,
                        message,
                    });

                    // Get the last message
                    const lastMessage = conversation.messages[conversation.messages.length - 1];

                    // Emit message to all users in the conversation room
                    this.io.to(conversationId).emit('new-message', {
                        conversationId,
                        message: lastMessage,
                        conversation: {
                            lastMessage: conversation.lastMessage,
                            lastMessageTime: conversation.lastMessageTime,
                            unreadCount: conversation.unreadCount,
                        },
                    });

                    // Notify the receiver if they're online but not in the conversation room
                    const receiverId =
                        senderType === 'CUSTOMER'
                            ? conversation.vendorId.toString()
                            : conversation.customerId.toString();

                    const receiverSocketId = this.connectedUsers.get(receiverId);
                    if (receiverSocketId) {
                        this.io.to(receiverSocketId).emit('new-conversation-message', {
                            conversationId,
                            message: lastMessage,
                            unreadCount:
                                senderType === 'CUSTOMER'
                                    ? conversation.unreadCount.vendor
                                    : conversation.unreadCount.customer,
                        });
                    }
                } catch (error) {
                    console.error('Socket send-message error:', error);
                    socket.emit('message-error', {
                        error: (error as Error).message,
                    });
                }
            });

            // Typing indicator
            socket.on('typing', (data) => {
                const { conversationId, userId, isTyping } = data;
                socket.to(conversationId).emit('user-typing', {
                    conversationId,
                    userId,
                    isTyping,
                });
            });

            // Mark messages as read
            socket.on('mark-as-read', async (data) => {
                try {
                    const { conversationId, userType } = data;

                    const conversation = await chatService.markMessagesAsRead(
                        conversationId,
                        userType
                    );

                    // Notify all users in the conversation
                    this.io.to(conversationId).emit('messages-read', {
                        conversationId,
                        userType,
                        unreadCount: conversation.unreadCount,
                    });
                } catch (error) {
                    console.error('Socket mark-as-read error:', error);
                }
            });

            // Handle disconnect
            socket.on('disconnect', () => {
                // Remove user from connected users
                for (const [userId, socketId] of this.connectedUsers.entries()) {
                    if (socketId === socket.id) {
                        this.connectedUsers.delete(userId);
                        console.log(`User ${userId} disconnected`);
                        break;
                    }
                }
                console.log('User disconnected:', socket.id);
            });
        });

        return this.io;
    }

    /**
     * Get Socket.IO instance
     */
    getIO(): Server {
        if (!this.io) {
            throw new Error('Socket.IO not initialized');
        }
        return this.io;
    }

    /**
     * Emit event to a specific user
     */
    emitToUser(userId: string, event: string, data: any) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }

    /**
     * Emit event to a conversation room
     */
    emitToConversation(conversationId: string, event: string, data: any) {
        this.io.to(conversationId).emit(event, data);
    }

    /**
     * Check if user is online
     */
    isUserOnline(userId: string): boolean {
        return this.connectedUsers.has(userId);
    }

    /**
     * Get all connected users
     */
    getConnectedUsers(): string[] {
        return Array.from(this.connectedUsers.keys());
    }
}

export default new SocketService();