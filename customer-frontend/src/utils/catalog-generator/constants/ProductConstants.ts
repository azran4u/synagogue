import { ProductDenierLegSize } from "../../../model/product/ProductDenierLegSize";
import { ProductLace } from "../../../model/product/ProductLace";
import { ProductSchema } from "../../../model/product/ProductSchema";
import { DescriptionConstants } from "./DescriptionConstants";
import { DiscountConstants } from "./DiscountConstants";
import { ImagesConstants } from "./ImageConstants";
import { LaceConstants } from "./LaceConstants";
import { LegConstants } from "./LegConstants";
import { SizeConstants } from "./SizeConstants";
import { SlugConstants } from "./SlugConstants";

export type DLS = Pick<ProductDenierLegSize, "schema" | "discount" | "image">;

export type DLSDenier = DLS &
  Pick<ProductDenierLegSize, "denier" | "discount" | "description" | "slug">;

export type DLSDenierLeg = DLSDenier & Pick<ProductDenierLegSize, "leg">;

export type DLSDenierLegSize = DLSDenierLeg &
  Pick<ProductDenierLegSize, "size" | "discount" | "price" | "supplier">;

export type Lace = Omit<ProductLace, "lace" | "sku" | "color">;

export type LaceFanOrLenthwise = Lace & Pick<ProductLace, "lace">;

export class ProductConstants {
  public static dls: DLS = {
    schema: ProductSchema.BY_DENIER_LEG_SIZE,
    discount: DiscountConstants.noDiscount,
    image: ImagesConstants.default,
  };

  public static dls200: DLSDenier = {
    ...ProductConstants.dls,
    denier: "200",
    description: DescriptionConstants.dls200,
    slug: SlugConstants.dls200,
  };

  public static dls200withLeg: DLSDenierLeg = {
    ...ProductConstants.dls200,
    ...LegConstants.withLeg,
  };

  public static dls200withLegOnesize: DLSDenierLegSize = {
    ...ProductConstants.dls200withLeg,
    ...SizeConstants.onesize,
    discount: DiscountConstants.discount_dls200_3_in_60,
    price: 22,
    supplier: "filo",
  };

  public static dls200withLeg3xlto5xl: DLSDenierLegSize = {
    ...ProductConstants.dls200withLeg,
    ...SizeConstants.size3xlTo5xl,
    ...DiscountConstants.noDiscount,
    price: 30,
    supplier: "filo",
  };

  public static dls200withoutLeg: DLSDenierLeg = {
    ...ProductConstants.dls200,
    ...LegConstants.withoutLeg,
  };

  public static dls200withoutLegOnesize: DLSDenierLegSize = {
    ...ProductConstants.dls200withoutLeg,
    ...SizeConstants.onesize,
    discount: DiscountConstants.discount_dls200_3_in_60,
    price: 22,
    supplier: "filo",
  };

  public static dls200withoutLeg3XLto5XL: DLSDenierLegSize = {
    ...ProductConstants.dls200withoutLeg,
    ...SizeConstants.size3xlTo5xl,
    discount: DiscountConstants.noDiscount,
    price: 30,
    supplier: "filo",
  };

  // dls 120

  public static dls120: DLSDenier = {
    ...ProductConstants.dls,
    denier: "120",
    description: DescriptionConstants.dlsGirls120,
    slug: SlugConstants.dlsGirls120,
  };

  public static dls120withLeg: DLSDenierLeg = {
    ...ProductConstants.dls120,
    ...LegConstants.withLeg,
  };

  public static dls120withLeg9to12: DLSDenierLegSize = {
    ...ProductConstants.dls120withLeg,
    ...SizeConstants.size9to12,
    discount: DiscountConstants.discount_dls120_3_in_40,
    price: 15,
    supplier: "filo",
  };

  public static dls120withoutLeg: DLSDenierLeg = {
    ...ProductConstants.dls120,
    ...LegConstants.withoutLeg,
  };

