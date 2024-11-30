import { FirestoreService } from "./firestoreService";
import { Color } from "../model/color";

export class ColorsService extends FirestoreService<Color> {
  constructor() {
    super("/colors");
  }
}

export const colorsSrevice = new ColorsService();
