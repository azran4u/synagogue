import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PrayerTimes } from "../model/PrayerTimes";
import { useSynagogueServices } from "./useSynagogueServices";

// Get all prayer times for a synagogue
export const usePrayerTimes = () => {
  const { prayerTimesService } = useSynagogueServices();

  return useQuery({
    queryKey: ["prayerTimes"],
    queryFn: async () => prayerTimesService?.getAll() ?? [],
    enabled: prayerTimesService !== null && prayerTimesService !== undefined,
  });
};

// Get a single prayer times by ID
export const usePrayerTimesById = (prayerTimesId?: string) => {
  const { prayerTimesService } = useSynagogueServices();

  return useQuery({
    queryKey: ["prayerTimes", prayerTimesId],
    queryFn: async () => prayerTimesService?.getById(prayerTimesId!) ?? null,
    enabled: !!prayerTimesId && prayerTimesService !== null,
  });
};

// Create a new prayer times
export const useCreatePrayerTimes = () => {
  const { prayerTimesService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prayerTimes: PrayerTimes) =>
      prayerTimesService?.insertWithId(prayerTimes.id, prayerTimes) ??
      Promise.resolve(null),
    onError: error => {
      console.error("Failed to create prayer times:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayerTimes"] });
    },
  });
};

// Update an existing prayer times
export const useUpdatePrayerTimes = () => {
  const { prayerTimesService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prayerTimes: PrayerTimes) =>
      prayerTimesService?.update(prayerTimes.id, prayerTimes) ??
      Promise.resolve(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayerTimes"] });
    },
    onError: error => {
      console.error("Failed to update prayer times:", error);
    },
  });
};

// Delete a prayer times
export const useDeletePrayerTimes = () => {
  const { prayerTimesService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prayerTimesId: string) =>
      prayerTimesService?.deleteById(prayerTimesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prayerTimes"] });
    },
    onError: error => {
      console.error("Failed to delete prayer times:", error);
    },
  });
};

// Get all enabled prayer times
export const useEnabledPrayerTimes = () => {
  const { prayerTimesService } = useSynagogueServices();

  return useQuery({
    queryKey: ["prayerTimes", "enabled"],
    queryFn: async () => {
      const allPrayerTimes = (await prayerTimesService?.getAll()) ?? [];
      return allPrayerTimes.filter((pt: PrayerTimes) => pt.enabled);
    },
    enabled: prayerTimesService !== null && prayerTimesService !== undefined,
  });
};
