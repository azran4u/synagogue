import { LaceOption } from "../lace/LaceOption";
import { ProductCommonFields } from "./ProductCommonFields";
import { ProductSchema } from "./ProductSchema";

export interface ProductLace extends ProductCommonFields {
  schema: ProductSchema.BY_LACE;
  lace: LaceOption;
}
