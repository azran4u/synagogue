import { invitationMapper } from "../model/Invitation";
import { GenericService } from "./genericService";

export const invitationService = new GenericService(
  "/invitations",
  invitationMapper
);
