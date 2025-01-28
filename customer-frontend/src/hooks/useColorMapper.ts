import { useCallback } from "react";
import { useColors } from "./useColors";
import { compact, isNumber } from "lodash";

export function useColorMapper() {
  const { isLoading, data: colors } = useColors();

  const convertColorNameToColorObject = useCallback(
    (names: string[]) => {
      return compact(
        names
          .map((name) => {
            return colors.find((c) => c.name === name);
          })
          .sort((a, b) => {
            if (!a || !isNumber(a.sort_order)) return 1;
            if (!b || !isNumber(b.sort_order)) return -1;
            return Number(a.sort_order) - Number(b.sort_order);
          })
      );
    },
    [colors]
  );

  return { convertColorNameToColorObject };
}
