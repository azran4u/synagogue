import { FinancialReport } from "../model/FinancialReports";
import { HebrewDate } from "../model/HebrewDate";
import { financialReportsService } from "../services/FinancialReportService";

// Sample financial reports data
const sampleReports: FinancialReport[] = [
  FinancialReport.create(
    'דוח כספי רבעוני - רבעון ראשון תשפ"ה',
    new HebrewDate(5785, 1, 15), // 15 Nissan 5785
    "https://example.com/reports/q1-5785.pdf",
    "אלירן צדוק",
    "דוח כספי מפורט של הרבעון הראשון כולל הכנסות והוצאות מפורטות"
  ),

  FinancialReport.create(
    'דוח כספי רבעוני - רבעון שני תשפ"ה',
    new HebrewDate(5785, 4, 10), // 10 Av 5785
    "https://example.com/reports/q2-5785.pdf",
    "אלירן צדוק",
    "דוח כספי של הרבעון השני עם פירוט השקעות ותרומות"
  ),

  FinancialReport.create(
    'דוח כספי רבעוני - רבעון שלישי תשפ"ה',
    new HebrewDate(5785, 7, 5), // 5 Kislev 5785
    "https://example.com/reports/q3-5785.pdf",
    "דוד דיין",
    "דוח כספי של הרבעון השלישי כולל פירוט הוצאות תחזוקה"
  ),

  FinancialReport.create(
    'דוח כספי שנתי תשפ"ד',
    new HebrewDate(5784, 12, 20), // 20 Elul 5784
    "https://example.com/reports/annual-5784.pdf",
    "אלירן צדוק",
    'דוח כספי שנתי מפורט של שנת תשפ"ד עם סיכום כל הפעילות הכספית'
  ),

  FinancialReport.create(
    "דוח הוצאות שיפוץ בית הכנסת",
    new HebrewDate(5785, 2, 8), // 8 Iyar 5785
    "https://example.com/reports/renovation-5785.pdf",
    "דוד דיין",
    "דוח מפורט של הוצאות השיפוץ שנערך בבית הכנסת"
  ),

  FinancialReport.create(
    'דוח הכנסות תרומות תשפ"ה',
    new HebrewDate(5785, 6, 12), // 12 Tishrei 5785
    "https://example.com/reports/donations-5785.pdf",
    "אלירן צדוק",
    "דוח הכנסות מתרומות קהילתיות ומענקים"
  ),

  FinancialReport.create(
    'דוח תקציב חודשי - כסלו תשפ"ה',
    new HebrewDate(5785, 3, 1), // 1 Sivan 5785
    "https://example.com/reports/monthly-kislev-5785.pdf",
    "דוד דיין",
    "דוח תקציב חודשי מפורט של חודש כסלו"
  ),

  FinancialReport.create(
    'דוח הוצאות חגים תשפ"ה',
    new HebrewDate(5785, 1, 25), // 25 Nissan 5785
    "https://example.com/reports/holidays-5785.pdf",
    "אלירן צדוק",
    "דוח הוצאות מיוחדות לחגי תשרי ופסח"
  ),
];

// Seed functions
async function seedReports() {
  console.log("🌱 Seeding financial reports...");

  try {
    for (const report of sampleReports) {
      const id = await financialReportsService.insert(report);
      console.log(`✅ Created report: ${report.title} (ID: ${id})`);
      console.log(`   Published: ${report.formattedPublicationDate}`);
      console.log(`   By: ${report.publishedBy}`);
      if (report.hasNotes) {
        console.log(`   Notes: ${report.notes}`);
      }
      console.log("");
    }
    console.log(
      `🎉 Successfully seeded ${sampleReports.length} financial reports`
    );
  } catch (error) {
    console.error("❌ Error seeding reports:", error);
  }
}

async function clearReports() {
  console.log("🗑️ Clearing all financial reports...");

  try {
    const reports = await financialReportsService.getAll();
    for (const report of reports) {
      await financialReportsService.deleteById(report.id);
      console.log(`🗑️ Deleted report: ${report.title}`);
    }
    console.log("✅ All reports cleared");
  } catch (error) {
    console.error("❌ Error clearing reports:", error);
  }
}

// Main execution
async function main() {
  await clearReports();
  await seedReports();
  process.exit(0);
}

main().catch(console.error);
