import { IResult, Ok, Fail } from "types-ddd";
import _ from "lodash";

export class TextUtil {
  static isString(value: string, name: string): IResult<boolean> {
    if (_.isString(value)) return Ok(true);
    return Fail(`${name} must be a string ${value}`);
  }
}
