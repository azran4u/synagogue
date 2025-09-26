import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AliyaGroup } from "../model/AliyaGroup";
import { useSynagogueServices } from "./useSynagogueServices";

export const useUpdateAliyaGroup = () => {
  const { aliyaGroupService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aliyaGroup: AliyaGroup) =>
      aliyaGroupService?.update(aliyaGroup.id, aliyaGroup) ??
      Promise.resolve(null),
    onSuccess: (_, updatedAliyaGroup) => {
      queryClient.invalidateQueries({ queryKey: ["aliyaGroups"] });
      queryClient.invalidateQueries({
        queryKey: ["aliyaGroups", updatedAliyaGroup.id],
      });
      queryClient.setQueryData(
        ["aliyaGroups", updatedAliyaGroup.id],
        updatedAliyaGroup
      );
    },
    onError: error => {
      console.error("Failed to update aliyaGroup:", error);
    },
  });
};
