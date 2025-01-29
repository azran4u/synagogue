import { ProductSchema } from "./ProductSchema";

export interface Product {
  kind: ProductSchema;
  id: string;
  name: string;
  display_name: string;
  price: number;
  supplier: string;
  discount_min_qty: number;
  discount_price: number;
  description: string;
  stock: number;
  is_active: string;
  is_default: string;
  category_image: string;
  image: string;
  category_sort_order?: string;
  color: string;
  size: string;
  size_sort_order: string;
  size_description: string;
  lace: string;
  length: string;
  length_description: string;
  length_sort_order: string;
  leg: string;
  denier: string;
  denier_sort_order: string;
}
