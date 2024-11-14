import { ColorOption } from "../color/ColorOption";
import { LaceOption } from "../lace/LaceOption";
import { ProductSchema } from "../product/ProductSchema";
import { Supplier } from "../supplier/Supplier";

export function skuByLace(item: {
  lace: LaceOption;
  color: ColorOption;
  supplier: Supplier;
}) {
  return `${ProductSchema.BY_LACE}#${item.lace}#${item.color}#${item.supplier}`;
}
