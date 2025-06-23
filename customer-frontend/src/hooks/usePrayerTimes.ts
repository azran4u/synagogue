import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { prayerTimesService } from "../services/prayerTimesService";
import { PrayerTimes } from "../model/PrayerTimes";

// Hook to get all prayer times
export const usePrayerTimes = () => {
  return useQuery<PrayerTimes[]>({
    queryKey: ["prayerTimes"],
    queryFn: () => prayerTimesService.getAll(),
  });
};
