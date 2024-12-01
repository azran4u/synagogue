import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { selectOrderId } from "../store/cartSlice";

export function useOrderUrl() {
  const orderId = useAppSelector(selectOrderId);
  const url = useMemo(() => {
    return orderId ? `/order/${orderId}` : null;
  }, [orderId]);

  return url ;
}
