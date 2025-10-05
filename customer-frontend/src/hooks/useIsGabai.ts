import { useQuery } from "@tanstack/react-query";
import { useSynagogueServices } from "./useSynagogueServices";
import { useAuth } from "./useAuth";

export function useGabai(email?: string | null) {
  const { gabaimService } = useSynagogueServices();
  return useQuery({
    queryKey: ["gabaim", email],
    queryFn: () => gabaimService?.isExists(email!) || false,
    enabled: gabaimService != null && gabaimService != undefined && !!email,
  });
}

export function useIsGabai(): boolean {
  const { user } = useAuth();
  const { data: gabai } = useGabai(user?.email);
  if (user?.email && gabai) return true;
  return false;
}
