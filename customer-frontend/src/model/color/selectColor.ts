import { selectByValue } from "../../utils/valueLabel/selectByValue";
import { Color } from "./Color";
import { ColorOption } from "./ColorOption";
import { colors } from "./colors";

export function selectColor(color: ColorOption): Color {
  return selectByValue(color, colors);
}
