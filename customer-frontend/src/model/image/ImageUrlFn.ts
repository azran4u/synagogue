import { ImageUrl } from "./ImageUrl";
import { ColorOption } from "../color/ColorOption";
import { DenierOption } from "../denier/DenierOption";
import { LegOption } from "../leg/LegOption";
import { SizeOption } from "../size/SizeOption";

export type ImageUrlFn = (input: {
  denier?: DenierOption;
  leg?: LegOption;
  size?: SizeOption;
  color?: ColorOption;
}) => ImageUrl[];
