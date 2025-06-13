import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { couponService, Coupon } from '../../services/apiServices';

export interface CouponState {
  coupons: Coupon[];
  currentCoupon: Coupon | null;
  couponStats: any;
  validatedCoupon: any;
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const initialState: CouponState = {
  coupons: [],
  currentCoupon: null,
  couponStats: null,
  validatedCoupon: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 0
};

// Async thunks
export const fetchCoupons = createAsyncThunk(
  'coupons/fetchCoupons',
  async (params: any = {}) => {
    const response = await couponService.getAllCoupons(params);
    return response.data;
  }
);

export const fetchCouponById = createAsyncThunk(
  'coupons/fetchCouponById',
  async (id: string) => {
    const response = await couponService.getCouponById(id);
    return response.data.coupon;
  }
);

export const createCoupon = createAsyncThunk(
  'coupons/createCoupon',
  async (data: any) => {
    const response = await couponService.createCoupon(data);
    return response.data.coupon;
  }
);

export const updateCoupon = createAsyncThunk(
  'coupons/updateCoupon',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await couponService.updateCoupon(id, data);
    return response.data.coupon;
  }
);

export const deleteCoupon = createAsyncThunk(
  'coupons/deleteCoupon',
  async (id: string) => {
    await couponService.deleteCoupon(id);
    return id;
  }
);

export const validateCoupon = createAsyncThunk(
  'coupons/validateCoupon',
  async ({ code, courseId }: { code: string; courseId?: string }) => {
    const response = await couponService.validateCoupon(code, courseId);
    return response.data;
  }
);

export const fetchCouponStats = createAsyncThunk(
  'coupons/fetchCouponStats',
  async () => {
    const response = await couponService.getCouponStats();
    return response.data;
  }
);

const couponSlice = createSlice({
  name: 'coupons',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentCoupon: (state) => {
      state.currentCoupon = null;
    },
    clearValidatedCoupon: (state) => {
      state.validatedCoupon = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch coupons';
      })
      // Fetch coupon by ID
      .addCase(fetchCouponById.fulfilled, (state, action) => {
        state.currentCoupon = action.payload;
      })
      // Create coupon
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
      })
      // Update coupon
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const updatedCoupon = action.payload;
        state.coupons = state.coupons.map(coupon => 
          coupon.id === updatedCoupon.id ? updatedCoupon : coupon
        );
        if (state.currentCoupon?.id === updatedCoupon.id) {
          state.currentCoupon = updatedCoupon;
        }
      })
      // Delete coupon
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        const couponId = action.payload;
        state.coupons = state.coupons.filter(coupon => coupon.id !== couponId);
        if (state.currentCoupon?.id === couponId) {
          state.currentCoupon = null;
        }
      })
      // Validate coupon
      .addCase(validateCoupon.pending, (state) => {
        state.loading = true;
      })
      .addCase(validateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.validatedCoupon = action.payload;
      })
      .addCase(validateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to validate coupon';
        state.validatedCoupon = null;
      })
      // Fetch coupon stats
      .addCase(fetchCouponStats.fulfilled, (state, action) => {
        state.couponStats = action.payload;
      });
  }
});

export const { clearError, clearCurrentCoupon, clearValidatedCoupon } = couponSlice.actions;
export default couponSlice.reducer;