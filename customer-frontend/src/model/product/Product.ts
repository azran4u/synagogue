import { ProductTights } from "./ProductTights";
import { ProductLace } from "./ProductLace";
import { ProductThermal } from "./ProductThermal";
import { ProductShort } from "./ProductShort";

export type Product =
  | ProductTights
  | ProductLace
  | ProductThermal
  | ProductShort;
