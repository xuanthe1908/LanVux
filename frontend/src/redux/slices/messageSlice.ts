import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessageState {
  messages: string[];
}

const initialState: MessageState = {
  messages: [],
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<string>) {
      state.messages.push(action.payload);
    },
    clearMessages(state) {
      state.messages = [];
    },
  },
});

export const { addMessage, clearMessages } = messageSlice.actions;
export default messageSlice.reducer;