import { useMemo } from "react";
import { useActiveProducts } from "./useProducts";
import { isNumber } from "lodash";

export function useFeaturedProducts() {
  const { isLoading, products } = useActiveProducts();
  const featuredProducts = useMemo(
    () =>
      products
        .filter((product) => !!product.category_image && !!product.category_sort_order)
        .sort((a, b) => {
          if (!a.category_sort_order || !isNumber(a.category_sort_order)) return -1;
          if (!b.category_sort_order || !isNumber(b.category_sort_order)) return 1;
          return Number(a.category_sort_order) - Number(b.category_sort_order);
        }),
    [products]
  );
  return { isLoading, featuredProducts };
}
