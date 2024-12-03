import { useMemo } from "react";
import { useAppSelector } from "../store/hooks";
import { selectOrderId } from "../store/cartSlice";

export function useOrderUrl() {
  const orderId = useAppSelector(selectOrderId);
  const baseUrl = useMemo(() => {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? `:${port}` : ""}`;
  }, []);

  const endpoint = useMemo(() => {
    return orderId ? `/order/${orderId}` : null;
  }, [orderId]);

  const url = useMemo(() => {
    return orderId ? `${baseUrl}${endpoint}` : null;
  }, [endpoint, baseUrl]);

  return { endpoint, url };
}
