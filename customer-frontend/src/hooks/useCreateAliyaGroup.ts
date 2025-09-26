import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AliyaGroup } from "../model/AliyaGroup";
import { useSynagogueServices } from "./useSynagogueServices";

export const useCreateAliyaGroup = () => {
  const { aliyaGroupService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aliyaGroup: AliyaGroup) =>
      aliyaGroupService?.insertWithId(aliyaGroup.id, aliyaGroup) ??
      Promise.resolve(null),
    onSuccess: (_, newAliyaGroup) => {
      queryClient.invalidateQueries({ queryKey: ["aliyaGroups"] });
      queryClient.setQueryData(
        ["aliyaGroups", newAliyaGroup.id],
        newAliyaGroup
      );
    },
    onError: error => {
      console.error("Failed to create aliyaGroup:", error);
    },
  });
};
