import * as XLSX from "xlsx";
import { AliyaHistoryExportData } from "./aliyaHistoryExportTypes";

/**
 * Generate XLSX export for aliya history.
 * This is a DUMB RENDERER - it just takes the pre-formatted data and outputs it to Excel.
 * All formatting logic (including prayer names) is done in prepareAliyaHistoryExportData.
 */
export const generateAliyaHistoryXlsx = (
  exportData: AliyaHistoryExportData
) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Aliya History
  const historyHeaders = ["שם המתפלל"];
  exportData.columns.forEach(col => {
    historyHeaders.push(`${col.name} - שבועות מאז עלייה אחרונה`);
    historyHeaders.push(`${col.name} - כמות`);
  });

  const historyData = exportData.prayerRows.map(row => {
    const dataRow: any[] = [row.prayerName]; // Pre-formatted!
    exportData.columns.forEach(col => {
      const data = row.categoryData.get(col.id);
      dataRow.push(
        data?.weeksSinceLastAliya !== undefined ? data.weeksSinceLastAliya : "-"
      );
      dataRow.push(data?.count || 0);
    });
    return dataRow;
  });

  const historySheet = XLSX.utils.aoa_to_sheet([
    historyHeaders,
    ...historyData,
  ]);
  XLSX.utils.book_append_sheet(wb, historySheet, "היסטוריית עליות");

  // Sheet 2: Upcoming Events (if any)
  if (exportData.upcomingEvents.length > 0) {
    const upcomingHeaders = ["שם המתפלל", "פרשה", "סוג אירוע", "גיל", "הערות"];
    const upcomingData = exportData.upcomingEvents.map(event => [
      event.prayerName, // Pre-formatted!
      event.parasha,
      event.eventType,
      event.age,
      event.notes,
    ]);

    const upcomingSheet = XLSX.utils.aoa_to_sheet([
      upcomingHeaders,
      ...upcomingData,
    ]);
    XLSX.utils.book_append_sheet(wb, upcomingSheet, "אירועים קרובים");
  }

  // Download
  const filename = `aliya-history-${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
};
