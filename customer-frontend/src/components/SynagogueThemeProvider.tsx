import React, { useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { Synagogue } from "../model/Synagogue";

interface SynagogueThemeProviderProps {
  children: React.ReactNode;
}

export const SynagogueThemeProvider: React.FC<SynagogueThemeProviderProps> = ({
  children,
}) => {
  const { data: synagogue } = useSelectedSynagogue();

  const dynamicTheme = useMemo(() => {
    const synagogueColors = {
      primary: synagogue?.primaryColorValue ?? Synagogue.DEFAULT_PRIMARY_COLOR,
      secondary:
        synagogue?.secondaryColorValue ?? Synagogue.DEFAULT_SECONDARY_COLOR,
      error: synagogue?.errorColorValue ?? Synagogue.DEFAULT_ERROR_COLOR,
    };

    return createTheme({
      cssVariables: true,
      direction: "rtl",
      palette: {
        primary: {
          main: synagogueColors.primary,
        },
        secondary: {
          main: synagogueColors.secondary,
        },
        error: {
          main: synagogueColors.error,
        },
      },
      typography: {
        fontFamily: "sans-serif",
      },
    });
  }, [
    synagogue?.primaryColorValue,
    synagogue?.secondaryColorValue,
    synagogue?.errorColorValue,
  ]);

  return <ThemeProvider theme={dynamicTheme}>{children}</ThemeProvider>;
};
