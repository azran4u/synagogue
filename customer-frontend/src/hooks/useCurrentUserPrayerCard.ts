import { useAuth } from "./useAuth";
import { usePrayerCardById } from "./usePrayerCardById";

export function useCurrentUserPrayerCard() {
  const { user } = useAuth();
  return usePrayerCardById("azran4u@gmail.com");
}
