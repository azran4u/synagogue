import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export interface SynagogueState {
  selectedSynagogueId: string | null;
}

const initialState: SynagogueState = {
  selectedSynagogueId: null,
};

export const synagogueSlice = createSlice({
  name: "synagogue",
  initialState,
  reducers: {
    setSelectedSynagogue: (state, action: { payload: { id: string } }) => {
      const { id } = action.payload;
      state.selectedSynagogueId = id;
    },
    clearSelectedSynagogue: state => {
      state.selectedSynagogueId = null;
    },
  },
});

export const synagogueActions = synagogueSlice.actions;

export const selectSynagogue = (state: RootState) => state.synagogue;

export const selectSelectedSynagogueId = createSelector(
  selectSynagogue,
  state => state.selectedSynagogueId
);

export default synagogueSlice.reducer;
