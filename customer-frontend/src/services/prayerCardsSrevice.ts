import { prayerCardMapper } from "../model/PrayerCard";
import { GenericService } from "./genericService";

export const prayerCardsSrevice = new GenericService(
  "/prayerCards",
  prayerCardMapper
);
