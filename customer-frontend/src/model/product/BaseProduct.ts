import { ProductSchema } from "./ProductSchema";

export interface BaseProduct {
  id: string;
  kind: ProductSchema;
  name: string;
  display_name: string;
  price: number;
  supplier: string;
  discount_type: string;
  discount_min_qty: number;
  discount_price: number;
  description: string;
  stock: number;
  is_active: string;
  is_default: string;
  category_image: string;
  image: string;
  sort_order?: string;
  size_description?: string;
}
