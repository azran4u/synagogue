import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import sidebarReducer from "./sidebarSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["cart.items"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
