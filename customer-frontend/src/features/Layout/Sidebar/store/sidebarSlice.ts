import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../../shared/store/store";

export interface SidebarState {
  isOpen: boolean;
}

const initialState: SidebarState = {
  isOpen: false,
};

export const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    openSidebar: (state) => {
      state.isOpen = true;
    },
    closeSidebar: (state) => {
      state.isOpen = false;
    },
  },
});

export const sidebarActions = sidebarSlice.actions;

export const selectSidebar = (state: RootState) => state.sidebar;

export const selectSidebarIsOpen = createSelector(
  selectSidebar,
  (state) => state.isOpen
);

export default sidebarSlice.reducer;
