// src/redux/slices/courseSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setMessage } from './uiSlice';
import courseService from '../../services/courseService';

// Types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  teacherId: string;
  teacherName?: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  categoryId?: string;
  studentsCount?: number;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseState {
  courses: Course[];
  enrolledCourses: Course[];
  teachingCourses: Course[];
  currentCourse: Course | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: CourseState = {
  courses: [],
  enrolledCourses: [],
  teachingCourses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params: { 
    page?: number; 
    limit?: number; 
    category?: string; 
    level?: string; 
    search?: string;
  } = {}, { dispatch, rejectWithValue }) => {
    try {
      const data = await courseService.getCourses(params);
      return data.courses;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch courses';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await courseService.getCourseById(courseId);
      return data.course;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch course';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchEnrolledCourses = createAsyncThunk(
  'courses/fetchEnrolledCourses',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await courseService.getEnrolledCourses();
      return data.courses;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch enrolled courses';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchTeachingCourses = createAsyncThunk(
  'courses/fetchTeachingCourses',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await courseService.getTeachingCourses();
      return data.courses;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch teaching courses';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (courseData: Partial<Course>, { dispatch, rejectWithValue }) => {
    try {
      const data = await courseService.createCourse(courseData);
      dispatch(setMessage({ type: 'success', text: 'Course created successfully' }));
      return data.course;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to create course';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ 
    courseId, 
    courseData 
  }: { 
    courseId: string; 
    courseData: Partial<Course> 
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await courseService.updateCourse(courseId, courseData);
      dispatch(setMessage({ type: 'success', text: 'Course updated successfully' }));
      return data.course;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update course';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const enrollInCourse = createAsyncThunk(
  'courses/enrollInCourse',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await courseService.enrollInCourse(courseId);
      dispatch(setMessage({ type: 'success', text: 'Enrolled in course successfully' }));
      return data.enrollment;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to enroll in course';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

// Course slice
const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.courses = action.payload;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch course by id
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch enrolled courses
      .addCase(fetchEnrolledCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrolledCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.enrolledCourses = action.payload;
      })
      .addCase(fetchEnrolledCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch teaching courses
      .addCase(fetchTeachingCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachingCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.loading = false;
        state.teachingCourses = action.payload;
      })
      .addCase(fetchTeachingCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.teachingCourses.push(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update course
      .addCase(updateCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCourse.fulfilled, (state, action: PayloadAction<Course>) => {
        state.loading = false;
        state.currentCourse = action.payload;
        
        // Update in teaching courses array
        const index = state.teachingCourses.findIndex(course => course.id === action.payload.id);
        if (index !== -1) {
          state.teachingCourses[index] = action.payload;
        }
      })
      .addCase(updateCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Enroll in course
      .addCase(enrollInCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInCourse.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        
        // If we have the current course, add it to enrolled courses
        if (state.currentCourse) {
          state.enrolledCourses.push(state.currentCourse);
        }
      })
      .addCase(enrollInCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentCourse, clearError } = courseSlice.actions;
export default courseSlice.reducer;