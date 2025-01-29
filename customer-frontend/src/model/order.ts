import { Product } from "./Product";

export interface Order {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  prefferedPickupLocation: string;
  comments: string;
  saleName: string;
  date: string;
  products: { product: Product; amount: number }[];
  totalCost: number;
  totalCostAfterDiscount: number;
  discount: number;
  status: "התקבלה" | "נארזה" | "נשלחה לנקודת חלוקה" | "שולמה";
}
