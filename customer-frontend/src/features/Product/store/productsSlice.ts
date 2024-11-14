import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../shared/store/store";
import { catalog } from "../../../utils/catalog-generator/catalog";
import { FeatureProductsConstants } from "../../../utils/catalog-generator/constants/FeaturedProductsConstants";
import { isEmpty } from "lodash";
import { Product } from "../../../model/product/Product";
import { FeaturedProduct } from "../../../model/featuredProduct/featuredProduct";

export type ProductItemsMap = Map<string, Product>;

export interface ProductsState {
  products: ProductItemsMap;
  featuredProducts: FeaturedProduct[];
}

const initialState: ProductsState = {
  products: catalog.reduce((prev, curr) => {
    prev.set(curr.sku, curr);
    return prev;
  }, new Map<string, Product>()),
  featuredProducts: FeatureProductsConstants.featuredProducts,
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
});

export const productsActions = productsSlice.actions;

export const selectProductsState = (state: RootState) => state.products;

export const selectProductsMap = createSelector(
  selectProductsState,
  (state) => state.products
);

export const selectFeaturedProducts = createSelector(
  selectProductsState,
  (state) => state.featuredProducts
);

export const selectProductBySku = (sku: string) =>
  createSelector(selectProductsMap, (products) => products.get(sku));

export const selectProducts = createSelector(selectProductsMap, (map) =>
  Array.from(map.values())
);

export const selectProductsBySlug = (slug: string) =>
  createSelector(selectProducts, (allProducts) => {
    const products = allProducts.filter((x) => x.slug === slug);
    if (isEmpty(products))
      throw new Error(`no product instances found for slug ${slug}`);
    else return products;
  });

export const selectProductSchemaBySlug = (slug: string) =>
  createSelector(selectProductsBySlug(slug), (products) => {
    return products[0].schema;
  });

export default productsSlice.reducer;
