import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";
import { AliyaGroup } from "../model/AliyaGroup";

export const useAliyaGroups = () => {
  const { aliyaGroupService } = useSynagogueServices();

  return useQuery({
    queryKey: ["aliyaGroups"],
    queryFn: async () => aliyaGroupService?.getAll() ?? [],
    enabled: aliyaGroupService !== null && aliyaGroupService !== undefined,
  });
};

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
