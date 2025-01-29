import { useMemo } from "react";
import { useActiveProducts } from "./useProducts";
import { ProductSchema } from "../model/ProductSchema";
import { Product } from "../model/Product";

export function useProductsByKindAndName(kind: ProductSchema, name?: string) {
  if (!name) return { isLoading: true, products: [] };
  const { isLoading, products: allProudcts } = useActiveProducts();
  const products = useMemo(() => {
    const res: Product[] =
      allProudcts
        .filter((product) => product.kind === kind)
        .filter((product) => product.name === name) ?? [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}
