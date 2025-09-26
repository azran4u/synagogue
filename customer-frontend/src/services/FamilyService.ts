import { familyMapper } from "../model/Family";
import { GenericService } from "./genericService";

export const familyService = new GenericService("/families", familyMapper);
