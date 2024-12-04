import { useQuery } from "@tanstack/react-query";
import { PickupLocation } from "../model/pickupLocation";
import { pickupService } from "../services/pickupService";

export function usePickups() {
  const { isLoading, data: pickups } = useQuery<PickupLocation[]>({
    queryKey: ["pickups"],
    queryFn: async () => {
      const res = await pickupService.getAll();
      return res.filter((pickup) => pickup.is_active === "כן");
    },
    initialData: [],
  });

  return { isLoading, pickups };
}
