import { useMutation, useQueryClient } from "@tanstack/react-query";
import { prayerEventTypeService } from "../services/PrayerEventTypeService";
import { PrayerEventType } from "../model/PrayerEventType";

export const useCreatePrayerEventType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prayerEventType: PrayerEventType) => {
      try {
        const id = await prayerEventTypeService.insert(prayerEventType);
        return { id, prayerEventType };
      } catch (error) {
        console.error("Error creating prayer event type:", error);
        throw error;
      }
    },
    onSuccess: data => {
      // Invalidate and refetch prayer event type queries
      queryClient.invalidateQueries({ queryKey: ["prayerEventTypes"] });
      queryClient.invalidateQueries({ queryKey: ["prayerEventType", data.id] });
      queryClient.invalidateQueries({
        queryKey: ["prayerEventTypes", "enabled"],
      });

      // Add the new prayer event type to the cache
      queryClient.setQueryData(
        ["prayerEventType", data.id],
        data.prayerEventType
      );
    },
    onError: error => {
      console.error("Failed to create prayer event type:", error);
    },
  });
};
