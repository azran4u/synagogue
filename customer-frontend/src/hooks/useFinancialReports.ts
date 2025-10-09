import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FinancialReport } from "../model/FinancialReports";
import { useSynagogueServices } from "./useSynagogueServices";

// Get all financial reports for a synagogue
export const useFinancialReports = () => {
  const { financialReportsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["financialReports"],
    queryFn: async () => financialReportsService?.getAll() ?? [],
    enabled:
      financialReportsService !== null && financialReportsService !== undefined,
  });
};

// Get a single financial report by ID
export const useFinancialReportById = (reportId?: string) => {
  const { financialReportsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["financialReports", reportId],
    queryFn: async () => financialReportsService?.getById(reportId!) ?? null,
    enabled:
      !!reportId &&
      financialReportsService !== null &&
      financialReportsService !== undefined,
  });
};

// Create a new financial report
export const useCreateFinancialReport = () => {
  const { financialReportsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: FinancialReport) =>
      financialReportsService?.insertWithId(report.id, report) ??
      Promise.resolve(null),
    onError: error => {
      console.error("Failed to create financial report:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialReports"] });
    },
  });
};

// Update an existing financial report
export const useUpdateFinancialReport = () => {
  const { financialReportsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: FinancialReport) =>
      financialReportsService?.update(report.id, report) ??
      Promise.resolve(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialReports"] });
    },
    onError: error => {
      console.error("Failed to update financial report:", error);
    },
  });
};

// Delete a financial report
export const useDeleteFinancialReport = () => {
  const { financialReportsService } = useSynagogueServices();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) =>
      financialReportsService?.deleteById(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialReports"] });
    },
    onError: error => {
      console.error("Failed to delete financial report:", error);
    },
  });
};

// Get all enabled financial reports
export const useEnabledFinancialReports = () => {
  const { financialReportsService } = useSynagogueServices();

  return useQuery({
    queryKey: ["financialReports", "enabled"],
    queryFn: async () => {
      const allReports = (await financialReportsService?.getAll()) ?? [];
      return allReports.filter((report: FinancialReport) => report.enabled);
    },
    enabled:
      financialReportsService !== null && financialReportsService !== undefined,
  });
};
