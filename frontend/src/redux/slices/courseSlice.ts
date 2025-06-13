import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { courseService, Course } from '../../services/apiServices';

export interface CourseState {
  courses: Course[];
  myCourses: Course[];
  currentCourse: Course | null;
  courseStats: any;
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: {
    search: string;
    category: string;
    level: string;
    minPrice: number | null;
    maxPrice: number | null;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: CourseState = {
  courses: [],
  myCourses: [],
  currentCourse: null,
  courseStats: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  filters: {
    search: '',
    category: '',
    level: '',
    minPrice: null,
    maxPrice: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  }
};

// Async thunks
export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (params: any = {}) => {
    const response = await courseService.getAllCourses(params);
    return response.data;
  }
);

export const fetchMyCourses = createAsyncThunk(
  'courses/fetchMyCourses',
  async (params: any = {}) => {
    const response = await courseService.getMyCourses(params);
    return response.data;
  }
);

export const fetchCourseById = createAsyncThunk(
  'courses/fetchCourseById',
  async (id: string) => {
    const response = await courseService.getCourseById(id);
    return response.data.course;
  }
);

export const createCourse = createAsyncThunk(
  'courses/createCourse',
  async (data: any) => {
    const response = await courseService.createCourse(data);
    return response.data.course;
  }
);

export const updateCourse = createAsyncThunk(
  'courses/updateCourse',
  async ({ id, data }: { id: string; data: any }) => {
    const response = await courseService.updateCourse(id, data);
    return response.data.course;
  }
);

export const deleteCourse = createAsyncThunk(
  'courses/deleteCourse',
  async (id: string) => {
    await courseService.deleteCourse(id);
    return id;
  }
);

export const publishCourse = createAsyncThunk(
  'courses/publishCourse',
  async (id: string) => {
    const response = await courseService.publishCourse(id);
    return response.data.course;
  }
);

export const fetchCourseStats = createAsyncThunk(
  'courses/fetchCourseStats',
  async () => {
    const response = await courseService.getCourseStats();
    return response.data;
  }
);

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<CourseState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch courses
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload.courses;
        state.totalCount = action.payload.totalCount;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch courses';
      })
      // Fetch my courses
      .addCase(fetchMyCourses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.myCourses = action.payload.courses;
      })
      .addCase(fetchMyCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch my courses';
      })
      // Fetch course by ID
      .addCase(fetchCourseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCourseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch course';
      })
      // Create course
      .addCase(createCourse.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCourse.fulfilled, (state, action) => {
        state.loading = false;
        state.courses.unshift(action.payload);
        state.myCourses.unshift(action.payload);
      })
      .addCase(createCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create course';
      })
      // Update course
      .addCase(updateCourse.fulfilled, (state, action) => {
        const updatedCourse = action.payload;
        state.courses = state.courses.map(course => 
          course.id === updatedCourse.id ? updatedCourse : course
        );
        state.myCourses = state.myCourses.map(course => 
          course.id === updatedCourse.id ? updatedCourse : course
        );
        if (state.currentCourse?.id === updatedCourse.id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Delete course
      .addCase(deleteCourse.fulfilled, (state, action) => {
        const courseId = action.payload;
        state.courses = state.courses.filter(course => course.id !== courseId);
        state.myCourses = state.myCourses.filter(course => course.id !== courseId);
        if (state.currentCourse?.id === courseId) {
          state.currentCourse = null;
        }
      })
      // Publish course
      .addCase(publishCourse.fulfilled, (state, action) => {
        const updatedCourse = action.payload;
        state.courses = state.courses.map(course => 
          course.id === updatedCourse.id ? updatedCourse : course
        );
        state.myCourses = state.myCourses.map(course => 
          course.id === updatedCourse.id ? updatedCourse : course
        );
        if (state.currentCourse?.id === updatedCourse.id) {
          state.currentCourse = updatedCourse;
        }
      })
      // Fetch course stats
      .addCase(fetchCourseStats.fulfilled, (state, action) => {
        state.courseStats = action.payload;
      });
  }
});

export const { setFilters, clearFilters, clearCurrentCourse, clearError } = courseSlice.actions;
export default courseSlice.reducer;