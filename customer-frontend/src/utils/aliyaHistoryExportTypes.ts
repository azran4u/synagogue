/**
 * Shared type definitions for aliya history export data.
 * Used by both PDF and XLSX exporters.
 */

export interface ColumnDefinition {
  id: string; // categoryId or aliyaTypeId
  name: string; // Display name (category name or AliyaType displayName)
  isCategory: boolean; // true if this is a category, false if uncategorized AliyaType
  displayOrder?: number; // Sort order (lower values first)
}

export interface CategoryColumnData {
  count: number; // Number of aliyot in this category/type
  weeksSinceLastAliya: number; // Weeks since last aliya in this category (compared to earliest aliya)
}

// Internal representation used in AdminAliyaHistoryPage
export interface CategoryColumnDataInternal {
  lastParashaDate: any; // Internal tracking (HebrewDate or Date)
  lastParasha: string | null;
  count: number;
  weeksSinceLastAliya: number; // Weeks since last aliya
}

export interface ExportPrayerRow {
  prayerName: string; // Already formatted: "משה כהן בן של דוד כהן" or "דוד כהן"
  isChild: boolean;
  categoryData: Map<string, CategoryColumnData>; // key: columnId
}

export interface ExportUpcomingEventRow {
  prayerName: string; // Already formatted: "משה כהן בן של דוד כהן" or "דוד כהן"
  parasha: string; // Parasha name
  eventType: string; // Event type in Hebrew
  age: string | number; // Age or "-"
  notes: string; // Notes or "-"
}

export interface AliyaHistoryExportData {
  columns: ColumnDefinition[]; // Ordered list of columns
  prayerRows: ExportPrayerRow[];
  upcomingEvents: ExportUpcomingEventRow[];
  generatedDate: string; // Formatted date string
}
