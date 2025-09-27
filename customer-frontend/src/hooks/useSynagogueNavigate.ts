import { useNavigate } from "react-router-dom";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import { useAppSelector } from "../store/hooks";

export function useSynagogueNavigate() {
  const navigate = useNavigate();
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  return (path: string, addSynagogueId: boolean = true) => {
    if (addSynagogueId && path !== null && synagogueId !== null) {
      path = `/synagogue/${synagogueId}/${path}`;
    }
    if (addSynagogueId && synagogueId === null) {
      path = `/synagogues`;
    }
    if (!addSynagogueId && path !== null) {
      path = `/${path}`;
    }
    path = path.replace("//", "/");
    navigate(path);
  };
}
