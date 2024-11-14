import { selectByValue } from "../../utils/valueLabel/selectByValue";
import { Denier } from "./Denier";
import { DenierOption } from "./DenierOption";
import { deniers } from "./deniers";

export function selectDenier(denier: DenierOption): Denier {
  return selectByValue(denier, deniers);
}
