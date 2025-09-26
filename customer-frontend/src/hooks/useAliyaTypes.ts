import { AliyaType } from "../model/AliyaType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";

export function useAliyaTypes() {
  const { aliyaTypeService } = useSynagogueServices();
  return useQuery({
    queryKey: ["aliyaTypes"],
    queryFn: async () => aliyaTypeService?.getAll(),
    enabled: aliyaTypeService !== null && aliyaTypeService !== undefined,
  });
}

export function useAliyaTypeById(id: string) {
  const { aliyaTypeService } = useSynagogueServices();
  return useQuery<AliyaType | null>({
    queryKey: ["aliyaType", id],
    queryFn: async () => aliyaTypeService?.getById(id) ?? null,
    enabled: !!id && aliyaTypeService !== null,
  });
}

export function useEnabledAliyaTypes() {
  const { aliyaTypeService } = useSynagogueServices();
  return useQuery<AliyaType[]>({
    queryKey: ["aliyaTypes", "enabled"],
    queryFn: async () => {
      const allTypes = (await aliyaTypeService?.getAll()) ?? [];
      return allTypes.filter(type => type.enabled);
    },
    enabled: aliyaTypeService !== null,
  });
}

export function useAliyaTypesByWeight() {
  const { aliyaTypeService } = useSynagogueServices();
  return useQuery<AliyaType[]>({
    queryKey: ["aliyaTypes", "byWeight"],
    queryFn: async () => {
      const allTypes = (await aliyaTypeService?.getAll()) ?? [];
      return allTypes
        .filter(type => type.enabled)
        .sort((a, b) => b.weight - a.weight); // Sort by weight descending
    },
    enabled: aliyaTypeService !== null,
  });
}

export const useCreateAliyaType = () => {
  const { aliyaTypeService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aliyaType: AliyaType) =>
      aliyaTypeService?.insertWithId(aliyaType.id, aliyaType) ??
      Promise.resolve(null),
    onSuccess: (_, data) => {
      // Invalidate and refetch aliya type queries
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes"] });
      queryClient.invalidateQueries({ queryKey: ["aliyaType", data.id] });
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes", "enabled"] });
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes", "byWeight"] });

      // Add the new aliya type to the cache
      queryClient.setQueryData(["aliyaType", data.id], data);
    },
    onError: error => {
      console.error("Failed to create aliya type:", error);
    },
  });
};

export const useDeleteAliyaType = () => {
  const { aliyaTypeService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => aliyaTypeService?.deleteById(id),
    onSuccess: (_, deletedId) => {
      // Invalidate and refetch aliya type queries
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes"] });
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes", "enabled"] });
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes", "byWeight"] });

      // Remove the deleted aliya type from the cache
      queryClient.removeQueries({ queryKey: ["aliyaType", deletedId] });
    },
    onError: error => {
      console.error("Failed to delete aliya type:", error);
    },
  });
};

export const useUpdateAliyaType = () => {
  const { aliyaTypeService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aliyaType: AliyaType) =>
      aliyaTypeService?.update(aliyaType.id, aliyaType) ??
      Promise.resolve(null),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes"] });
      queryClient.invalidateQueries({ queryKey: ["aliyaType", data.id] });
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes", "enabled"] });
      queryClient.invalidateQueries({ queryKey: ["aliyaTypes", "byWeight"] });
      queryClient.setQueryData(["aliyaType", data.id], data);
    },
    onError: error => {
      console.error("Failed to update aliya type:", error);
    },
  });
};
