import { useAuth } from "./useAuth";

export function useCurrentUserEmail() {
  const { user } = useAuth();
  return user?.email ?? null;
}
