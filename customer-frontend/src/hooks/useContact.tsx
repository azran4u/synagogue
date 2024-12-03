import { useQuery } from "@tanstack/react-query";
import { Contact } from "../model/contact";
import { contactService } from "../services/contactService";

export function useContact() {
  const { isFetching: isLoading, data: contacts } = useQuery<Contact[]>({
    queryKey: ["contact"],
    queryFn: async () => contactService.getAll(),
    initialData: [],
  });

  return { isLoading, contacts };
}
