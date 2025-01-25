import { useAppSelector } from "../store/hooks";
import { selectOrderId } from "../store/cartSlice";
import { useOrderById } from "./useOrderById";
import { useMemo } from "react";

export function useIsExistingOrder() {
  const orderId = useAppSelector(selectOrderId);
  const { order, isLoading: orderByIdLoading } = useOrderById(orderId);
  const isExistingOrder = useMemo(() => {
    if (order && order?.products?.length > 0) return true;
    return false;
  }, [order]);
  return { isExistingOrder, isLoading: orderByIdLoading };
}
