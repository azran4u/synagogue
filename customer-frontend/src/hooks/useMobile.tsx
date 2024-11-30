import useMediaQuery from "@mui/material/useMediaQuery";
import { theme } from "../theme";

export function useMobile() {
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  return isMobile;
}
