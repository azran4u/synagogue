import React, { useEffect } from "react";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import { useAppSelector } from "../store/hooks";
import { useAuth } from "../hooks/useAuth";
import { frontendErrorService } from "../services/frontendErrorService";

interface FrontendErrorServiceProviderProps {
  children: React.ReactNode;
}

export const FrontendErrorServiceProvider: React.FC<
  FrontendErrorServiceProviderProps
> = ({ children }) => {
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  const { user } = useAuth();

  useEffect(() => {
    // Update error service with current user context
    frontendErrorService.updateUserContext(
      synagogueId || undefined,
      user?.uid,
      user?.email || undefined
    );
  }, [synagogueId, user?.uid, user?.email]);

  return <>{children}</>;
};
