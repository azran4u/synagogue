import React, { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  synagogueActions,
  selectSelectedSynagogueId,
} from "../store/synagogueSlice";
import { useIsSynagogueExists } from "../hooks/useSynagogues";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { useSynagogueServices } from "../hooks/useSynagogueServices";
import { useSynagogueCacheClear } from "../hooks/useSynagogueCacheClear";

interface SynagogueProviderProps {
  children: React.ReactNode;
}

export const SynagogueProvider: React.FC<SynagogueProviderProps> = ({
  children,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedSynagogueId = useAppSelector(selectSelectedSynagogueId);

  //   read current url
  const currentUrl = window.location.href;
  const synagogueId = useMemo(() => {
    console.log("currentUrl", currentUrl);
    let synagogueId = currentUrl.split("/synagogue/")[1];
    if (synagogueId == undefined) {
      return null;
    }
    if (synagogueId.includes("/")) {
      return synagogueId.split("/")[0];
    }
    return synagogueId;
  }, [currentUrl]);

  useEffect(() => {
    if (synagogueId) {
      dispatch(synagogueActions.setSelectedSynagogue({ id: synagogueId }));
    } else {
      dispatch(synagogueActions.clearSelectedSynagogue());
    }
  }, [synagogueId]);

  // Use the hook to fetch synagogue data if we have an ID but no synagogue object
  const {
    data: isSynagogueExists,
    isLoading,
    error,
  } = useIsSynagogueExists(selectedSynagogueId);

  useEffect(() => {
    if (isSynagogueExists == null) return;
    if (!isSynagogueExists) {
      navigate("/synagogues");
    }
  }, [isSynagogueExists]);

  useSynagogueServices();

  // Clear React Query cache when switching synagogues to prevent stale data
  useSynagogueCacheClear();

  return <>{children}</>;
};
