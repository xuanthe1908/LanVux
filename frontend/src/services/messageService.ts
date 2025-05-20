// src/services/messageService.ts
import api from './api';

/**
 * Service for message-related API calls
 */
const messageService = {
  /**
   * Get all messages for current user
   * @returns List of messages
   */
  async getMessages() {
    const response = await api.get('/messages');
    return response.data.data;
  },

  /**
   * Get conversations for current user
   * @returns List of conversations
   */
  async getConversations() {
    const response = await api.get('/messages/conversations');
    return response.data.data;
  },

  /**
   * Get messages for a specific conversation
   * @param userId - User ID of conversation partner
   * @returns Conversation messages
   */
  async getConversationMessages(userId: string) {
    const response = await api.get(`/messages/conversations/${userId}`);
    return response.data.data;
  },

  /**
   * Send a message
   * @param messageData - Message data
   * @returns Sent message
   */
  async sendMessage(messageData: {
    recipientId: string;
    subject: string;
    content: string;
    courseId?: string;
  }) {
    const response = await api.post('/messages', messageData);
    return response.data.data;
  },

  /**
   * Mark a message as read
   * @param messageId - Message ID
   * @returns Updated message
   */
  async markMessageAsRead(messageId: string) {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data.data;
  },

  /**
   * Get unread message count
   * @returns Unread message count
   */
  async getUnreadCount() {
    const response = await api.get('/messages/unread/count');
    return response.data.data;
  }
};

export default messageService;