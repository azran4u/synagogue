import { DenierOption } from "../denier/DenierOption";
import { LegOption } from "../leg/LegOption";
import { ProductCommonFields } from "./ProductCommonFields";
import { ProductSchema } from "./ProductSchema";

export interface ProductDenierLegSize extends ProductCommonFields {
  schema: ProductSchema.BY_DENIER_LEG_SIZE;
  denier: DenierOption;
  leg: LegOption;
}
