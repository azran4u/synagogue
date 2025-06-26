import { useAuth } from "./useAuth";
import { usePrayerCardById } from "./usePrayerCardById";

export function useCurrentUserPrayerCard() {
  const { user } = useAuth();
  return usePrayerCardById(user?.email || null);
}
