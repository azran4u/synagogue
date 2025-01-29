import { FirestoreService } from "./firestoreService";
import { Product } from "../model/Product";

export class ProductsService extends FirestoreService<Product> {
  constructor() {
    super("/products");
  }
}

export const productsSrevice = new ProductsService();
