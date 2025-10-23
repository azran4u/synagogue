import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from "@react-pdf/renderer";
import { PrayerCard } from "../model/Prayer";
import { PrayerEventType } from "../model/PrayerEventType";
import { HebrewDate } from "../model/HebrewDate";
import { calculateUpcomingItems, UpcomingItem } from "./prayerUtils";

// Register Hebrew font with proper configuration
Font.register({
  family: "NotoSansHebrew",
  fonts: [{ src: "/assets/fonts/NotoSansHebrew-Regular.ttf" }],
});

// Helper function to get parasha name for a Hebrew date
const getParashaForHebrewDate = (hebrewDate: HebrewDate): string => {
  // This is a simplified implementation - in a real app you'd use a proper parasha calculation library
  // For now, we'll return a placeholder that shows the Hebrew date
  return `${hebrewDate.getParasha()}`;
};

// Helper function to calculate weeks since a Hebrew date
const getWeeksSinceHebrewDate = (hebrewDate: HebrewDate): number => {
  const today = HebrewDate.now();
  const gregorianToday = today.toGregorianDate();
  const gregorianDate = hebrewDate.toGregorianDate();

  const diffTime = gregorianToday.getTime() - gregorianDate.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

  return diffWeeks;
};

interface PrayerWithAliyaHistory {
  prayer: any; // Prayer type
  prayerCard: PrayerCard;
  isChild: boolean;
  lastAliyaDate: HebrewDate | null;
  lastAliyaGroupLabel: string | null;
  lastAliyaTypeName: string | null;
  totalAliyot: number;
  daysSinceLastAliya: number | null;
}

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
    fontFamily: "NotoSansHebrew",
    direction: "rtl",
  },
  title: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 9,
    marginBottom: 15,
    textAlign: "center",
    color: "#7f8c8d",
  },
  sectionHeader: {
    fontSize: 8,
    marginBottom: 4,
    marginTop: 6,
    fontWeight: "bold",
    color: "#34495e",
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#cccccc",
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "solid",
  },
  tableHeader: {
    backgroundColor: "#ecf0f1",
    fontWeight: "bold",
    fontSize: 6,
    color: "#2c3e50",
    padding: 2,
    flex: 1,
    textAlign: "center",
    direction: "rtl",
    fontFamily: "NotoSansHebrew",
  },
  tableCell: {
    fontSize: 5,
    padding: 2,
    flex: 1,
    textAlign: "center",
    color: "#34495e",
    direction: "rtl",
    fontFamily: "NotoSansHebrew",
  },
  prayerNameCell: {
    backgroundColor: "#ecf0f1",
    fontSize: 5,
    padding: 2,
    flex: 2,
    textAlign: "center",
    color: "#34495e",
    direction: "rtl",
    fontFamily: "NotoSansHebrew",
  },
  tableContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  tableHalf: {
    width: "48%",
  },
});

