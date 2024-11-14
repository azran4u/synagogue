import { Order } from "../order/order";
import { PickupHistogramEntry } from "./pickupHistogram";
import { SupplierBom } from "./suppliersBom";

export interface Report {
  totalOrderCount: number;
  totalCost: number;
  pickupHistogram: PickupHistogramEntry[];
  orders: Order[];
  suppliersBom: SupplierBom[];
}
