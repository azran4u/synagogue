import { prayerTimesMapper } from "../model/PrayerTimes";
import { GenericService } from "./genericService";

// Export singleton instancePrayerTimesService();
export const prayerTimesService = new GenericService(
  "/prayerTimes",
  prayerTimesMapper
);
