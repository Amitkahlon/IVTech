import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

interface QuestionsState {
  searchQuery: string;
}

const initialState: QuestionsState = {
  searchQuery: '',
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
});

export const { setSearchQuery } = questionsSlice.actions;
export const questionsReducer = questionsSlice.reducer;

export const selectSearchQuery = (state: RootState) => state.questions.searchQuery;
