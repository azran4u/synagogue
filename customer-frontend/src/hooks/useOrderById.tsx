import { useQuery } from "@tanstack/react-query";
import { Order } from "../model/order";
import { ordersService } from "../services/ordersService";

export function useOrderById(id?: string) {
  if (!id) return { isLoading: false, order: undefined };
  const { isFetching: isLoading, data: order } = useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: async () => ordersService.getById(id),
    staleTime: 0,
    gcTime: 0,
  });

  return { isLoading, order };
}
