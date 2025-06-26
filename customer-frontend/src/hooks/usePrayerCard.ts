import { PrayerCard } from "../model/PrayerCard";
import { useQuery } from "@tanstack/react-query";
import { prayerCardsSrevice } from "../services/prayerCardsSrevice";

export function usePrayerCards() {
  const { isLoading, data: products } = useQuery<PrayerCard[]>({
    queryKey: ["prayerCards"],
    queryFn: async () => prayerCardsSrevice.getAll(),
    placeholderData: [],
  });

  return { isLoading, products };
}
