import { useQuery } from "@tanstack/react-query";
import { Sale } from "../model/sale";
import { salesService } from "../services/salesService";

export function useSales() {
  const { isFetching: isLoading, data: sales } = useQuery<Sale[]>({
    queryKey: ["sales"],
    queryFn: async () => salesService.getAll(),
    initialData: [],
  });

  return { isLoading, sales };
}
