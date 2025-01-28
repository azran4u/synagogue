import { useSales } from "./useSales";
import { useMemo } from "react";
import { parse } from "date-fns";

export function useCurrentSale() {
  const { sales, isLoading } = useSales();

  const currentSale = useMemo(() => {
    const now = new Date();
    return sales.find((sale) => {
      const dateFormat = "dd/MM/yyyy HH:mm";
      const startDate = parse(sale.start_date, dateFormat, new Date());
      const endDate = parse(sale.end_date, dateFormat, new Date());
      return startDate <= now && endDate >= now;
    });
  }, [sales]);

  return { currentSale, isLoading };
}
