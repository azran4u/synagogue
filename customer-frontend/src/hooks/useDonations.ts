import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Donation } from "../model/Donation";
import { useSynagogueServices } from "./useSynagogueServices";

// Get all donations for a synagogue
export const useDonations = () => {
  const { donationsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["donations"],
    queryFn: async () => donationsService?.getAll() ?? [],
    enabled: donationsService !== null && donationsService !== undefined,
  });
};

// Get a single donation by ID
export const useDonationById = (donationId?: string) => {
  const { donationsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["donations", donationId],
    queryFn: async () => donationsService?.getById(donationId!) ?? null,
    enabled:
      !!donationId &&
      donationsService !== null &&
      donationsService !== undefined,
  });
};

// Create a new donation
export const useCreateDonation = () => {
  const { donationsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donation: Donation) =>
      donationsService?.insertWithId(donation.id, donation) ??
      Promise.resolve(null),
    onError: error => {
      console.error("Failed to create donation:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
  });
};

// Update an existing donation
export const useUpdateDonation = () => {
  const { donationsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donation: Donation) =>
      donationsService?.update(donation.id, donation) ?? Promise.resolve(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: error => {
      console.error("Failed to update donation:", error);
    },
  });
};

// Delete a donation
export const useDeleteDonation = () => {
  const { donationsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (donationId: string) =>
      donationsService?.deleteById(donationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
    onError: error => {
      console.error("Failed to delete donation:", error);
    },
  });
};

// Get all enabled donations
export const useEnabledDonations = () => {
  const { donationsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["donations", "enabled"],
    queryFn: async () => {
      const allDonations = (await donationsService?.getAll()) ?? [];
      return allDonations.filter((donation: Donation) => donation.enabled);
    },
    enabled: donationsService !== null && donationsService !== undefined,
  });
};
