import { Discount } from "../discount/Discount";
import { Price } from "../price/Price";
import { Supplier } from "../supplier/Supplier";
import { ColorOption } from "../color/ColorOption";
import { SizeOption } from "../size/SizeOption";

export interface ProductCommonFields {
  description: string;
  slug: string; // product url endpoint
  sku: string; // specific item including size, color, etc.
  image: string;
  price: Price;
  discount: Discount;
  supplier: Supplier;
  color: ColorOption;
  size: SizeOption;
}
