import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { CartState } from "./cartSlice";
import sidebarReducer from "./sidebarSlice";
import storage from "redux-persist/lib/storage";
import {
  createMigrate,
  MigrationManifest,
  PersistConfig,
  PersistedState,
  persistReducer,
  persistStore,
} from "redux-persist";

const migrations: MigrationManifest = {
  1: (state) => {
    const { items, orderId, checkout } = state as PersistedState & CartState;
    console.log("Migrating to version 1");
    return state;
  },
};

const cartPersistConfig: PersistConfig<CartState> = {
  key: "cart",
  version: 1,
  storage,
  whitelist: ["items", "orderId", "checkout"],
  migrate: createMigrate(migrations, { debug: true }),
};

const persistedCartReducer = persistReducer(cartPersistConfig, cartReducer);

export const store = configureStore({
  reducer: {
    cart: persistedCartReducer,
    sidebar: sidebarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["cart.items"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
