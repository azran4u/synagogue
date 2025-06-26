import { useQuery } from "@tanstack/react-query";
import { PrayerCard } from "../model/PrayerCard";
import { prayerCardsSrevice } from "../services/prayerCardsSrevice";

export function usePrayerCardById(id?: string | null) {
  const {
    isFetching: isLoading,
    data: card,
    error,
  } = useQuery<PrayerCard | null>({
    queryKey: ["prayerCard", id],
    queryFn: async () => prayerCardsSrevice.getById(id!),
    enabled: !!id,
  });

  return { isLoading, card, error };
}
