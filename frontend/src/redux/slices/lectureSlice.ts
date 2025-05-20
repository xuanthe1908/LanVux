// src/redux/slices/lectureSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setMessage } from './uiSlice';
import lectureService from '../../services/lectureService';

// Types
export interface Lecture {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  contentType: 'video' | 'document' | 'quiz';
  contentUrl?: string;
  orderIndex: number;
  duration?: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LectureProgress {
  id: string;
  lectureId: string;
  isCompleted: boolean;
  progressSeconds: number;
  lastAccessedAt: string;
}

interface LectureState {
  lectures: Lecture[];
  currentLecture: Lecture | null;
  lectureProgress: LectureProgress[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: LectureState = {
  lectures: [],
  currentLecture: null,
  lectureProgress: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchLecturesByCourse = createAsyncThunk(
  'lectures/fetchLecturesByCourse',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await lectureService.getLecturesByCourse(courseId);
      return data.lectures;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch lectures';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchLectureById = createAsyncThunk(
  'lectures/fetchLectureById',
  async (lectureId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await lectureService.getLectureById(lectureId);
      return data.lecture;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch lecture';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const createLecture = createAsyncThunk(
  'lectures/createLecture',
  async ({ 
    courseId, 
    lectureData 
  }: { 
    courseId: string; 
    lectureData: Partial<Lecture> 
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await lectureService.createLecture(courseId, lectureData);
      dispatch(setMessage({ type: 'success', text: 'Lecture created successfully' }));
      return data.lecture;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to create lecture';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const updateLecture = createAsyncThunk(
  'lectures/updateLecture',
  async ({ 
    lectureId, 
    lectureData 
  }: { 
    lectureId: string; 
    lectureData: Partial<Lecture> 
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await lectureService.updateLecture(lectureId, lectureData);
      dispatch(setMessage({ type: 'success', text: 'Lecture updated successfully' }));
      return data.lecture;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update lecture';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const deleteLecture = createAsyncThunk(
  'lectures/deleteLecture',
  async (lectureId: string, { dispatch, rejectWithValue }) => {
    try {
      await lectureService.deleteLecture(lectureId);
      dispatch(setMessage({ type: 'success', text: 'Lecture deleted successfully' }));
      return lectureId;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to delete lecture';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const updateLectureProgress = createAsyncThunk(
  'lectures/updateLectureProgress',
  async ({ 
    lectureId, 
    progressData 
  }: { 
    lectureId: string; 
    progressData: { progressSeconds: number; isCompleted?: boolean } 
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await lectureService.updateLectureProgress(lectureId, progressData);
      return data.progress;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update lecture progress';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchLectureProgress = createAsyncThunk(
  'lectures/fetchLectureProgress',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await lectureService.getLectureProgressByCourse(courseId);
      return data.progress;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch lecture progress';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

// Lecture slice
const lectureSlice = createSlice({
  name: 'lectures',
  initialState,
  reducers: {
    clearCurrentLecture: (state) => {
      state.currentLecture = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentLecture: (state, action: PayloadAction<Lecture>) => {
      state.currentLecture = action.payload;
    },
    reorderLectures: (state, action: PayloadAction<{ sourceIndex: number; destinationIndex: number }>) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const [removed] = state.lectures.splice(sourceIndex, 1);
      state.lectures.splice(destinationIndex, 0, removed);
      
      // Update the orderIndex property for all lectures
      state.lectures = state.lectures.map((lecture, index) => ({
        ...lecture,
        orderIndex: index
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch lectures by course
      .addCase(fetchLecturesByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLecturesByCourse.fulfilled, (state, action: PayloadAction<Lecture[]>) => {
        state.loading = false;
        state.lectures = action.payload;
      })
      .addCase(fetchLecturesByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch lecture by id
      .addCase(fetchLectureById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLectureById.fulfilled, (state, action: PayloadAction<Lecture>) => {
        state.loading = false;
        state.currentLecture = action.payload;
      })
      .addCase(fetchLectureById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create lecture
      .addCase(createLecture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLecture.fulfilled, (state, action: PayloadAction<Lecture>) => {
        state.loading = false;
        state.lectures.push(action.payload);
      })
      .addCase(createLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update lecture
      .addCase(updateLecture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLecture.fulfilled, (state, action: PayloadAction<Lecture>) => {
        state.loading = false;
        state.currentLecture = action.payload;
        
        // Update in lectures array
        const index = state.lectures.findIndex(lecture => lecture.id === action.payload.id);
        if (index !== -1) {
          state.lectures[index] = action.payload;
        }
      })
      .addCase(updateLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete lecture
      .addCase(deleteLecture.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLecture.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.lectures = state.lectures.filter(lecture => lecture.id !== action.payload);
        if (state.currentLecture && state.currentLecture.id === action.payload) {
          state.currentLecture = null;
        }
      })
      .addCase(deleteLecture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update lecture progress
      .addCase(updateLectureProgress.fulfilled, (state, action: PayloadAction<LectureProgress>) => {
        const index = state.lectureProgress.findIndex(
          progress => progress.lectureId === action.payload.lectureId
        );
        
        if (index !== -1) {
          state.lectureProgress[index] = action.payload;
        } else {
          state.lectureProgress.push(action.payload);
        }
      })
      
      // Fetch lecture progress
      .addCase(fetchLectureProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLectureProgress.fulfilled, (state, action: PayloadAction<LectureProgress[]>) => {
        state.loading = false;
        state.lectureProgress = action.payload;
      })
      .addCase(fetchLectureProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearCurrentLecture, 
  clearError, 
  setCurrentLecture,
  reorderLectures 
} = lectureSlice.actions;

export default lectureSlice.reducer;