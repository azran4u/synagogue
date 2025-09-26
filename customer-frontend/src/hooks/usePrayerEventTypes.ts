import { PrayerEventType } from "../model/PrayerEventType";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";

export function usePrayerEventTypes() {
  const { prayerEventTypeService } = useSynagogueServices();
  return useQuery<PrayerEventType[]>({
    queryKey: ["prayerEventTypes"],
    queryFn: async () => {
      if (prayerEventTypeService == null) return [];
      return prayerEventTypeService.getAll();
    },
    enabled: prayerEventTypeService != null,
  });
}

export function usePrayerEventTypeById(id: string) {
  const { prayerEventTypeService } = useSynagogueServices();
  const { isLoading, data: prayerEventType } = useQuery<PrayerEventType | null>(
    {
      queryKey: ["prayerEventType", id],
      queryFn: async () =>
        prayerEventTypeService ? prayerEventTypeService.getById(id) : null,
      enabled: prayerEventTypeService != null && id != null,
      initialData: null,
    }
  );

  return { isLoading, prayerEventType };
}

export function useEnabledPrayerEventTypes() {
  const { data: prayerEventTypes } = usePrayerEventTypes();
  return prayerEventTypes?.filter(type => type.enabled) ?? [];
}

export function useCreatePrayerEventType(onSuccess?: () => void) {
  const { prayerEventTypeService } = useSynagogueServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PrayerEventType, "id">) => {
      const prayerEventType = PrayerEventType.create(
        data.displayName,
        data.recurrenceType,
        data.description,
        data.displayOrder
      );
      return prayerEventTypeService
        ? prayerEventTypeService?.insertWithId(
            prayerEventType.id,
            prayerEventType
          )
        : Promise.resolve(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayerEventTypes"] });
      onSuccess?.();
    },
    onError: error => {
      console.error("Failed to create prayer event type:", error);
    },
  });
}

export const useUpdatePrayerEventType = (onSuccess?: () => void) => {
  const { prayerEventTypeService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prayerEventType: PrayerEventType) => {
      return prayerEventTypeService
        ? prayerEventTypeService.update(prayerEventType.id, prayerEventType)
        : Promise.resolve(null);
    },
    onSuccess: (data, prayerEventType) => {
      // Invalidate and refetch prayer event type queries
      queryClient.invalidateQueries({ queryKey: ["prayerEventTypes"] });
      onSuccess?.();
    },
    onError: error => {
      console.error("Failed to update prayer event type:", error);
    },
  });
};

export const useDeletePrayerEventType = (onSuccess?: () => void) => {
  const { prayerEventTypeService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      return prayerEventTypeService
        ? prayerEventTypeService.deleteById(id)
        : Promise.resolve(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayerEventTypes"] });
      onSuccess?.();
    },
    onError: error => {
      console.error("Failed to delete prayer event type:", error);
    },
  });
};
