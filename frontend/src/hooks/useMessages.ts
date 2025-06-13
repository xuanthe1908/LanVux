import { useState } from 'react';
import { messageService, Message } from '../services/apiServices';
import { useApi } from './useApi';

interface UseMessagesParams {
  page?: number;
  limit?: number;
  courseId?: string;
  unreadOnly?: boolean;
}

export const useMessages = (params: UseMessagesParams = {}) => {
  return useApi<{
    messages: Message[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
  }>(
    () => messageService.getAllMessages(params),
    [JSON.stringify(params)]
  );
};

export const useMessage = (id: string) => {
  return useApi<{ message: Message }>(
    () => messageService.getMessageById(id),
    [id]
  );
};

// Custom hook for message operations
export const useMessageOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.sendMessage(data);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.markAsRead(id);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark message as read');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const replyToMessage = async (id: string, content: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await messageService.replyToMessage(id, { content });
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reply to message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendMessage,
    markAsRead,
    replyToMessage,
    loading,
    error
  };
};