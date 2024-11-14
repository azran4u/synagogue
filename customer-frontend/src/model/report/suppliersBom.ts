import { Supplier } from "../supplier/Supplier";

export interface SupplierBom {
  supplier: Supplier;
  sku: string;
  amount: number;
}
