import { useQuery } from "@tanstack/react-query";
import { prayerTimesService } from "../services/prayerTimesService";
import { PrayerTimes } from "../model/PrayerTimes";

// Hook to get all prayer times
export const usePrayerTimes = () => {
  return useQuery<PrayerTimes[]>({
    queryKey: ["prayerTimes"],
    queryFn: async () => prayerTimesService.getAll(),
    placeholderData: [],
  });
};
