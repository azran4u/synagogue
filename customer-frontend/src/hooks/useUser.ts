import { useMemo } from "react";
import { useAuth } from "./useAuth";
import { useIsAdmin } from "./useIsAdmin";
import { useIsGabai } from "./useIsGabai";
import { usePrayerCard } from "./usePrayerCard";

export function useUser() {
  const isAdmin = useIsAdmin();
  const isGabai = useIsGabai();
  const { user } = useAuth();
  const { data: prayerCard } = usePrayerCard();

  const isMember = useMemo(() => {
    return prayerCard != null;
  }, [prayerCard]);

  const isGabaiOrHigher = useMemo(() => {
    return isAdmin || isGabai;
  }, [isAdmin, isGabai]);

  const displayName = useMemo(() => {
    if (prayerCard)
      return prayerCard?.prayer.firstName + " " + prayerCard?.prayer.lastName;
    if (user) return user.displayName;
    return "";
  }, [prayerCard]);

  const email = useMemo(() => {
    return user?.email;
  }, [user]);

  return {
    isAdmin,
    isGabai,
    isGabaiOrHigher,
    isMember,
    displayName,
    email,
  };
}
