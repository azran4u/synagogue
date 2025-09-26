import { donationMapper } from "../model/Donation";
import { GenericService } from "./genericService";

export const donationService = new GenericService("/donations", donationMapper);
