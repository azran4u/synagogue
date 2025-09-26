import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { Synagogue, SynagogueDto } from "../model/Synagogue";

export const SELECTED_SYNAGOGUE_ID_KEY = "selectedSynagogueId";

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
      localStorage.setItem(SELECTED_SYNAGOGUE_ID_KEY, id);
      console.log("setSelectedSynagogue", id);
    },
    clearSelectedSynagogue: state => {
      state.selectedSynagogueId = null;
      localStorage.removeItem(SELECTED_SYNAGOGUE_ID_KEY);
      console.log("clearSelectedSynagogue");
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
