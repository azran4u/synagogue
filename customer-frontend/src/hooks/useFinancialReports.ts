import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { financialReportsService } from "../services/FinancialReportService";
import { FinancialReport } from "../model/FinancialReports";

// Hook to get all financial reports
export const useFinancialReports = () => {
  return useQuery<FinancialReport[]>({
    queryKey: ["financialReports"],
    queryFn: () => financialReportsService.getAll(),
  });
};

// Hook to get a specific financial report by ID
export const useFinancialReportById = (id: string) => {
  return useQuery<FinancialReport>({
    queryKey: ["financialReports", id],
    queryFn: () => financialReportsService.getById(id),
    enabled: !!id,
  });
};

// Hook to add a new financial report
export const useAddFinancialReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (report: FinancialReport) =>
      financialReportsService.insert(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialReports"] });
    },
  });
};

// Hook to update a financial report
export const useUpdateFinancialReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, report }: { id: string; report: FinancialReport }) =>
      financialReportsService.update(id, report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialReports"] });
    },
  });
};

// Hook to delete a financial report
export const useDeleteFinancialReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => financialReportsService.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financialReports"] });
    },
  });
};
