import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { persistor, store } from "./store/store";
import { enableMapSet } from "immer";
import { CacheProvider } from "@emotion/react";
import { cacheRtl, theme } from "./theme";
import { PersistGate } from "redux-persist/integration/react";

enableMapSet();
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </PersistGate>
        </Provider>
      </ThemeProvider>
    </CacheProvider>
  </React.StrictMode>
);
