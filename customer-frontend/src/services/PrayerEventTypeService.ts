import { prayerEventTypeMapper } from "../model/PrayerEventType";
import { GenericService } from "./genericService";

export const prayerEventTypeService = new GenericService(
  "prayerEventTypes",
  prayerEventTypeMapper
);
