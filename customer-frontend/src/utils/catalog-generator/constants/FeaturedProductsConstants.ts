import { FeaturedProduct } from "../../../model/featuredProduct/featuredProduct";
import { DescriptionConstants } from "./DescriptionConstants";
import { ImagesConstants } from "./ImageConstants";
import { SlugConstants } from "./SlugConstants";

export class FeatureProductsConstants {
  public static featuredProducts: FeaturedProduct[] = [
    {
      description: DescriptionConstants.dls200, // Constants.description.dls200,
      image: ImagesConstants.default,
      slug: SlugConstants.dls200,
    },
    {
      description: DescriptionConstants.dls20or40,
      image: ImagesConstants.default,
      slug: SlugConstants.dls20or40,
    },
    {
      description: DescriptionConstants.dlsGirls120,
      image: ImagesConstants.default,
      slug: SlugConstants.dlsGirls120,
    },
    {
      description: DescriptionConstants.lace,
      image: ImagesConstants.default,
      slug: SlugConstants.lace,
    },
  ];
}
