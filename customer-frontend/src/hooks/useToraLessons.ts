import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toraLessonsService } from "../services/ToraLessonsService";
import { ToraLessonsCollection } from "../model/ToraLessons";

// Hook to get all Torah lesson collections
export const useToraLessons = () => {
  return useQuery<ToraLessonsCollection[]>({
    queryKey: ["toraLessons"],
    queryFn: () => toraLessonsService.getAll(),
  });
};

// Hook to get a specific Torah lesson collection by ID
export const useToraLessonById = (id: string) => {
  return useQuery<ToraLessonsCollection>({
    queryKey: ["toraLessons", id],
    queryFn: () => toraLessonsService.getById(id),
    enabled: !!id,
  });
};

// Hook to create a new Torah lesson collection
export const useCreateToraLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collection: ToraLessonsCollection) =>
      toraLessonsService.insert(collection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toraLessons"] });
    },
  });
};

// Hook to update a Torah lesson collection
export const useUpdateToraLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      collection,
    }: {
      id: string;
      collection: ToraLessonsCollection;
    }) => toraLessonsService.update(id, collection),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toraLessons"] });
    },
  });
};

// Hook to delete a Torah lesson collection
export const useDeleteToraLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toraLessonsService.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toraLessons"] });
    },
  });
};
