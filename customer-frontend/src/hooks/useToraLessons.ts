import { useQuery } from "@tanstack/react-query";
import { toraLessonsService } from "../services/ToraLessonsService";
import { ToraLessonsCollection } from "../model/ToraLessons";

// Hook to get all Torah lesson collections
export const useToraLessons = () => {
  console.log("useToraLessons hook called");

  return useQuery<ToraLessonsCollection[]>({
    queryKey: ["toraLessons"],
    queryFn: async () => toraLessonsService.getAll(),
    placeholderData: [],
  });
};
