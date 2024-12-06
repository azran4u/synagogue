import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

// A custom theme for this app
export const theme = createTheme({
  cssVariables: true,
  direction: "rtl",
  palette: {
    primary: {
      main: "#ab7a5f",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: "#e84242",
    },
  },
});

export const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
