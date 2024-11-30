import { FirestoreService } from "./firestoreService";
import { PickupLocation } from "../model/pickupLocation";

export class PickupService extends FirestoreService<PickupLocation> {
  constructor() {
    super("/pickups");
  }
}

export const pickupService = new PickupService();
