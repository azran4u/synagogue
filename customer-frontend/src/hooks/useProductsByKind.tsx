import { useMemo } from "react";
import { useProducts } from "./useProducts";
import { ProductSchema } from "../model/product/ProductSchema";
import { ProductTights } from "../model/product/ProductTights";
import { ProductLace } from "../model/product/ProductLace";
import { ProductShort } from "../model/product/ProductShort";
import { ProductThermal } from "../model/product/ProductThermal";

export function useTightsProducts(name?: string) {
  if (!name) return { isLoading: true, products: [] };
  const { isLoading, products: allProudcts } = useProducts();
  const products = useMemo(() => {
    const res: ProductTights[] =
      allProudcts
        .filter((product) => product.kind === ProductSchema.TIGHTS)
        .filter((product) => product.name === name) ?? [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}

export function useLaceProducts(name?: string) {
  if (!name) return { isLoading: true, products: [] };
  const { isLoading, products: allProudcts } = useProducts();
  const products = useMemo(() => {
    const res: ProductLace[] =
      allProudcts
        .filter((product) => product.kind === ProductSchema.LACE)
        .filter((product) => product.name === name) ?? [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}

export function useShortProducts(name?: string) {
  if (!name) return { isLoading: true, products: [] };
  const { isLoading, products: allProudcts } = useProducts();
  const products = useMemo(() => {
    const res: ProductShort[] =
      allProudcts
        .filter((product) => product.kind === ProductSchema.SHORT)
        .filter((product) => product.name === name) ?? [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}

export function useThermalProducts(name?: string) {
  if (!name) return { isLoading: true, products: [] };
  const { isLoading, products: allProudcts } = useProducts();
  const products = useMemo(() => {
    const res: ProductThermal[] =
      allProudcts
        .filter((product) => product.kind === ProductSchema.THERMAL)
        .filter((product) => product.name === name) ?? [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}
