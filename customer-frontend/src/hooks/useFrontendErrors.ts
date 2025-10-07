import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { frontendErrorService } from "../services/frontendErrorService";

export const useAllFrontendErrors = () => {
  return useQuery({
    queryKey: ["frontendErrors"],
    queryFn: async () => {
      const errors = await frontendErrorService.getAll();
      // Sort by timestamp descending (newest first)
      return errors.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    },
    enabled:
      frontendErrorService !== null && frontendErrorService !== undefined,
  });
};

export const useDeleteFrontendError = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await frontendErrorService.deleteById(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frontendErrors"] });
    },
    onError: error => {
      console.error("Failed to delete frontend error:", error);
    },
  });
};
