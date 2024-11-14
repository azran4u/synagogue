import { selectByValue } from "../../utils/valueLabel/selectByValue";
import { Size } from "./Size";
import { SizeOption } from "./SizeOption";
import { sizes } from "./sizes";

export function selectSize(size: SizeOption): Size {
  return selectByValue(size, sizes);
}
