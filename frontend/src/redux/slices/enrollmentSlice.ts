import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { enrollmentService, Enrollment } from '../../services/apiServices';

export interface EnrollmentState {
  enrollments: Enrollment[];
  currentEnrollment: Enrollment | null;
  enrollmentStats: any;
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

const initialState: EnrollmentState = {
  enrollments: [],
  currentEnrollment: null,
  enrollmentStats: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 0
};

// Async thunks
export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchEnrollments',
  async (params: any = {}) => {
    const response = await enrollmentService.getAllEnrollments(params);
    return response.data;
  }
);

export const enrollInCourse = createAsyncThunk(
  'enrollments/enrollInCourse',
  async (courseId: string) => {
    const response = await enrollmentService.enrollInCourse(courseId);
    return response.data.enrollment;
  }
);

export const unenrollFromCourse = createAsyncThunk(
  'enrollments/unenrollFromCourse',
  async (enrollmentId: string) => {
    await enrollmentService.unenrollFromCourse(enrollmentId);
    return enrollmentId;
  }
);

export const fetchEnrollmentStats = createAsyncThunk(
  'enrollments/fetchEnrollmentStats',
  async () => {
    const response = await enrollmentService.getEnrollmentStats();
    return response.data;
  }
);

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEnrollment: (state) => {
      state.currentEnrollment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch enrollments
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload.enrollments;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch enrollments';
      })
      // Enroll in course
      .addCase(enrollInCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(enrollInCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments.unshift(action.payload);
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to enroll in course';
      })
      // Unenroll from course
      .addCase(unenrollFromCourse.fulfilled, (state, action) => {
        const enrollmentId = action.payload;
        state.enrollments = state.enrollments.filter(enrollment => enrollment.id !== enrollmentId);
      })
      // Fetch enrollment stats
      .addCase(fetchEnrollmentStats.fulfilled, (state, action) => {
        state.enrollmentStats = action.payload;
      });
  }
});

export const { clearError, clearCurrentEnrollment } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;