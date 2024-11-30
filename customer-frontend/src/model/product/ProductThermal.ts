import { BaseProduct } from "./BaseProduct";
import { ProductSchema } from "./ProductSchema";

export interface ProductThermal extends BaseProduct {
  kind: ProductSchema.THERMAL;
  leg: string;
  size: string;
  color: string;
}
