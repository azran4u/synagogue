import { createTheme } from "@mui/material/styles";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

// A custom theme for this app
export const theme = createTheme({
  cssVariables: true,
  direction: "rtl",
  palette: {
    primary: {
      main: "#9da832",
    },
    secondary: {
      main: "#328ba8",
    },
    error: {
      main: "#e84242",
    },
  },
  typography: {
    fontFamily: "sans-serif",
  },
});

export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
