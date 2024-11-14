import { DiscountBase } from "./DiscountBase";
import { DiscountKind } from "./DiscountKind";

export interface NoDiscount extends DiscountBase {
  kind: DiscountKind.NO_DISCOUNT;
}
