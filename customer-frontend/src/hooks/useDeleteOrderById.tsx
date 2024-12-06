import { useMutation } from "@tanstack/react-query";
import { ordersService } from "../services/ordersService";

export function useDeleteOrderById() {
  const { mutate: deleteOrder } = useMutation({
    mutationFn: async (id: string) => ordersService.deleteById(id),
  });

  return {deleteOrder};
}
