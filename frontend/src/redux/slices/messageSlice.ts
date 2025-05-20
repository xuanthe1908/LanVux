// src/redux/slices/messageSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setMessage as setUiMessage } from './uiSlice';
import messageService from '../../services/messageService';


// Types
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  courseId?: string;
  subject: string;
  content: string;
  createdAt: string;
  readAt?: string;
  senderName?: string;
  recipientName?: string;
  courseName?: string;
}

interface Conversation {
  userId: string;
  userName: string;
  latestMessage?: Message;
  unreadCount: number;
}

interface MessageState {
  messages: Message[];
  conversations: Conversation[];
  currentConversation: {
    userId: string;
    userName: string;
    messages: Message[];
  } | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: MessageState = {
  messages: [],
  conversations: [],
  currentConversation: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await messageService.getMessages();
      return data.messages;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch messages';
      dispatch(setUiMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await messageService.getConversations();
      return data.conversations;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch conversations';
      dispatch(setUiMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchConversationMessages = createAsyncThunk(
  'messages/fetchConversationMessages',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await messageService.getConversationMessages(userId);
      return {
        userId,
        userName: data.userName,
        messages: data.messages
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch conversation messages';
      dispatch(setUiMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (messageData: {
    recipientId: string;
    subject: string;
    content: string;
    courseId?: string;
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await messageService.sendMessage(messageData);
      dispatch(setUiMessage({ type: 'success', text: 'Message sent successfully' }));
      return data.message;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to send message';
      dispatch(setUiMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead',
  async (messageId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await messageService.markMessageAsRead(messageId);
      return data.message;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to mark message as read';
      dispatch(setUiMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

// Message slice
const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<Conversation[]>) => {
        state.loading = false;
        state.conversations = action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch conversation messages
      .addCase(fetchConversationMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversationMessages.fulfilled, (state, action: PayloadAction<{
        userId: string;
        userName: string;
        messages: Message[];
      }>) => {
        state.loading = false;
        state.currentConversation = action.payload;
        
        // Update unread count in conversations
        const conversationIndex = state.conversations.findIndex(
          conversation => conversation.userId === action.payload.userId
        );
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].unreadCount = 0;
        }
      })
      .addCase(fetchConversationMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.loading = false;
        
        // Add to messages array
        state.messages.push(action.payload);
        
        // Add to current conversation if it matches
        if (state.currentConversation && 
            state.currentConversation.userId === action.payload.recipientId) {
          state.currentConversation.messages.push(action.payload);
        }
        
        // Update conversation list
        const conversationIndex = state.conversations.findIndex(
          conversation => conversation.userId === action.payload.recipientId
        );
        
        if (conversationIndex !== -1) {
          state.conversations[conversationIndex].latestMessage = action.payload;
        } else {
          // Add new conversation
          state.conversations.push({
            userId: action.payload.recipientId,
            userName: action.payload.recipientName || 'User',
            latestMessage: action.payload,
            unreadCount: 0
          });
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Mark message as read
      .addCase(markMessageAsRead.fulfilled, (state, action: PayloadAction<Message>) => {
        // Update message in messages array
        const messageIndex = state.messages.findIndex(
          message => message.id === action.payload.id
        );
        
        if (messageIndex !== -1) {
          state.messages[messageIndex] = action.payload;
        }
        
        // Update message in current conversation
        if (state.currentConversation) {
          const conversationMessageIndex = state.currentConversation.messages.findIndex(
            message => message.id === action.payload.id
          );
          
          if (conversationMessageIndex !== -1) {
            state.currentConversation.messages[conversationMessageIndex] = action.payload;
          }
        }
        
        // Update unread count in conversation
        const conversationIndex = state.conversations.findIndex(
          conversation => conversation.userId === action.payload.senderId
        );
        
        if (conversationIndex !== -1 && state.conversations[conversationIndex].unreadCount > 0) {
          state.conversations[conversationIndex].unreadCount -= 1;
        }
      });
  },
});

export const { clearCurrentConversation, clearError } = messageSlice.actions;
export default messageSlice.reducer;