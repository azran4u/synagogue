import { useMemo } from "react";
import { useProducts } from "./useProducts";
import { ProductSchema } from "../model/product/ProductSchema";
import { ProductTights } from "../model/product/ProductTights";
import { ProductLace } from "../model/product/ProductLace";
import { ProductShort } from "../model/product/ProductShort";
import { ProductThermal } from "../model/product/ProductThermal";

export function useTightsProducts() {
  const { isLoading, products: allProudcts } = useProducts();
  const products = useMemo(() => {
    const res: ProductTights[] =
      allProudcts.filter((product) => product.kind === ProductSchema.TIGHTS) ??
      [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}

export function useLaceProducts() {
  const { isLoading, products: allProudcts } = useProducts();
  const products = useMemo(() => {
    const res: ProductLace[] =
      allProudcts.filter((product) => product.kind === ProductSchema.LACE) ??
      [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}

export function useShortProducts() {
  const { isLoading, products: allProudcts } = useProducts();
  const products = useMemo(() => {
    const res: ProductShort[] =
      allProudcts.filter((product) => product.kind === ProductSchema.SHORT) ??
      [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}

export function useThermalProducts() {
  const { isLoading, products: allProudcts } = useProducts();
  const products = useMemo(() => {
    const res: ProductThermal[] =
      allProudcts.filter((product) => product.kind === ProductSchema.THERMAL) ??
      [];
    return res;
  }, [allProudcts]);
  return { isLoading, products };
}
