import { toraLessonsMapper } from "../model/ToraLessons";
import { GenericService } from "./genericService";

// Export singleton instancePrayerTimesService();
export const toraLessonsService = new GenericService(
  "/toraLessons",
  toraLessonsMapper
);
