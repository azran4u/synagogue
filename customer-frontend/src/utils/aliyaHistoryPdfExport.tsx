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
import { AliyaHistoryExportData } from "./aliyaHistoryExportTypes";

// Register Hebrew font with proper configuration
Font.register({
  family: "NotoSansHebrew",
  fonts: [{ src: "/assets/fonts/NotoSansHebrew-Regular.ttf" }],
});

// This is now a DUMB RENDERER - it just displays pre-formatted data
// All formatting logic is in prepareAliyaHistoryExportData.ts

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
    fontSize: 5,
    padding: 2,
    flex: 2,
    textAlign: "center",
    color: "#34495e",
    direction: "rtl",
    fontFamily: "NotoSansHebrew",
  },
});

// PDF Document Component - Just renders the pre-formatted data
const AliyaHistoryPDF: React.FC<{
  exportData: AliyaHistoryExportData;
}> = ({ exportData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <Text style={styles.title}>דוח היסטוריית עליות ואירועים קרובים</Text>
        <Text style={styles.subtitle}>נוצר ב {exportData.generatedDate}</Text>

        {/* Upcoming Events Section */}
        {exportData.upcomingEvents.length > 0 && (
          <>
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
              {exportData.upcomingEvents.map((event, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.prayerNameCell}>{event.prayerName}</Text>
                  <Text style={styles.tableCell}>{event.parasha}</Text>
                  <Text style={styles.tableCell}>{event.eventType}</Text>
                  <Text style={styles.tableCell}>{event.age}</Text>
                  <Text style={styles.tableCell}>{event.notes}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Aliya History Section - Dynamic columns based on categories */}
        <Text style={styles.sectionHeader}>היסטוריית עליות</Text>
        <View style={styles.table}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={styles.prayerNameCell}>שם המתפלל</Text>
            {exportData.columns.map(col => (
              <React.Fragment key={col.id}>
                <Text style={styles.tableHeader}>{col.name} - שבועות מאז</Text>
                <Text style={styles.tableHeader}>{col.name} - כמות</Text>
              </React.Fragment>
            ))}
          </View>
          {/* Data Rows */}
          {exportData.prayerRows.map((row, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={styles.prayerNameCell}>{row.prayerName}</Text>
              {exportData.columns.map(col => {
                const data = row.categoryData.get(col.id);
                return (
                  <React.Fragment key={col.id}>
                    <Text style={styles.tableCell}>
                      {data?.weeksSinceLastAliya !== undefined
                        ? data.weeksSinceLastAliya
                        : "-"}
                    </Text>
                    <Text style={styles.tableCell}>{data?.count || 0}</Text>
                  </React.Fragment>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

// This function is now a DUMB RENDERER
// It just takes the pre-formatted exportData and renders it to PDF
export const generateAliyaHistoryPdf = async (
  exportData: AliyaHistoryExportData
) => {
  // Generate PDF blob
  const blob = await pdf(<AliyaHistoryPDF exportData={exportData} />).toBlob();

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
