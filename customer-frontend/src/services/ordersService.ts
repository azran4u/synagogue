import { FirestoreService } from "./firestoreService";
import { Order } from "../model/order";

export class OrdersService extends FirestoreService<Order> {
  constructor() {
    super("/orders");
  }
}

export const ordersService = new OrdersService();
