import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "./useAuth";
import { useMemo } from "react";

export function useAdminActions() {
  const { token } = useAuth();
  const instance = useMemo(() => {
    return axios.create({
      baseURL: "https://controller-b4jr2a7toq-uc.a.run.app",
      timeout: 5 * 60 * 1000, // 5 minutes
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }, [token]);

  const {
    mutate: sync,
    isPending: syncLoading,
    data: syncData,
    error: syncError,
  } = useMutation<string>({
    mutationFn: async () => {
      const response = await instance.get<string>("/sync");
      return response.data;
    },
  });

  const {
    mutate: exportFn,
    isPending: exportLoading,
    data: exportData,
    error: exportError,
  } = useMutation<string>({
    mutationFn: async () => {
      const response = await instance.get<string>("/export");
      return response.data;
    },
  });

  return { sync, syncLoading, syncData, syncError, exportFn, exportLoading, exportData, exportError };
}
