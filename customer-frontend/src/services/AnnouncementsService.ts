import { announcementMapper } from "../model/Announcement";
import { GenericService } from "./genericService";

// Export singleton instance
export const announcementsService = new GenericService(
  "/announcements",
  announcementMapper
);
