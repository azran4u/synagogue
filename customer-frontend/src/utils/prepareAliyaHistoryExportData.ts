import { Prayer } from "../model/Prayer";
import { PrayerCard } from "../model/Prayer";
import { HebrewDate } from "../model/HebrewDate";
import { AliyaTypeCategory } from "../model/AliyaTypeCategory";
import {
  ColumnDefinition,
  ExportPrayerRow,
  ExportUpcomingEventRow,
  AliyaHistoryExportData,
  CategoryColumnData,
} from "./aliyaHistoryExportTypes";
import type { AliyaHistory, UpcomingItem } from "./prayerUtils";

/**
 * Prepare aliya history export data.
 * This is the SINGLE SOURCE OF TRUTH for formatting all export data.
 * Both PDF and XLSX exporters consume this prepared data.
 *
 * @param prayersWithHistory - Prayers with their category-based aliya data
 * @param allColumns - Map of all columns (categories + uncategorized types)
 * @param upcomingItems - Upcoming events/birthdays
 * @param eventTypeMap - Map of event type IDs to Hebrew names
 * @param categories - Array of categories for sorting by displayOrder
 * @param earliestAliyaDate - Earliest aliya date in the system for calculating weeks
 * @returns Prepared export data
 */
export const prepareAliyaHistoryExportData = (
  AliyaHistory: AliyaHistory,
  upcomingItems: UpcomingItem[],
  eventTypeMap: Map<string, string>
): AliyaHistoryExportData => {
  const columnMap = new Map<string, ColumnDefinition>();
  Array.from(AliyaHistory.entries()).forEach(([prayerId, history]) => {
    history.categoryData.forEach((categoryData, categoryId) => {
      columnMap.set(categoryId, {
        id: categoryId,
        name: categoryData.categoryName,
        displayOrder: categoryData.categoryDisplayOrder,
      });
    });
  });
  const columns: ColumnDefinition[] = Array.from(columnMap.values()).sort(
    (a, b) => (a.displayOrder ?? Infinity) - (b.displayOrder ?? Infinity)
  );
  // 2. Prepare prayer rows
  // Format prayer names ONCE here: "משה כהן בן של דוד כהן" for children
  const prayerRows: ExportPrayerRow[] = Array.from(AliyaHistory.entries())
    .map(([prayerId, history]) => {
      return {
        prayerName: history.prayerName,
        categoryData: new Map(
          Array.from(history.categoryData.entries()).map(
            ([categoryId, categoryData]) => [
              categoryId,
              {
                weeksSinceLastAliya: categoryData.weeksSinceLastAliya,
                count: categoryData.count,
              },
            ]
          )
        ),
      };
    })
    .sort((a, b) => {
      // Sort by the first column's weeks since last aliya (highest to lowest)
      const firstColumnId = columns[0]?.id;
      if (!firstColumnId) return 0;

      const aData = a.categoryData.get(firstColumnId);
      const bData = b.categoryData.get(firstColumnId);

      const aWeeks = aData?.weeksSinceLastAliya ?? -1;
      const bWeeks = bData?.weeksSinceLastAliya ?? -1;

      return bWeeks - aWeeks; // Highest to lowest
    });

  // 3. Prepare upcoming events rows
  // Format prayer names ONCE here: "משה כהן בן של דוד כהן" for children
  const upcomingEvents: ExportUpcomingEventRow[] = upcomingItems.map(item => {
    const prayerName = item.isChild
      ? `${item.prayer.fullName} בן של ${item.prayerCard.prayer.fullName}`
      : item.prayer.fullName;

    return {
      prayerName,
      parasha: item.hebrewDate.getParasha(),
      eventType:
        item.type === "birthday"
          ? "יום הולדת"
          : eventTypeMap.get(item.event?.type || "") ||
            item.event?.type ||
            "אירוע",
      age: item.age || "-",
      notes:
        item.type === "birthday"
          ? item.hebrewDate.toString()
          : item.event?.notes || "-",
    };
  });

  // 4. Generate date string using HebrewDate to avoid gibberish
  const generatedDate = HebrewDate.now().toString();

  return {
    columns,
    prayerRows,
    upcomingEvents,
    generatedDate,
  };
};
