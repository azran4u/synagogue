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
import type { UpcomingItem } from "./prayerUtils";

/**
 * Internal representation of prayer with aliya history
 * Used in AdminAliyaHistoryPage for processing
 */
interface PrayerWithAliyaHistory {
  prayer: Prayer;
  prayerCard: PrayerCard;
  isChild: boolean;
  categoryColumns: Map<
    string,
    { lastParashaDate: any; lastParasha: string | null; count: number }
  >;
  overallLastAliyaDate: HebrewDate | null;
  totalAliyot: number;
}

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
  prayersWithHistory: PrayerWithAliyaHistory[],
  allColumns: Map<string, { name: string; isCategory: boolean }>,
  upcomingItems: UpcomingItem[],
  eventTypeMap: Map<string, string>,
  categories: AliyaTypeCategory[] = [],
  earliestAliyaDate: HebrewDate | null = null
): AliyaHistoryExportData => {
  // 1. Convert columns map to ordered array and sort by displayOrder
  const categoryDisplayOrderMap = new Map<string, number>();
  categories.forEach(category => {
    categoryDisplayOrderMap.set(category.id, category.displayOrder ?? Infinity);
  });

  const columns: ColumnDefinition[] = Array.from(allColumns.entries())
    .map(([id, col]) => ({
      id,
      name: col.name,
      isCategory: col.isCategory,
      displayOrder: col.isCategory
        ? (categoryDisplayOrderMap.get(id) ?? Infinity)
        : Infinity,
    }))
    .sort((a, b) => {
      // Categories first (sorted by displayOrder), then uncategorized types
      if (a.isCategory !== b.isCategory) {
        return a.isCategory ? -1 : 1;
      }
      // Within categories, sort by displayOrder (lower values first)
      return a.displayOrder - b.displayOrder;
    });

  // 2. Prepare prayer rows
  // Format prayer names ONCE here: "משה כהן בן של דוד כהן" for children
  const prayerRows: ExportPrayerRow[] = prayersWithHistory
    .map(prayer => {
      const prayerName = prayer.isChild
        ? `${prayer.prayer.fullName} בן של ${prayer.prayerCard.prayer.fullName}`
        : prayer.prayer.fullName;

      // Convert internal category columns to export format
      // Calculate weeks since last aliya
      const categoryData = new Map<string, CategoryColumnData>();
      prayer.categoryColumns.forEach((value, key) => {
        let weeksSinceLastAliya = -1;

        if (earliestAliyaDate) {
          const currentDate = HebrewDate.now();
          const weeksSinceEarliest = Math.floor(
            (currentDate.toGregorianDate().getTime() -
              earliestAliyaDate.toGregorianDate().getTime()) /
              (1000 * 60 * 60 * 24 * 7)
          );

          if (value.lastParashaDate) {
            // If there's a last aliya date for this category, calculate the difference
            const lastAliyaDate = value.lastParashaDate as HebrewDate;
            const weeksSinceLastAliyaDate = Math.floor(
              (currentDate.toGregorianDate().getTime() -
                lastAliyaDate.toGregorianDate().getTime()) /
                (1000 * 60 * 60 * 24 * 7)
            );

            weeksSinceLastAliya = weeksSinceEarliest - weeksSinceLastAliyaDate;
          } else {
            // If no aliya in this category, count all weeks since earliest
            weeksSinceLastAliya = weeksSinceEarliest;
          }
        }

        categoryData.set(key, {
          count: value.count,
          weeksSinceLastAliya,
        });
      });

      return {
        prayerName,
        isChild: prayer.isChild,
        categoryData,
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
      notes: item.event?.notes || "-",
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
