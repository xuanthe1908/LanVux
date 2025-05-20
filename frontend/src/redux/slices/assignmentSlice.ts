// src/redux/slices/assignmentSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { setMessage } from './uiSlice';
// Update the import path below to the correct relative path if needed
import assignmentService from '../../services/assignmentService';

// Types
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate?: string;
  maxPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  submissionUrl?: string;
  submissionText?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  userName?: string;
}

interface AssignmentState {
  assignments: Assignment[];
  studentAssignments: Assignment[];
  currentAssignment: Assignment | null;
  submissions: AssignmentSubmission[];
  currentSubmission: AssignmentSubmission | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AssignmentState = {
  assignments: [],
  studentAssignments: [],
  currentAssignment: null,
  submissions: [],
  currentSubmission: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchAssignmentsByCourse = createAsyncThunk(
  'assignments/fetchAssignmentsByCourse',
  async (courseId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await assignmentService.getAssignmentsByCourse(courseId);
      return data.assignments;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch assignments';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchStudentAssignments = createAsyncThunk(
  'assignments/fetchStudentAssignments',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const data = await assignmentService.getStudentAssignments();
      return data.assignments;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch student assignments';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchAssignmentById = createAsyncThunk(
  'assignments/fetchAssignmentById',
  async (assignmentId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await assignmentService.getAssignmentById(assignmentId);
      return data.assignment;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch assignment';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const createAssignment = createAsyncThunk(
  'assignments/createAssignment',
  async ({ 
    courseId, 
    assignmentData 
  }: { 
    courseId: string; 
    assignmentData: Partial<Assignment> 
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await assignmentService.createAssignment(courseId, assignmentData);
      dispatch(setMessage({ type: 'success', text: 'Assignment created successfully' }));
      return data.assignment;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to create assignment';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const updateAssignment = createAsyncThunk(
  'assignments/updateAssignment',
  async ({ 
    assignmentId, 
    assignmentData 
  }: { 
    assignmentId: string; 
    assignmentData: Partial<Assignment> 
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await assignmentService.updateAssignment(assignmentId, assignmentData);
      dispatch(setMessage({ type: 'success', text: 'Assignment updated successfully' }));
      return data.assignment;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update assignment';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const deleteAssignment = createAsyncThunk(
  'assignments/deleteAssignment',
  async (assignmentId: string, { dispatch, rejectWithValue }) => {
    try {
      await assignmentService.deleteAssignment(assignmentId);
      dispatch(setMessage({ type: 'success', text: 'Assignment deleted successfully' }));
      return assignmentId;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to delete assignment';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const submitAssignment = createAsyncThunk(
  'assignments/submitAssignment',
  async ({ 
    assignmentId, 
    submissionData 
  }: { 
    assignmentId: string; 
    submissionData: { submissionText?: string; submissionUrl?: string } 
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await assignmentService.submitAssignment(assignmentId, submissionData);
      dispatch(setMessage({ type: 'success', text: 'Assignment submitted successfully' }));
      return data.submission;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to submit assignment';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const fetchSubmissionsByAssignment = createAsyncThunk(
  'assignments/fetchSubmissionsByAssignment',
  async (assignmentId: string, { dispatch, rejectWithValue }) => {
    try {
      const data = await assignmentService.getSubmissionsByAssignment(assignmentId);
      return data.submissions;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to fetch submissions';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

export const gradeSubmission = createAsyncThunk(
  'assignments/gradeSubmission',
  async ({ 
    submissionId, 
    gradeData 
  }: { 
    submissionId: string; 
    gradeData: { grade: number; feedback?: string } 
  }, { dispatch, rejectWithValue }) => {
    try {
      const data = await assignmentService.gradeSubmission(submissionId, gradeData);
      dispatch(setMessage({ type: 'success', text: 'Submission graded successfully' }));
      return data.submission;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to grade submission';
      dispatch(setMessage({ type: 'error', text: message }));
      return rejectWithValue(message);
    }
  }
);

// Assignment slice
const assignmentSlice = createSlice({
  name: 'assignments',
  initialState,
  reducers: {
    clearCurrentAssignment: (state) => {
      state.currentAssignment = null;
    },
    clearCurrentSubmission: (state) => {
      state.currentSubmission = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentAssignment: (state, action: PayloadAction<Assignment>) => {
      state.currentAssignment = action.payload;
    },
    setCurrentSubmission: (state, action: PayloadAction<AssignmentSubmission>) => {
      state.currentSubmission = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch assignments by course
      .addCase(fetchAssignmentsByCourse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentsByCourse.fulfilled, (state, action: PayloadAction<Assignment[]>) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignmentsByCourse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch student assignments
      .addCase(fetchStudentAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentAssignments.fulfilled, (state, action: PayloadAction<Assignment[]>) => {
        state.loading = false;
        state.studentAssignments = action.payload;
      })
      .addCase(fetchStudentAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch assignment by id
      .addCase(fetchAssignmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssignmentById.fulfilled, (state, action: PayloadAction<Assignment>) => {
        state.loading = false;
        state.currentAssignment = action.payload;
      })
      .addCase(fetchAssignmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create assignment
      .addCase(createAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAssignment.fulfilled, (state, action: PayloadAction<Assignment>) => {
        state.loading = false;
        state.assignments.push(action.payload);
      })
      .addCase(createAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update assignment
      .addCase(updateAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssignment.fulfilled, (state, action: PayloadAction<Assignment>) => {
        state.loading = false;
        state.currentAssignment = action.payload;
        
        // Update in assignments array
        const index = state.assignments.findIndex(assignment => assignment.id === action.payload.id);
        if (index !== -1) {
          state.assignments[index] = action.payload;
        }
      })
      .addCase(updateAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete assignment
      .addCase(deleteAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssignment.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.assignments = state.assignments.filter(assignment => assignment.id !== action.payload);
        if (state.currentAssignment && state.currentAssignment.id === action.payload) {
          state.currentAssignment = null;
        }
      })
      .addCase(deleteAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Submit assignment
      .addCase(submitAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitAssignment.fulfilled, (state, action: PayloadAction<AssignmentSubmission>) => {
        state.loading = false;
        state.currentSubmission = action.payload;
      })
      .addCase(submitAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch submissions by assignment
      .addCase(fetchSubmissionsByAssignment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissionsByAssignment.fulfilled, (state, action: PayloadAction<AssignmentSubmission[]>) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissionsByAssignment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Grade submission
      .addCase(gradeSubmission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(gradeSubmission.fulfilled, (state, action: PayloadAction<AssignmentSubmission>) => {
        state.loading = false;
        state.currentSubmission = action.payload;
        
        // Update in submissions array
        const index = state.submissions.findIndex(submission => submission.id === action.payload.id);
        if (index !== -1) {
          state.submissions[index] = action.payload;
        }
      })
      .addCase(gradeSubmission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearCurrentAssignment, 
  clearCurrentSubmission, 
  clearError,
  setCurrentAssignment,
  setCurrentSubmission 
} = assignmentSlice.actions;

export default assignmentSlice.reducer;