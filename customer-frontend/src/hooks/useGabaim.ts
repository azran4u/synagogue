import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Admin } from "../model/Admin";
import { useSynagogueServices } from "./useSynagogueServices";
import { useAuth } from "./useAuth";

// Get all gabaim for a synagogue
export const useGabaim = () => {
  const { gabaimService } = useSynagogueServices();

  return useQuery({
    queryKey: ["gabaim"],
    queryFn: async () => gabaimService?.getAll() ?? [],
    enabled: gabaimService !== null && gabaimService !== undefined,
  });
};

// Add a new gabai
export const useAddGabai = () => {
  const { gabaimService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const gabai = Admin.create(email);
      return gabaimService?.insertWithId(email, gabai) ?? Promise.resolve(null);
    },
    onError: error => {
      console.error("Failed to add gabai:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gabaim"] });
    },
  });
};

// Remove a gabai
export const useRemoveGabai = () => {
  const { gabaimService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => gabaimService?.deleteById(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gabaim"] });
    },
    onError: error => {
      console.error("Failed to remove gabai:", error);
    },
  });
};

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
