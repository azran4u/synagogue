import { ValueLabel } from "../../utils/valueLabel/ValueLabel";
import { CheckoutDetails } from "../checkout/checkout";
import { OrderNumber } from "../orderNumber/orderNumber";
import { PickupLocation } from "../pickup/pickupLocation";
import { ProductWithAmount } from "../product/ProductWithAmount";

export interface OrderInput {
  orderNumber: OrderNumber;
  checkoutDetails: CheckoutDetails;
  pickupLocation: PickupLocation;
  saleName: string;
  date: string;
  products: ProductWithAmount[];
  totalCost: number;
  totalCostAfterDiscount: number;
  status: OrderStatus;
}

export interface Order extends OrderInput {
  id: string;
}

export type OrderStatusOption = "submitted" | "packed" | "payed";

export interface OrderStatus extends ValueLabel<OrderStatusOption> {}

export const orderStatus: OrderStatus[] = [
  {
    value: "submitted",
    label: "התקבלה",
  },
  {
    value: "packed",
    label: "נארזה",
  },
  {
    value: "payed",
    label: "שולמה",
  },
];

export const orderStatusSubmitted = orderStatus.find(
  (x) => x.value === "submitted"
)!;
