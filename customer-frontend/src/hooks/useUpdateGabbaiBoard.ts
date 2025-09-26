import { useMutation, useQueryClient } from "@tanstack/react-query";
import { gabbaiBoardService } from "../services/GabbaiBoardService";
import { GabbaiBoard } from "../model/GabbaiBoard";

export const useUpdateGabbaiBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gabbaiBoard,
      updatedBy,
    }: {
      gabbaiBoard: GabbaiBoard;
      updatedBy: string;
    }) => {
      try {
        // GabbaiBoard is a singleton, so we update the first document
        const boards = await gabbaiBoardService.getAll();
        if (boards.length > 0) {
          await gabbaiBoardService.update(boards[0].id, gabbaiBoard);
        } else {
          // Create if it doesn't exist
          await gabbaiBoardService.insert(gabbaiBoard);
        }
        return gabbaiBoard;
      } catch (error) {
        console.error("Error updating gabbai board:", error);
        throw error;
      }
    },
    onSuccess: updatedGabbaiBoard => {
      // Invalidate and refetch gabbai board queries
      queryClient.invalidateQueries({ queryKey: ["gabbaiBoard"] });
      queryClient.invalidateQueries({ queryKey: ["gabbaiBoardLookaheadDays"] });

      // Update the cache with the new data
      queryClient.setQueryData(["gabbaiBoard"], updatedGabbaiBoard);
    },
    onError: error => {
      console.error("Failed to update gabbai board:", error);
    },
  });
};
