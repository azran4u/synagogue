import { toraLessonsService } from "../services/ToraLessonsService";
import { ToraLesson, ToraLessonsCollection } from "../model/ToraLessons";

// Sample Torah lessons data
const sampleLessons: ToraLesson[] = [
  // Weekly lessons
  ToraLesson.createWeekly(
    "שיעור גמרא יומי",
    0, // Sunday
    "20:00",
    "הרב כהן",
    "מסכת ברכות",
    ["שיעור מתאים לכל הרמות", "ניתן להצטרף בכל עת", "מקום: בית הכנסת הגדול"]
  ),

  ToraLesson.createWeekly(
    "שיעור הלכה",
    2, // Tuesday
    "19:30",
    "הרב לוי",
    "הלכות שבת",
    ["שיעור מעשי", "כולל דוגמאות מהחיים"]
  ),

  ToraLesson.createWeekly(
    'שיעור תנ"ך',
    4, // Thursday
    "18:00",
    "הרב גולדברג",
    "ספר בראשית",
    ["לימוד מעמיק של פרשת השבוע", "דגש על מוסר השכל"]
  ),

  ToraLesson.createWeekly(
    "שיעור קבלה",
    5, // Friday
    "17:00",
    "הרב שפירא",
    "ספר הזוהר",
    ["שיעור מתקדם", "דרושה רקע בסיסי"]
  ),

  // One-time lessons
  ToraLesson.createOneTime(
    "הרצאה מיוחדת: חגי תשרי",
    "20:30",
    "הרב רוזנברג",
    "משמעות החגים",
    ["הרצאה מיוחדת לכבוד ימי התשובה", "כולל סעודה קלה", "הרשמה מראש נדרשת"]
  ),

  ToraLesson.createOneTime(
    "סדנה: הכנת מזוזות",
    "14:00",
    "הרב כהנא",
    "הלכות מזוזות",
    ["סדנה מעשית", "כולל חומרים", 'מחיר: 50 ש"ח']
  ),

  ToraLesson.createOneTime(
    "שיעור מיוחד: ליל שבועות",
    "23:00",
    "הרב וייס",
    "מתן תורה",
    ["שיעור לילי", "כולל תיקון ליל שבועות", "קפה ועוגות"]
  ),
];

// Sample collections
const sampleCollections: ToraLessonsCollection[] = [
  ToraLessonsCollection.create(
    "שיעורים שבועיים",
    "שיעורי תורה קבועים המתקיימים מדי שבוע"
  ),

  ToraLessonsCollection.create(
    "שיעורים מיוחדים",
    "שיעורים חד פעמיים ואירועים מיוחדים"
  ),

  ToraLessonsCollection.create("שיעורי חגים", "שיעורים הקשורים לחגי ישראל"),
];

// Add lessons to collections
sampleCollections[0] = sampleCollections[0]
  .addLesson(sampleLessons[0])
  .addLesson(sampleLessons[1])
  .addLesson(sampleLessons[2])
  .addLesson(sampleLessons[3]);

sampleCollections[1] = sampleCollections[1]
  .addLesson(sampleLessons[4])
  .addLesson(sampleLessons[5]);

sampleCollections[2] = sampleCollections[2].addLesson(sampleLessons[6]);

// Seed functions
async function seedCollections() {
  console.log("🌱 Seeding Torah lesson collections...");

  try {
    for (const collection of sampleCollections) {
      const id = await toraLessonsService.insert(collection);
      console.log(`✅ Created collection: ${collection.title} (ID: ${id})`);
      console.log(`   Contains ${collection.lessons.length} lessons`);
    }
    console.log(
      `🎉 Successfully seeded ${sampleCollections.length} collections`
    );
  } catch (error) {
    console.error("❌ Error seeding collections:", error);
  }
}

async function clearCollections() {
  console.log("🗑️ Clearing all Torah lesson collections...");

  try {
    const collections = await toraLessonsService.getAll();
    for (const collection of collections) {
      await toraLessonsService.deleteById(collection.id);
      console.log(`🗑️ Deleted collection: ${collection.title}`);
    }
    console.log("✅ All collections cleared");
  } catch (error) {
    console.error("❌ Error clearing collections:", error);
  }
}

async function displayCollections() {
  console.log("📚 Displaying all Torah lesson collections...");

  try {
    const collections = await toraLessonsService.getAll();
    console.log(`\nFound ${collections.length} collections:\n`);

    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.title}`);
      if (collection.description)
        console.log(`   Description: ${collection.description}`);
      console.log(`   Lessons: ${collection.lessons.length}`);
      if (collection.lessons.length > 0) {
        console.log("   Lesson titles:");
        collection.lessons.forEach((lesson, lessonIndex) => {
          console.log(`     ${lessonIndex + 1}. ${lesson.title}`);
          console.log(`        Type: ${lesson.typeDescription}`);
          console.log(`        Schedule: ${lesson.scheduleDescription}`);
          if (lesson.ledBy) console.log(`        Led by: ${lesson.ledBy}`);
          if (lesson.topic) console.log(`        Topic: ${lesson.topic}`);
          if (lesson.hasNotes) {
            console.log(`        Notes (${lesson.notesCount}):`);
            lesson.notes.forEach((note, noteIndex) => {
              console.log(`          ${noteIndex + 1}. ${note}`);
            });
          }
        });
      }
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error displaying collections:", error);
  }
}

async function reset() {
  console.log("🔄 Resetting Torah lessons data...");
  await clearCollections();
  await seedCollections();
  console.log("✅ Reset completed");
}

// Main execution
async function main() {
  await clearCollections();
  await seedCollections();
}

main().catch(console.error);
