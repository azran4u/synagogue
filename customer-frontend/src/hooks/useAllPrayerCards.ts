import { PrayerCard } from "../model/Prayer";
import { useQuery } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";

export function useAllPrayerCards() {
  const { prayerCardService } = useSynagogueServices();
  return useQuery<PrayerCard[]>({
    queryKey: ["allPrayerCards"],
    queryFn: async () => prayerCardService?.getAll() ?? [],
    enabled: prayerCardService !== null,
  });
}
