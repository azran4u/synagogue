import { useQuery } from "@tanstack/react-query";
import { financialReportsService } from "../services/FinancialReportService";
import { FinancialReport } from "../model/FinancialReports";

// Hook to get all financial reports
export const useFinancialReports = () => {
  return useQuery<FinancialReport[]>({
    queryKey: ["financialReports"],
    queryFn: async () => financialReportsService.getAll(),
    placeholderData: [],
  });
};
