import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CourseState {
  courses: any[];
}

const initialState: CourseState = {
  courses: [],
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses(state, action: PayloadAction<any[]>) {
      state.courses = action.payload;
    },
    addCourse(state, action: PayloadAction<any>) {
      state.courses.push(action.payload);
    },
  },
});

export const { setCourses, addCourse } = courseSlice.actions;
export default courseSlice.reducer;