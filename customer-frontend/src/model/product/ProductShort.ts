import { BaseProduct } from "./BaseProduct";
import { ProductSchema } from "./ProductSchema";

export interface ProductShort extends BaseProduct {
  kind: ProductSchema.SHORT;
  length: string;
  size: string;
  size_description?: string;
  color: string;
}
