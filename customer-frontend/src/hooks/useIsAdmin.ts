import { useQuery } from "@tanstack/react-query";
import { Admin, AdminDto, adminMapper } from "../model/Admin";
import { GenericService } from "../services/genericService";
import { useAuth } from "./useAuth";

export const adminService = new GenericService<Admin, AdminDto>(
  "admins",
  adminMapper
);

export function useAdmin(email?: string | null) {
  return useQuery({
    queryKey: ["admins", email],
    queryFn: () => adminService.isExists(email!),
    enabled: !!email,
  });
}

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  const { data: admin } = useAdmin(user?.email);
  if (user?.email && admin) return true;
  return false;
}
