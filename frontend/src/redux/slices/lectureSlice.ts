import { createSlice } from '@reduxjs/toolkit';

interface LectureState {
  lectures: any[];
}

const initialState: LectureState = {
  lectures: [],
};

const lectureSlice = createSlice({
  name: 'lectures',
  initialState,
  reducers: {
    setLectures(state, action) {
      state.lectures = action.payload;
    },
  },
});

export const { setLectures } = lectureSlice.actions;
export default lectureSlice.reducer;