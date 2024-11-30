import { useMemo } from "react";
import { useColors } from "./useColors";

export function useColorMapper() {
  const { isLoading, data: colors } = useColors();

  const getHexColor = useMemo(() => {
    return (name: string) => {
      return colors.find((c) => c.name === name)?.hex_color ?? "#000000";
    };
  }, [colors]);

  return { getHexColor };
}
