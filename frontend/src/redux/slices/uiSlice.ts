// src/redux/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Interface for message notifications
export interface MessageState {
  type: 'success' | 'error' | 'info' | 'warning';
  text: string;
}

// UI state interface
interface UIState {
  message: MessageState | null;
  loading: boolean;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

// Initial state
const initialState: UIState = {
  message: null,
  loading: false,
  theme: 'light',
  sidebarOpen: true,
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Set notification message
    setMessage: (state, action: PayloadAction<MessageState>) => {
      state.message = action.payload;
    },
    // Clear notification message
    clearMessage: (state) => {
      state.message = null;
    },
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    // Toggle theme
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    // Set theme
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    // Toggle sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    // Set sidebar state
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const {
  setMessage,
  clearMessage,
  setLoading,
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

export default uiSlice.reducer;