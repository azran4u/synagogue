import { useQuery } from "@tanstack/react-query";
import { productsSrevice } from "../services/productsSrevice";
import { Product } from "../model/Product";
import { useMemo } from "react";

export function useActiveProducts() {
  const { isLoading, products } = useProducts();
  const activeProducts = useMemo(
    () => products.filter((product) => product.is_active === "כן"),
    [products]
  );

  return { isLoading, products: activeProducts };
}

export function useProducts() {
  const { isLoading, data: products } = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => productsSrevice.getAll(),
    initialData: [],
  });

  return { isLoading, products };
}