  public static dls120withoutLeg9to12: DLSDenierLegSize = {
    ...ProductConstants.dls120withoutLeg,
    ...SizeConstants.size9to12,
    discount: DiscountConstants.discount_dls120_3_in_40,
    price: 15,
    supplier: "filo",
  };

  // dls 20 with leg

  public static dls20: DLSDenier = {
    ...ProductConstants.dls,
    denier: "20",
    description: DescriptionConstants.dls20or40,
    slug: SlugConstants.dls20or40,
  };

  public static dls20Leg: DLSDenierLeg = {
    ...ProductConstants.dls20,
    ...LegConstants.withLeg,
  };

  public static dls20LegSize36to40: DLSDenierLegSize = {
    ...ProductConstants.dls20Leg,
    ...SizeConstants.size36to40,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  public static dls20LegSize40to44XL: DLSDenierLegSize = {
    ...ProductConstants.dls20Leg,
    ...SizeConstants.size40to44XL,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  public static dls20LegSize44to50XXL: DLSDenierLegSize = {
    ...ProductConstants.dls20Leg,
    ...SizeConstants.size44to50XXL,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  // dls 20 without leg

  public static dls20WithoutLeg: DLSDenierLeg = {
    ...ProductConstants.dls20,
    ...LegConstants.withoutLeg,
  };

  public static dls20WithoutLegOnesizeSlim: DLSDenierLegSize = {
    ...ProductConstants.dls20Leg,
    ...SizeConstants.onesizeSlim,
    ...DiscountConstants.discount_dls20or40_2_in_35,
    price: 20,
    supplier: "sharon",
  };

  public static dls20WithoutLegSize40to44XXL: DLSDenierLegSize = {
    ...ProductConstants.dls20Leg,
    ...SizeConstants.size40to44XXL,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  // dls 40 with leg

  public static dls40: DLSDenier = {
    ...ProductConstants.dls,
    denier: "40",
    description: DescriptionConstants.dls20or40,
    slug: SlugConstants.dls20or40,
  };

  public static dls40Leg: DLSDenierLeg = {
    ...ProductConstants.dls40,
    ...LegConstants.withLeg,
  };

  public static dls40LegSize36to40: DLSDenierLegSize = {
    ...ProductConstants.dls40Leg,
    ...SizeConstants.size36to40,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  public static dls40LegSize40to44XL: DLSDenierLegSize = {
    ...ProductConstants.dls40Leg,
    ...SizeConstants.size40to44XL,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  public static dls40LegSize44to50XXL: DLSDenierLegSize = {
    ...ProductConstants.dls40Leg,
    ...SizeConstants.size44to50XXL,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  // dls 40 without leg

  public static dls40WithoutLeg: DLSDenierLeg = {
    ...ProductConstants.dls40,
    ...LegConstants.withoutLeg,
  };

  public static dls40WithoutLegSizeOnesize: DLSDenierLegSize = {
    ...ProductConstants.dls40WithoutLeg,
    ...SizeConstants.onesize,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  public static dls40WithoutLegSize40to44XXL: DLSDenierLegSize = {
    ...ProductConstants.dls40WithoutLeg,
    ...SizeConstants.size40to44XXL,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  public static dls40WithoutLegSize44to50XXL: DLSDenierLegSize = {
    ...ProductConstants.dls40WithoutLeg,
    ...SizeConstants.size44to50XXL,
    ...DiscountConstants.noDiscount,
    price: 20,
    supplier: "sharon",
  };

  // lace

  public static lace: Lace = {
    schema: ProductSchema.BY_LACE,
    description: DescriptionConstants.lace,
    slug: SlugConstants.lace,
    discount: DiscountConstants.noDiscount,
    image: ImagesConstants.default,
    supplier: "sharon",
    price: 25,
    size: "onesize",
  };

  public static laceFan: LaceFanOrLenthwise = {
    ...ProductConstants.lace,
    ...LaceConstants.fan,
  };

  public static laceLengthWise: LaceFanOrLenthwise = {
    ...ProductConstants.lace,
    ...LaceConstants.lengthWise,
  };
}
