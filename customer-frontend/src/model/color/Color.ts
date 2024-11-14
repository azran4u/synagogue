import { ValueLabel } from "../../utils/valueLabel/ValueLabel";
import { ColorOption } from "./ColorOption";

export interface Color extends ValueLabel<ColorOption> {
  cssColor: string;
}
