import { ColorOption } from "../color/ColorOption";
import { DenierOption } from "../denier/DenierOption";
import { LegOption } from "../leg/LegOption";
import { ProductSchema } from "../product/ProductSchema";
import { SizeOption } from "../size/SizeOption";
import { Supplier } from "../supplier/Supplier";

export function skuByDenierLegSize(item: {
  denier: DenierOption;
  leg: LegOption;
  size: SizeOption;
  color: ColorOption;
  supplier: Supplier;
}) {
  return `${ProductSchema.BY_DENIER_LEG_SIZE}#${item.denier}#${item.leg}#${item.size}#${item.color}#${item.supplier}`;
}
