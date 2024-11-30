import { useQuery } from "@tanstack/react-query";
import { Color } from "../model/color";
import { colorsSrevice } from "../services/colorsSrevice";

export function useColors() {
  const { isLoading, data } = useQuery<Color[]>({
    queryKey: ["colors"],
    queryFn: async () => colorsSrevice.getAll(),
    initialData: [],
  });

  return { isLoading, data };
}
