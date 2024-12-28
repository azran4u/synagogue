import { useQuery } from "@tanstack/react-query";
import { ordersService } from "../services/ordersService";

export function useOrdersCount() {
  const { isFetching: isLoading, data: count } = useQuery<number>({
    queryKey: ["orders"],
    queryFn: async () => ordersService.countDocuments(),
    staleTime: 0,
    gcTime: 0,
  });

  return { isLoading, count};
}
