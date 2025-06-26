import { useQuery } from "@tanstack/react-query";
import { announcementsService } from "../services/AnnouncementsService";
import { Announcement } from "../model/Announcement";

// Hook to get all announcements
export const useAnnouncements = () => {
  return useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => announcementsService.getAll(),
    placeholderData: [],
  });
};
