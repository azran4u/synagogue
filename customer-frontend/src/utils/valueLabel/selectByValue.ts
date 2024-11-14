import { ValueLabel } from "./ValueLabel";

export function selectByValue<T extends ValueLabel>(
  value: string,
  arr: T[]
): T {
  return arr.find((v) => v.value === value)!;
}
