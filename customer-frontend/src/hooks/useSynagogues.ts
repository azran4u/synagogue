import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GenericService } from "../services/genericService";
import { Synagogue, SynagogueDto, synagogueMapper } from "../model/Synagogue";

export const synagogueService = new GenericService<Synagogue, SynagogueDto>(
  "synagogues",
  synagogueMapper
);

// Query hooks
export function useSynagogues() {
  return useQuery<Synagogue[]>({
    queryKey: ["synagogues"],
    queryFn: () => synagogueService.getAll(),
  });
}

export function useSynagogue(id?: string | null) {
  return useQuery<Synagogue | null>({
    queryKey: ["synagogue", id],
    queryFn: () => (id ? synagogueService.getById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useIsSynagogueExists(id?: string | null) {
  return useQuery<boolean | null>({
    queryKey: ["synagogueExists", id],
    queryFn: () => (id ? synagogueService.isExists(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}
// Mutation hooks
export function useCreateSynagogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (synagogue: Synagogue) => synagogueService.insert(synagogue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["synagogues"] });
    },
  });
}

export function useUpdateSynagogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, synagogue }: { id: string; synagogue: Synagogue }) =>
      synagogueService.update(id, synagogue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["synagogues"] });
    },
  });
}

export function useDeleteSynagogue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => synagogueService.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["synagogues"] });
    },
  });
}
