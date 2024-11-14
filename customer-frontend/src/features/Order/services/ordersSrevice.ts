import { isEmpty, isNil } from "lodash";
import { FirestoreService } from "../../../shared/services/firestoreService";
import { store } from "../../../shared/store/store";
import {
  selectCartProductsWithAmount,
  selectCartTotalCost,
  selectCartTotalCostAfterDiscount,
} from "../../Cart/store/cartSlice";
import { selectOrderSate } from "../store/orderSlice";
import { selectPickupLocationByDispalyName } from "../../Pickup/store/pickupSlice";
import { selectSaleActive } from "../../Sale/store/saleSlice";
import { selectCheckout } from "../../Checkout/store/checkoutSlice";
import { orderNumberService } from "./orderNumberService";
import { where } from "firebase/firestore";
import { emailSenderService } from "../../../shared/services/emailSenderSrevice";
import { OrderNumber } from "../../../model/orderNumber/orderNumber";
import {
  Order,
  OrderInput,
  OrderStatus,
  orderStatusSubmitted,
} from "../../../model/order/order";
import { Email } from "../../../model/email/email";

export class OrderNotFound extends Error {
  constructor(private orderNumber?: OrderNumber) {
    super(`order number ${orderNumber} not found`);
  }
}

export class OrdersService extends FirestoreService<Order> {
  constructor() {
    super("orders");
  }

  async cancelOrder(orderNumber: string): Promise<void> {
    return this.deleteOrderByOrderNumber(orderNumber);
  }

  public async createOrder(): Promise<OrderInput> {
    const state = store.getState();
    const totalCostAfterDiscount = selectCartTotalCostAfterDiscount(state);
    const totalCost = selectCartTotalCost(state);
    const checkoutDetails = selectCheckout(state);
    const products = selectCartProductsWithAmount(state);
    const pickupLocation = selectPickupLocationByDispalyName(
      checkoutDetails.prefferedPickupLocation
    )(state)!;
    const activeSale = selectSaleActive(state);
    let { orderNumber, isExisitingOrder } = selectOrderSate(state);
    if (!isExisitingOrder) {
      orderNumber = await orderNumberService.nextOrderNumber();
    }

    if (isNil(orderNumber)) throw new OrderNotFound();

    const order: OrderInput = {
      orderNumber,
      totalCost,
      totalCostAfterDiscount,
      checkoutDetails,
      pickupLocation,
      date: new Date().toLocaleString(),
      products,
      saleName: activeSale?.name!,
      status: orderStatusSubmitted,
    };

    return order;
  }

  public async placeOrder() {
    // verify sale is open
    const state = store.getState();
    const activeSale = selectSaleActive(state);
    if (!activeSale?.active) throw new Error("sale is closed");

    const order = await this.createOrder();

    // check if an order already exists
    const { isExisitingOrder } = selectOrderSate(state);

    if (isExisitingOrder) {
      const orderId = await this.getOrderIdByOrderNumber(order.orderNumber);
      await this.update(orderId, { ...order, id: orderId });
    } else {
      await this.insert(order);
    }

    await this.sendEmail(order);

    return order.orderNumber;
  }

  public async deleteOrderByOrderNumber(orderNumber: OrderNumber) {
    const id = await this.getOrderIdByOrderNumber(orderNumber);
    await this.deleteById(id);
  }

  public async getOrderIdByOrderNumber(orderNumber: OrderNumber) {
    const order = await this.getOrderByOrderNumber(orderNumber);
    return order?.id;
  }

  public async getOrderByOrderNumber(orderNumber: OrderNumber) {
    const arr = await this.queryByOrderNumber(orderNumber);
    return arr[0];
  }

  public async changeOrderStatus(
    orderNumber: OrderNumber,
    status: OrderStatus
  ) {
    const id = await this.getOrderIdByOrderNumber(orderNumber);
    await this.update(id, { status });
  }

  private async sendEmail(order: OrderInput) {
    const email = this.createEmail(order);
    await emailSenderService.sendEmail(email);
  }

  private createEmail(order: OrderInput): Email {
    const mail: Email = {
      to: order.checkoutDetails.email,
      message: {
        subject: `${order.checkoutDetails.firstName} תודה על קנייתך בטייץ השומרון - הזמנה מספר ${order.orderNumber}`,
        html: `<a href=${window.location.origin}/order/${order.orderNumber}>לצפייה בהזמנה לחץ/י כאן</a>`,
      },
    };

    return mail;
  }

  private async queryByOrderNumber(orderNumber: OrderNumber) {
    const arr = await this.getByQuery(where("orderNumber", "==", orderNumber));
    if (isEmpty(arr)) throw new OrderNotFound(orderNumber);
    return arr;
  }
}

export const ordersService = new OrdersService();
