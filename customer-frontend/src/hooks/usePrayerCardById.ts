import { useQuery } from "@tanstack/react-query";
import { PrayerCard } from "../model/PrayerCard";
import { prayerCardsSrevice } from "../services/prayerCardsSrevice";

export function usePrayerCardById(id?: string) {
  if (!id) return { isLoading: false, card: null };
  const { isFetching: isLoading, data: card } = useQuery<PrayerCard>({
    queryKey: ["prayerCard", id],
    queryFn: async () => prayerCardsSrevice.getById(id),
    staleTime: 0,
    gcTime: 0,
  });

  return { isLoading, card };
}
