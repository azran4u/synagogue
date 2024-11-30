import { useMemo } from "react";
import { useProducts } from "./useProducts";

export function useFeaturedProducts() {
  const { isLoading, products } = useProducts();
  const featuredProducts = useMemo(
    () => products.filter((product) => product.is_default),
    [products]
  );
  return { isLoading, featuredProducts };
}
