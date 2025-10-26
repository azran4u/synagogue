import { AliyaTypeCategory } from "../model/AliyaTypeCategory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";

export function useAliyaTypeCategories() {
  const { aliyaTypeCategoryService } = useSynagogueServices();
  return useQuery({
    queryKey: ["aliyaTypeCategories"],
    queryFn: async () => aliyaTypeCategoryService?.getAll(),
    enabled:
      aliyaTypeCategoryService !== null &&
      aliyaTypeCategoryService !== undefined,
  });
}

export function useAliyaTypeCategoryById(id: string) {
  const { aliyaTypeCategoryService } = useSynagogueServices();
  return useQuery<AliyaTypeCategory | null>({
    queryKey: ["aliyaTypeCategory", id],
    queryFn: async () => aliyaTypeCategoryService?.getById(id) ?? null,
    enabled: !!id && aliyaTypeCategoryService !== null,
  });
}

export const useCreateAliyaTypeCategory = () => {
  const { aliyaTypeCategoryService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: AliyaTypeCategory) =>
      aliyaTypeCategoryService?.insertWithId(category.id, category) ??
      Promise.resolve(null),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["aliyaTypeCategories"] });
      queryClient.invalidateQueries({
        queryKey: ["aliyaTypeCategory", data.id],
      });
      queryClient.setQueryData(["aliyaTypeCategory", data.id], data);
    },
    onError: error => {
      console.error("Failed to create aliya type category:", error);
    },
  });
};

export const useDeleteAliyaTypeCategory = () => {
  const { aliyaTypeCategoryService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => aliyaTypeCategoryService?.deleteById(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["aliyaTypeCategories"] });
      queryClient.removeQueries({ queryKey: ["aliyaTypeCategory", deletedId] });
    },
    onError: error => {
      console.error("Failed to delete aliya type category:", error);
    },
  });
};

export const useUpdateAliyaTypeCategory = () => {
  const { aliyaTypeCategoryService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: AliyaTypeCategory) =>
      aliyaTypeCategoryService?.update(category.id, category) ??
      Promise.resolve(null),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ["aliyaTypeCategories"] });
      queryClient.invalidateQueries({
        queryKey: ["aliyaTypeCategory", data.id],
      });
      queryClient.setQueryData(["aliyaTypeCategory", data.id], data);
    },
    onError: error => {
      console.error("Failed to update aliya type category:", error);
    },
  });
};
