import { selectByValue } from "../../utils/valueLabel/selectByValue";
import { Leg } from "./Leg";
import { LegOption } from "./LegOption";
import { legs } from "./legs";

export function selectLeg(legOption: LegOption): Leg {
  return selectByValue(legOption, legs);
}
