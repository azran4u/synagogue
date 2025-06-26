import useMediaQuery from "@mui/material/useMediaQuery";
import { theme } from "../theme";

export function useMobile() {
  return useMediaQuery(theme.breakpoints.down("md"));
}
