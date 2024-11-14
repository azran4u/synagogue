import { CountDiscount } from "../../../model/discount/CountDiscount";
import { DiscountKind } from "../../../model/discount/DiscountKind";
import { NoDiscount } from "../../../model/discount/NoDiscount";

export class DiscountConstants {
  public static noDiscount: NoDiscount = {
    kind: DiscountKind.NO_DISCOUNT,
  };

  public static discount_count_base: CountDiscount = {
    kind: DiscountKind.COUNT_DISCOUNT,
    count: 3,
    pricePerCount: 60,
    displayText: "",
    group: "",
  };

  public static discount_3_in_60: CountDiscount = {
    ...DiscountConstants.discount_count_base,
    count: 3,
    pricePerCount: 60,
  };

  public static discount_3_in_40: CountDiscount = {
    ...DiscountConstants.discount_count_base,
    count: 3,
    pricePerCount: 40,
  };

  public static discount_2_in_35: CountDiscount = {
    ...DiscountConstants.discount_count_base,
    count: 2,
    pricePerCount: 35,
  };

  public static discount_dls200_3_in_60: CountDiscount = {
    ...DiscountConstants.discount_3_in_60,
    group: "dls200",
  };

  public static discount_dls120_3_in_40: CountDiscount = {
    ...DiscountConstants.discount_3_in_40,
    group: "dls120",
  };

  public static discount_dls20or40_2_in_35: CountDiscount = {
    ...DiscountConstants.discount_2_in_35,
    group: "dls20or40",
  };
}
