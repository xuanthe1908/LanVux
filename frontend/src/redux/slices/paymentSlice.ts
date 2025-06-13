import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentService, Payment } from '../../services/apiServices';

export interface PaymentState {
  payments: Payment[];
  currentPayment: Payment | null;
  paymentStats: any;
  paymentMethods: any[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const initialState: PaymentState = {
  payments: [],
  currentPayment: null,
  paymentStats: null,
  paymentMethods: [],
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 0
};

// Async thunks
export const fetchPayments = createAsyncThunk(
  'payments/fetchPayments',
  async (params: any = {}) => {
    const response = await paymentService.getAllPayments(params);
    return response.data;
  }
);

export const fetchPaymentById = createAsyncThunk(
  'payments/fetchPaymentById',
  async (id: string) => {
    const response = await paymentService.getPaymentById(id);
    return response.data.payment;
  }
);

export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (data: any) => {
    const response = await paymentService.createPayment(data);
    return response.data;
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'payments/fetchPaymentStats',
  async () => {
    const response = await paymentService.getPaymentStats();
    return response.data;
  }
);

export const fetchPaymentMethods = createAsyncThunk(
  'payments/fetchPaymentMethods',
  async () => {
    const response = await paymentService.getPaymentMethods();
    return response.data;
  }
);

const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch payments';
      })
      // Fetch payment by ID
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.currentPayment = action.payload;
      })
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Handle payment creation response (might include redirect URL)
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create payment';
      })
      // Fetch payment stats
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.paymentStats = action.payload;
      })
      // Fetch payment methods
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.paymentMethods = action.payload.methods;
      });
  }
});

export const { clearError, clearCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;