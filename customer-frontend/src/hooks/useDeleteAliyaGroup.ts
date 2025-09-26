import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";

export const useDeleteAliyaGroup = () => {
  const { aliyaGroupService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) =>
      aliyaGroupService?.deleteById(id) ?? Promise.resolve(),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["aliyaGroups"] });
      queryClient.removeQueries({
        queryKey: ["aliyaGroups", deletedId],
      });
    },
    onError: error => {
      console.error("Failed to delete aliyaGroup:", error);
    },
  });
};
