import { useQuery } from "@tanstack/react-query";
import { toraLessonsService } from "../services/ToraLessonsService";
import { ToraLessonsCollection } from "../model/ToraLessons";

// Hook to get all Torah lesson collections
export const useToraLessons = () => {
  return useQuery<ToraLessonsCollection[]>({
    queryKey: ["toraLessons"],
    queryFn: async () => toraLessonsService.getAll(),
    placeholderData: [],
  });
};
