import { Product } from "./product/Product";

export interface CartProduct {
  product: Product;
  amount: number;
}
