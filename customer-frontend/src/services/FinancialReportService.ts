import { financialReportsMapper } from "../model/FinancialReports";
import { GenericService } from "./genericService";

// Export singleton instancePrayerTimesService();
export const financialReportsService = new GenericService(
  "/financialReports",
  financialReportsMapper
);
