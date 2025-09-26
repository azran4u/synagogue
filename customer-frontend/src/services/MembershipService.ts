import { membershipMapper } from "../model/Membership";
import { GenericService } from "./genericService";

export const membershipService = new GenericService(
  "/memberships",
  membershipMapper
);
