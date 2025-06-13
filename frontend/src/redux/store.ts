import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import all slice reducers
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';
import enrollmentReducer from './slices/enrollmentSlice';
import messageReducer from './slices/messageSlice';
import categoryReducer from './slices/categorySlice';
import paymentReducer from './slices/paymentSlice';
import couponReducer from './slices/couponSlice';
import uiReducer from './slices/uiSlice';

// Configure persistence
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  courses: courseReducer,
  enrollments: enrollmentReducer,
  messages: messageReducer,
  categories: categoryReducer,
  payments: paymentReducer,
  coupons: couponReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
