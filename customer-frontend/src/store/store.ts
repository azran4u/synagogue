import { configureStore } from "@reduxjs/toolkit";
import sidebarReducer from "./sidebarSlice";
import synagogueReducer from "./synagogueSlice";

export const store = configureStore({
  reducer: {
    sidebar: sidebarReducer,
    synagogue: synagogueReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
