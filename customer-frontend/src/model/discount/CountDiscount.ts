import { DiscountBase } from "./DiscountBase";
import { DiscountKind } from "./DiscountKind";

export interface CountDiscount extends DiscountBase {
  kind: DiscountKind.COUNT_DISCOUNT;
  count: number;
  pricePerCount: number;
  displayText?: string;
  group: string;
}
