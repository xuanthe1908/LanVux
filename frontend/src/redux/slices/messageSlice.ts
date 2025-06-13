import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageService, Message } from '../../services/apiServices';

export interface MessageState {
  messages: Message[];
  currentMessage: Message | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  unreadCount: number;
  currentPage: number;
  totalPages: number;
}

const initialState: MessageState = {
  messages: [],
  currentMessage: null,
  loading: false,
  error: null,
  totalCount: 0,
  unreadCount: 0,
  currentPage: 1,
  totalPages: 0
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (params: any = {}) => {
    const response = await messageService.getAllMessages(params);
    return response.data;
  }
);

export const fetchMessageById = createAsyncThunk(
  'messages/fetchMessageById',
  async (id: string) => {
    const response = await messageService.getMessageById(id);
    return response.data.message;
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (data: any) => {
    const response = await messageService.sendMessage(data);
    return response.data.message;
  }
);

export const markAsRead = createAsyncThunk(
  'messages/markAsRead',
  async (id: string) => {
    await messageService.markAsRead(id);
    return id;
  }
);

export const replyToMessage = createAsyncThunk(
  'messages/replyToMessage',
  async ({ id, content }: { id: string; content: string }) => {
    const response = await messageService.replyToMessage(id, { content });
    return response.data.message;
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMessage: (state) => {
      state.currentMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.totalCount = action.payload.totalCount;
        state.unreadCount = action.payload.unreadCount || 0;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      // Fetch message by ID
      .addCase(fetchMessageById.fulfilled, (state, action) => {
        state.currentMessage = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.unshift(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send message';
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const messageId = action.payload;
        state.messages = state.messages.map(message => 
          message.id === messageId ? { ...message, isRead: true } : message
        );
        if (state.currentMessage?.id === messageId) {
          state.currentMessage.isRead = true;
        }
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      // Reply to message
      .addCase(replyToMessage.fulfilled, (state, action) => {
        state.messages.unshift(action.payload);
      });
  }
});

export const { clearError, clearCurrentMessage } = messageSlice.actions;
export default messageSlice.reducer;