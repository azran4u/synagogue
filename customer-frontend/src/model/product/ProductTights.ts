import { BaseProduct } from "./BaseProduct";
import { ProductSchema } from "./ProductSchema";

export interface ProductTights extends BaseProduct {
  kind: ProductSchema.TIGHTS;
  denier: string;
  leg: string;
  size: string;
  color: string;
}
