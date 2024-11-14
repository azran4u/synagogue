import { selectByValue } from "../../utils/valueLabel/selectByValue";
import { Lace } from "./Lace";
import { LaceOption } from "./LaceOption";
import { laces } from "./laces";

export function selectLace(lace: LaceOption): Lace {
  return selectByValue(lace, laces);
}
