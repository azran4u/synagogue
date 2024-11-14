import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../shared/services/firebase-config";

export function useIsAdmin() {
  const [user] = useAuthState(auth);
  const adminWhitelist = ["azran4u@gmail.com"];
  if (!user?.email) return false;
  return adminWhitelist.includes(user?.email);
}
