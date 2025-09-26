import { useMutation, useQueryClient } from "@tanstack/react-query";
import { prayerEventTypeService } from "../services/PrayerEventTypeService";
import { PrayerEventType } from "../model/PrayerEventType";

export const useUpdatePrayerEventType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prayerEventType: PrayerEventType) => {
      try {
        await prayerEventTypeService.update(
          prayerEventType.id,
          prayerEventType
        );
        return prayerEventType;
      } catch (error) {
        console.error("Error updating prayer event type:", error);
        throw error;
      }
    },
    onSuccess: updatedPrayerEventType => {
      // Invalidate and refetch prayer event type queries
      queryClient.invalidateQueries({ queryKey: ["prayerEventTypes"] });
      queryClient.invalidateQueries({
        queryKey: ["prayerEventType", updatedPrayerEventType.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["prayerEventTypes", "enabled"],
      });

      // Update the cache with the new data
      queryClient.setQueryData(
        ["prayerEventType", updatedPrayerEventType.id],
        updatedPrayerEventType
      );
    },
    onError: error => {
      console.error("Failed to update prayer event type:", error);
    },
  });
};
