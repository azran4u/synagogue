import { Email } from "../../model/email/email";
import { FirestoreService } from "./firestoreService";

export class EmailSenderService extends FirestoreService<Email> {
  constructor() {
    super("mail");
  }

  public async sendEmail(email: Email) {
    const id = await this.insert(email);
    return id;
  }
}

export const emailSenderService = new EmailSenderService();
