import { Product } from "../../model/product/Product";
import { ImagesConstants } from "./constants/ImageConstants";
import { ProductConstants } from "./constants/ProductConstants";

export const catalog: Product[] = [
  // dls 200 with leg one size
  {
    ...ProductConstants.dls200withLegOnesize,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-200-LEG-ONESIZE-AZURE",
  },
  {
    ...ProductConstants.dls200withLegOnesize,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-200-LEG-ONESIZE-BLACK",
  },
  {
    ...ProductConstants.dls200withLegOnesize,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-200-LEG-ONESIZE-CREAM",
  },

  // dls 200 with leg one 3XL to 5XL
  {
    ...ProductConstants.dls200withLeg3xlto5xl,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-200-LEG-3XL5XL-AZURE",
  },
  {
    ...ProductConstants.dls200withLeg3xlto5xl,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-200-LEG-3XL5XL-BLACK",
  },
  {
    ...ProductConstants.dls200withLeg3xlto5xl,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-200-LEG-3XL5XL-CREAM",
  },

  // dls 200 without leg one size
  {
    ...ProductConstants.dls200withoutLegOnesize,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-200-NOLEG-ONESIZE-AZURE",
  },
  {
    ...ProductConstants.dls200withoutLegOnesize,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-200-NOLEG-ONESIZE-BLACK",
  },
  {
    ...ProductConstants.dls200withoutLegOnesize,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-200-NOLEG-ONESIZE-CREAM",
  },

  // dls 200 without leg 3XL to 5XL
  {
    ...ProductConstants.dls200withoutLeg3XLto5XL,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-200-NOLEG-3XL5XL-AZURE",
  },
  {
    ...ProductConstants.dls200withoutLeg3XLto5XL,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-200-NOLEG-3XL5XL-BLACK",
  },
  {
    ...ProductConstants.dls200withoutLeg3XLto5XL,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-200-NOLEG-3XL5XL-CREAM",
  },

  // dls 120 with leg 9-12
  {
    ...ProductConstants.dls120withLeg9to12,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-120-LEG-9TO12-AZURE",
  },
  {
    ...ProductConstants.dls120withLeg9to12,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-120-LEG-9TO12-BLACK",
  },
  {
    ...ProductConstants.dls120withLeg9to12,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-120-LEG-9TO12-CREAM",
  },

  // dls 120 without leg 9-12
  {
    ...ProductConstants.dls120withoutLeg9to12,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-120-NOLEG-9TO12-AZURE",
  },
  {
    ...ProductConstants.dls120withoutLeg9to12,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-120-NOLEG-9TO12-BLACK",
  },
  {
    ...ProductConstants.dls120withoutLeg9to12,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-120-NOLEG-9TO12-CREAM",
  },

  // dls 20 with leg 36-40
  {
    ...ProductConstants.dls20LegSize36to40,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-36TO40-AZURE",
  },
  {
    ...ProductConstants.dls20LegSize36to40,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-36TO40-BLACK",
  },
  {
    ...ProductConstants.dls20LegSize36to40,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-36TO40-CREAM",
  },

  // dls 20 with leg XL 40-44
  {
    ...ProductConstants.dls20LegSize40to44XL,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-40TO44-AZURE",
  },
  {
    ...ProductConstants.dls20LegSize40to44XL,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-40TO44-BLACK",
  },
  {
    ...ProductConstants.dls20LegSize40to44XL,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-40TO44-CREAM",
  },

  // dls 20 with leg XXL 44-50
  {
    ...ProductConstants.dls20LegSize44to50XXL,
    color: "azure",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-44TO50XXL-AZURE",
  },
  {
    ...ProductConstants.dls20LegSize44to50XXL,
    color: "black",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-44TO50XXL-BLACK",
  },
  {
    ...ProductConstants.dls20LegSize44to50XXL,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-20-LEG-44TO50XXL-CREAM",
  },

  // dls 20 without leg onesize slim
  {
    ...ProductConstants.dls20WithoutLegOnesizeSlim,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-20-NOLEG-ONESIZESLIM-CREAM",
  },
  // dls 20 without leg XXL 40 - 44
  {
    ...ProductConstants.dls20WithoutLegSize40to44XXL,
    color: "cream",
    image: ImagesConstants.default,
    sku: "DLS-20-NOLEG-40TO44XL-CREAM",
  },

  // dls 40 with leg 36 - 40 L
  // dls 40 with leg 40 - 44 XL
  // dls 40 with leg 44 - 50 XXL

  // dls 40 without leg onesize
  // dls 40 without leg 40 - 44 XXL
  // dls 40 without leg 44 - 50 XXL

  // lace fan

  {
    ...ProductConstants.laceFan,
    color: "cream",
    image: ImagesConstants.default,
    sku: "LACE-FAN-ONESIZE-CREAM",
  },
  {
    ...ProductConstants.laceFan,
    color: "black",
    image: ImagesConstants.default,
    sku: "LACE-FAN-ONESIZE-BLACK",
  },

  // lace lengthwise

  {
    ...ProductConstants.laceLengthWise,
    color: "cream",
    image: ImagesConstants.default,
    sku: "LACE-LENGTHWISE-ONESIZE-CREAM",
  },
  {
    ...ProductConstants.laceLengthWise,
    color: "black",
    image: ImagesConstants.default,
    sku: "LACE-LENGTHWISE-ONESIZE-BLACK",
  },
];
