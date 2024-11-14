import { FirestoreService } from "../../../shared/services/firestoreService";
import { doc, runTransaction, where } from "firebase/firestore";
import { OrderNumber } from "../../../model/orderNumber/orderNumber";

export interface OrderNumberDto {
  id: string;
  name: string;
  orderNumber: number;
}

export class OrderNumberService extends FirestoreService<OrderNumberDto> {
  constructor() {
    super("orderNumber");
  }

  public async nextOrderNumber() {
    const currentOrderNumberDocRef = await this.currentDocRef();

    return runTransaction<OrderNumber>(this.db, async (transaction) => {
      let currentOrderNumberDoc = await transaction.get(
        currentOrderNumberDocRef
      );

      if (!currentOrderNumberDoc.exists()) {
        throw new Error(`couldn't find next oder number`);
      }

      const currentOrderNumber = currentOrderNumberDoc.data() as OrderNumberDto;

      const nextOrderNumber: OrderNumberDto = {
        ...currentOrderNumber,
        orderNumber: currentOrderNumber.orderNumber + 1,
      };

      transaction.update(currentOrderNumberDocRef, {
        orderNumber: nextOrderNumber.orderNumber,
      });

      return nextOrderNumber.orderNumber.toString();
    });
  }

  private async currentDocRef() {
    const currentOrderNumberDocRef = doc(
      this.db,
      this.collectionName,
      await this.currentDocId()
    );

    return currentOrderNumberDocRef;
  }

  private async currentDocId() {
    const arr = await this.getByQuery(
      where("name", "==", "CURRENT_ORDER_NUMBER")
    );
    return arr[0].id;
  }
}

export const orderNumberService = new OrderNumberService();
