import { FirestoreService } from "./firestoreService";
import { Contact } from "../model/contact";

export class ContactService extends FirestoreService<Contact> {
  constructor() {
    super("/contact");
  }
}

export const contactService = new ContactService();
