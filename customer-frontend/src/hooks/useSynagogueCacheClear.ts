import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppSelector } from "../store/hooks";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";

/**
 * Hook that automatically clears React Query cache when synagogue ID changes
 *
 * This ensures that:
 * - Data from the previous synagogue doesn't persist in the new context
 * - All synagogue-specific queries are refreshed when switching synagogues
 * - No stale data is displayed from the previous synagogue
 *
 * This hook should be used at the app level (e.g., in SynagogueProvider)
 * to automatically handle cache clearing when users switch between synagogues.
 */
export function useSynagogueCacheClear() {
  const queryClient = useQueryClient();
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  const previousSynagogueId = useRef<string | null>(null);

  useEffect(() => {
    // If synagogue ID has changed (and it's not the initial load)
    if (
      previousSynagogueId.current !== null &&
      previousSynagogueId.current !== synagogueId
    ) {
      // Clear all synagogue-specific React Query cache
      // This includes all queries that depend on synagogue data
      queryClient.removeQueries();

      console.log(
        `🔄 Synagogue changed from ${previousSynagogueId.current} to ${synagogueId}. React Query cache cleared.`
      );
    }

    previousSynagogueId.current = synagogueId;
  }, [synagogueId, queryClient]);
}
