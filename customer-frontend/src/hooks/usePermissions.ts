import { useIsAdmin } from "./useIsAdmin";

export function usePermissions() {
  const isAdmin = useIsAdmin();

  return {
    isAdmin,
  };
}
