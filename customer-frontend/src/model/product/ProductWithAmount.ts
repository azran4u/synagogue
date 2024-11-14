import { CartItem } from "../cart/CartItem";
import { Product } from "./Product";

export type ProductWithAmount = Product & CartItem;
