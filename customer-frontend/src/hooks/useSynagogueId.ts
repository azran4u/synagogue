import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import { useAppSelector } from "../store/hooks";
import { useSynagogue } from "./useSynagogues";

export function useSelectedSynagogue() {
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  return useSynagogue(synagogueId);
}
