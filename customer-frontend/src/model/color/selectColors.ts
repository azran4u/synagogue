import { Color } from "./Color";
import { ColorOption } from "./ColorOption";
import { selectColor } from "./selectColor";

export function selectColors(colorValues: ColorOption[]): Color[] {
  return colorValues.map(selectColor);
}
