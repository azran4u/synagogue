import { useQuery } from "@tanstack/react-query";
import { PickupLocation } from "../model/pickupLocation";
import { pickupService } from "../services/pickupService";

export function usePickups() {
  const { isLoading, data: pickups } = useQuery<PickupLocation[]>({
    queryKey: ["pickups"],
    queryFn: async () => pickupService.getAll(),
    initialData: [],
  });

  return { isLoading, pickups };
}
