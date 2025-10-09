import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ToraLesson } from "../model/ToraLessons";
import { useSynagogueServices } from "./useSynagogueServices";

// Get all Torah lessons for a synagogue
export const useToraLessons = () => {
  const { toraLessonsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["toraLessons"],
    queryFn: async () => toraLessonsService?.getAll() ?? [],
    enabled: toraLessonsService !== null && toraLessonsService !== undefined,
  });
};

// Get a single Torah lesson by ID
export const useToraLessonById = (lessonId?: string) => {
  const { toraLessonsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["toraLessons", lessonId],
    queryFn: async () => toraLessonsService?.getById(lessonId!) ?? null,
    enabled:
      !!lessonId &&
      toraLessonsService !== null &&
      toraLessonsService !== undefined,
  });
};

// Create a new Torah lesson
export const useCreateToraLesson = () => {
  const { toraLessonsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lesson: ToraLesson) =>
      toraLessonsService?.insertWithId(lesson.id, lesson) ??
      Promise.resolve(null),
    onError: error => {
      console.error("Failed to create Torah lesson:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toraLessons"] });
    },
  });
};

// Update an existing Torah lesson
export const useUpdateToraLesson = () => {
  const { toraLessonsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lesson: ToraLesson) =>
      toraLessonsService?.update(lesson.id, lesson) ?? Promise.resolve(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toraLessons"] });
    },
    onError: error => {
      console.error("Failed to update Torah lesson:", error);
    },
  });
};

// Delete a Torah lesson
export const useDeleteToraLesson = () => {
  const { toraLessonsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lessonId: string) =>
      toraLessonsService?.deleteById(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toraLessons"] });
    },
    onError: error => {
      console.error("Failed to delete Torah lesson:", error);
    },
  });
};

// Get all enabled Torah lessons
export const useEnabledToraLessons = () => {
  const { toraLessonsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["toraLessons", "enabled"],
    queryFn: async () => {
      const allLessons = (await toraLessonsService?.getAll()) ?? [];
      return allLessons.filter((lesson: ToraLesson) => lesson.enabled);
    },
    enabled: toraLessonsService !== null && toraLessonsService !== undefined,
  });
};
