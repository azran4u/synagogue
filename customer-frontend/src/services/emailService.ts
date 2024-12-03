import { FirestoreService } from "./firestoreService";
import { Email } from "../model/email";

export class EmailService extends FirestoreService<Email> {
  constructor() {
    super("/emails");
  }
}

export const emailService = new EmailService();
