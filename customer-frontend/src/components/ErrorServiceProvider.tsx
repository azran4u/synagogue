import React, { useEffect } from "react";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../hooks/useAuth";
import { errorService } from "../services/errorService";

interface ErrorServiceProviderProps {
  children: React.ReactNode;
}

export const ErrorServiceProvider: React.FC<ErrorServiceProviderProps> = ({
  children,
}) => {
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  const { user } = useAuth();

  useEffect(() => {
    // Update error service with current user context
    errorService.updateUserContext(
      synagogueId || undefined,
      user?.uid,
      user?.email || undefined
    );
  }, [synagogueId, user?.uid, user?.email]);

  return <>{children}</>;
};
