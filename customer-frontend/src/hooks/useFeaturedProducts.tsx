import { useMemo } from "react";
import { useProducts } from "./useProducts";
import { isNumber } from "lodash";

export function useFeaturedProducts() {
  const { isLoading, products } = useProducts();
  const featuredProducts = useMemo(
    () =>
      products
        .filter((product) => product.is_default === "כן")
        .sort((a, b) => {
          if (!a.sort_order || !isNumber(a.sort_order)) return -1;
          if (!b.sort_order || !isNumber(b.sort_order)) return 1;
          return Number(a.sort_order) - Number(b.sort_order);
        }),
    [products]
  );
  return { isLoading, featuredProducts };
}