// PDF Document Component
const AliyaHistoryPDF: React.FC<{
  prayersWithHistory: PrayerWithAliyaHistory[];
  upcomingItems: UpcomingItem[];
  eventTypeMap: Map<string, string>;
  currentDate: string;
}> = ({ prayersWithHistory, upcomingItems, eventTypeMap, currentDate }) => {
  // Sort prayers by latest aliya date (newest first)
  const sortedPrayers = [...prayersWithHistory].sort((a, b) => {
    // Handle null dates - those without aliyot go to the end
    if (a.lastAliyaDate === null && b.lastAliyaDate === null) return 0;
    if (a.lastAliyaDate === null) return -1;
    if (b.lastAliyaDate === null) return 1;

    // Sort by date (newest first)
    return (
      b.lastAliyaDate!.toGregorianDate().getTime() -
      a.lastAliyaDate!.toGregorianDate().getTime()
    );
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>דוח היסטוריית עליות ואירועים קרובים</Text>
        <Text style={styles.subtitle}>נוצר ב {currentDate}</Text>

        {/* Upcoming Events Section - Full Width */}
        <Text style={styles.sectionHeader}>אירועים קרובים</Text>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={styles.prayerNameCell}>שם המתפלל</Text>
            <Text style={styles.tableHeader}>פרשה</Text>
            <Text style={styles.tableHeader}>סוג אירוע</Text>
            <Text style={styles.tableHeader}>גיל</Text>
            <Text style={styles.tableHeader}>הערות</Text>
          </View>
          {/* Data Rows */}
          {upcomingItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.prayerNameCell}>
                {item.isChild
                  ? `${item.prayer.fullName} בן של ${item.prayerCard.prayer.fullName}`
                  : item.prayer.fullName}
              </Text>
              <Text style={styles.tableCell}>
                {getParashaForHebrewDate(item.hebrewDate)}
              </Text>
              <Text style={styles.tableCell}>
                {item.type === "birthday"
                  ? "יום הולדת"
                  : eventTypeMap.get(item.event?.type || "") ||
                    item.event?.type ||
                    "אירוע"}
              </Text>
              <Text style={styles.tableCell}>
                {item.age ? `${item.age}` : "-"}
              </Text>
              <Text style={styles.tableCell}>{item.event?.notes || "-"}</Text>
            </View>
          ))}
        </View>

        {/* Aliya History Section - Split into Two Side by Side Tables */}
        <Text style={styles.sectionHeader}>היסטוריית עליות</Text>
        <View style={styles.tableContainer}>
          {/* Left Aliya History Table */}
          <View style={styles.tableHalf}>
            <View style={styles.table}>
              {/* Header Row */}
              <View style={styles.tableRow}>
                <Text style={styles.prayerNameCell}>שם המתפלל</Text>
                <Text style={styles.tableHeader}>פרשה אחרונה</Text>
                <Text style={styles.tableHeader}>שבועות מאז</Text>
                <Text style={styles.tableHeader}>סוג עלייה</Text>
              </View>
              {/* Data Rows - First Half */}
              {sortedPrayers
                .slice(0, Math.ceil(sortedPrayers.length / 2))
                .map((prayer, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.prayerNameCell}>
                      {prayer.isChild
                        ? `${prayer.prayer.fullName} בן של ${prayer.prayerCard.prayer.fullName}`
                        : prayer.prayer.fullName}
                    </Text>
                    <Text style={styles.tableCell}>
                      {prayer.lastAliyaDate
                        ? getParashaForHebrewDate(prayer.lastAliyaDate)
                        : "אין עליות"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {prayer.lastAliyaDate
                        ? `${getWeeksSinceHebrewDate(prayer.lastAliyaDate)}`
                        : "-"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {prayer.lastAliyaTypeName || "-"}
                    </Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Right Aliya History Table */}
          <View style={styles.tableHalf}>
            <View style={styles.table}>
              {/* Header Row */}
              <View style={styles.tableRow}>
                <Text style={styles.prayerNameCell}>שם המתפלל</Text>
                <Text style={styles.tableHeader}>פרשה אחרונה</Text>
                <Text style={styles.tableHeader}>שבועות מאז</Text>
                <Text style={styles.tableHeader}>סוג עלייה</Text>
              </View>
              {/* Data Rows - Second Half */}
              {sortedPrayers
                .slice(Math.ceil(sortedPrayers.length / 2))
                .map((prayer, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.prayerNameCell}>
                      {prayer.isChild
                        ? `${prayer.prayer.fullName} בן של ${prayer.prayerCard.prayer.fullName}`
                        : prayer.prayer.fullName}
                    </Text>
                    <Text style={styles.tableCell}>
                      {prayer.lastAliyaDate
                        ? getParashaForHebrewDate(prayer.lastAliyaDate)
                        : "אין עליות"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {prayer.lastAliyaDate
                        ? `${getWeeksSinceHebrewDate(prayer.lastAliyaDate)}`
                        : "-"}
                    </Text>
                    <Text style={styles.tableCell}>
                      {prayer.lastAliyaTypeName || "-"}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export const generateAliyaHistoryPdf = async (
  prayerCards: PrayerCard[] | undefined,
  prayersWithHistory: PrayerWithAliyaHistory[],
  prayerEventTypes: PrayerEventType[] | undefined
) => {
  if (!prayerCards) return;

  // Create event type map
  const eventTypeMap = new Map<string, string>();
  if (prayerEventTypes) {
    prayerEventTypes.forEach(eventType => {
      eventTypeMap.set(eventType.id, eventType.displayName);
    });
  }

  // Get upcoming events for next 14 days
  const upcomingItems = calculateUpcomingItems(prayerCards, 14);

  // Get current date for header
  const currentDate = HebrewDate.now().toString();

  // Generate PDF blob
  const blob = await pdf(
    <AliyaHistoryPDF
      prayersWithHistory={prayersWithHistory}
      upcomingItems={upcomingItems}
      eventTypeMap={eventTypeMap}
      currentDate={currentDate}
    />
  ).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `aliya-history-${new Date().toISOString().split("T")[0]}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
