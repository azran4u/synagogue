import { FirestoreService } from "./firestoreService";
import { Sale } from "../model/sale";

export class SalesService extends FirestoreService<Sale> {
  constructor() {
    super("/sales");
  }
}

export const salesService = new SalesService();
