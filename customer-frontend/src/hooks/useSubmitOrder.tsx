import { useMutation } from "@tanstack/react-query";
import { Order } from "../model/order";
import { ordersService } from "../services/ordersService";

export function useSubmitOrder() {
  const { mutate: submitOrder } = useMutation({
    mutationFn: async (order: Order) => {
      return ordersService.insertWithTimeout(order, 5000);
    },
    retry: 3,
  });

  return { submitOrder };
}
