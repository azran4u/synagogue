import { PrayerCard } from "../model/Prayer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";
import { useCurrentUserEmail } from "./useCurrentUserEmail";

export function usePrayerCard() {
  const { prayerCardService } = useSynagogueServices();
  const email = useCurrentUserEmail();
  return useQuery({
    queryKey: ["prayerCards", email],
    queryFn: () => prayerCardService?.getById(email),
    enabled: prayerCardService != null && email != null && email != undefined,
  });
}

export function useCreatePrayerCard() {
  const { prayerCardService } = useSynagogueServices();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prayerCard: PrayerCard) =>
      prayerCardService
        ? prayerCardService.insertWithId(prayerCard.id, prayerCard)
        : Promise.resolve(null),
    onSuccess: (_, prayerCard) => {
      queryClient.invalidateQueries({
        queryKey: ["prayerCards", prayerCard?.prayer.id],
      });
      queryClient.invalidateQueries({ queryKey: ["allPrayerCards"] });
    },
    onError: error => {
      console.error("Failed to create prayerCard:", error);
    },
  });
}

export const useUpdatePrayerCard = () => {
  const { prayerCardService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (prayerCard: PrayerCard) =>
      prayerCardService?.update(prayerCard.id, prayerCard) ??
      Promise.resolve(null),
    onSuccess: (_, prayerCard) => {
      queryClient.invalidateQueries({ queryKey: ["prayerCards"] });
      queryClient.invalidateQueries({ queryKey: ["allPrayerCards"] });
      queryClient.invalidateQueries({
        queryKey: ["prayerCards", prayerCard.prayer.id],
      });

      // Update the cache with the new data
      queryClient.setQueryData(
        ["prayerCards", prayerCard.prayer.id],
        prayerCard
      );
    },
    onError: error => {
      console.error("Failed to update prayer card:", error);
    },
  });
};
