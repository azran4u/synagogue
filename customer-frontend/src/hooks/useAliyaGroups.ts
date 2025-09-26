import { useQuery } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";

export const useAliyaGroups = () => {
  const { aliyaGroupService } = useSynagogueServices();

  return useQuery({
    queryKey: ["aliyaGroups"],
    queryFn: async () => aliyaGroupService?.getAll() ?? [],
    enabled: aliyaGroupService !== null && aliyaGroupService !== undefined,
  });
};
