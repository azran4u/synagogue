import { Announcement } from "../model/Announcement";
import { HebrewDate } from "../model/HebrewDate";
import { announcementsService } from "../services/AnnouncementsService";

// Sample announcements data
const sampleAnnouncements: Announcement[] = [
  Announcement.create(
    "שיפוץ בית הכנסת הושלם בהצלחה",
    "בשמחה רבה אנו מודיעים כי שיפוץ בית הכנסת הושלם בהצלחה. השיפוץ כלל חידוש הריצוף, צביעת הקירות, והחלפת התאורה. אנו מודים לכל התורמים שתרמו לפרויקט זה.",
    "אלירן צדוק",
    new HebrewDate(5785, 1, 20), // 20 Nissan 5785
    true // Important
  ),

  Announcement.create(
    "הרחבת הספרייה - תרומת ספרים",
    "אנו מבקשים מהקהילה לתרום ספרים לספרייה החדשה. הספרים צריכים להיות במצב טוב ורלוונטיים ללימוד תורה. אנא פנו לרב אופיר לפני הבאת הספרים.",
    "הרב אופיר כהן",
    new HebrewDate(5785, 1, 15), // 15 Nissan 5785
    false
  ),

  Announcement.create(
    "שיעור מיוחד לכבוד חג השבועות",
    "ביום חמישי הקרוב יתקיים שיעור מיוחד לכבוד חג השבועות. השיעור יעסוק במשמעות מתן תורה ויתקיים בשעה 20:00. כל הקהילה מוזמנת.",
    "הרב דוד לוי",
    new HebrewDate(5785, 2, 5), // 5 Iyar 5785
    false
  ),

  Announcement.create(
    "הודעת חשובה - שעות פתיחה",
    "בעקבות השיפוץ, שעות הפתיחה של בית הכנסת השתנו. בית הכנסת יהיה פתוח מ-06:00 עד 23:00 בימים רגילים, ובשבתות מ-שעה לפני שבת עד שעה אחרי שבת.",
    "דוד דיין",
    new HebrewDate(5785, 1, 18), // 18 Nissan 5785
    true // Important
  ),

  Announcement.create(
    "אירוע קהילתי - סעודת שבת",
    "בשבת הקרובה יתקיים סעודת שבת קהילתית לכבוד השלמת השיפוץ. הסעודה תתקיים בשעה 13:00. כל הקהילה מוזמנת להשתתף.",
    "אלירן צדוק",
    new HebrewDate(5785, 1, 22), // 22 Nissan 5785
    false
  ),

  Announcement.create(
    "תרומה לספרייה - הודעת תודה",
    "אנו מודים לכל התורמים שתרמו לספרייה החדשה. עד כה התקבלו מעל 200 ספרים איכותיים. הספרייה תיפתח בשבוע הבא.",
    "הרב אופיר כהן",
    new HebrewDate(5785, 1, 25), // 25 Nissan 5785
    false
  ),

  Announcement.create(
    "שיעור קבוע חדש - הלכות שבת",
    "מהשבוע הבא יתחיל שיעור קבוע בהלכות שבת. השיעור יתקיים בימי שלישי בשעה 19:30. השיעור מתאים לכל הרמות.",
    "הרב משה גולדברג",
    new HebrewDate(5785, 2, 1), // 1 Iyar 5785
    false
  ),

  Announcement.create(
    "הודעת דחופה - תיקון תאורה",
    "בית הכנסת יהיה סגור ביום ראשון הקרוב בין השעות 10:00-14:00 לצורך תיקון התאורה. אנו מתנצלים על אי הנעימות.",
    "דוד דיין",
    new HebrewDate(5785, 1, 28), // 28 Nissan 5785
    true // Important
  ),

  Announcement.create(
    "אירוע מיוחד - ליל שבועות",
    "בליל שבועות יתקיים תיקון ליל שבועות מיוחד. האירוע יתחיל בשעה 23:00 ויכלול לימוד, שירה, וסעודה קלה. כל הקהילה מוזמנת.",
    "הרב דוד לוי",
    new HebrewDate(5785, 2, 8), // 8 Iyar 5785
    false
  ),

  Announcement.create(
    "הודעת תודה - תרומות לשיפוץ",
    "אנו מודים לכל התורמים שתרמו לשיפוץ בית הכנסת. בזכות תרומותיכם הצלחנו להשלים את הפרויקט בהצלחה. תרומות נוספות יתקבלו בברכה.",
    "אלירן צדוק",
    new HebrewDate(5785, 1, 30), // 30 Nissan 5785
    false
  ),
];

// Seed functions
async function seedAnnouncements() {
  console.log("🌱 Seeding announcements...");

  try {
    for (const announcement of sampleAnnouncements) {
      const id = await announcementsService.insert(announcement);
      console.log(`✅ Created announcement: ${announcement.title} (ID: ${id})`);
      console.log(`   Author: ${announcement.author}`);
      console.log(`   Published: ${announcement.formattedPublicationDate}`);
      console.log(`   Important: ${announcement.isImportant ? "Yes" : "No"}`);
      console.log(`   Recent: ${announcement.isRecent ? "Yes" : "No"}`);
      console.log(`   Content: ${announcement.contentPreview}`);
      console.log("");
    }
    console.log(
      `🎉 Successfully seeded ${sampleAnnouncements.length} announcements`
    );
  } catch (error) {
    console.error("❌ Error seeding announcements:", error);
  }
}

async function clearAnnouncements() {
  console.log("🗑️ Clearing all announcements...");

  try {
    const announcements = await announcementsService.getAll();
    for (const announcement of announcements) {
      await announcementsService.deleteById(announcement.id);
      console.log(`🗑️ Deleted announcement: ${announcement.title}`);
    }
    console.log("✅ All announcements cleared");
  } catch (error) {
    console.error("❌ Error clearing announcements:", error);
  }
}

// Main execution
async function main() {
  await clearAnnouncements();
  await seedAnnouncements();
  process.exit(0);
}

main().catch(console.error);
