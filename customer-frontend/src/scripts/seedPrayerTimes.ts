import {
  PrayerTimes,
  PrayerTimeSection,
  PrayerTimeEntry,
} from "../model/PrayerTimes";
import { prayerTimesService } from "../services/prayerTimesService";

// Simple sample prayer times data
const samplePrayerTimes = {
  title: "זמני תפילה - בית כנסת מרכזי",
  sections: [
    {
      title: "תפילות שחרית",
      times: [
        { label: "עלות השחר", time: "05:15" },
        { label: "נץ החמה", time: "06:00" },
        { label: "שחרית", time: "07:00" },
        { label: "מנחה", time: "13:15" },
        { label: "ערבית", time: "19:30" },
      ],
    },
    {
      title: "זמני שבת",
      times: [
        { label: "קבלת שבת", time: "18:45" },
        { label: "שחרית שבת", time: "08:30" },
        { label: "מנחה שבת", time: "16:30" },
        { label: "ערבית מוצאי שבת", time: "20:15" },
      ],
    },
  ],
};

async function seedPrayerTimes() {
  console.log("🌱 Starting prayer times seeding...");

  try {
    // Convert the data to PrayerTimes objects
    const sections = samplePrayerTimes.sections.map(section =>
      PrayerTimeSection.create(
        section.title,
        section.times.map(time => PrayerTimeEntry.create(time.label, time.time))
      )
    );

    const prayerTimes = PrayerTimes.create(samplePrayerTimes.title, sections);

    // Insert with a custom ID
    const id = "prayer-times-main";
    await prayerTimesService.insertWithId(id, prayerTimes);

    console.log(`✅ Created prayer times: ${prayerTimes.title} (ID: ${id})`);
    console.log(`📚 Sections: ${sections.length}`);
    console.log(`⏰ Total time entries: ${prayerTimes.getAllTimes().length}`);
    console.log(
      `✅ Time entries with values: ${prayerTimes.getAllTimesWithValues().length}`
    );

    console.log("\n🎉 Prayer times seeding completed successfully!");
  } catch (error) {
    console.error("💥 Error during seeding:", error);
    process.exit(1);
  }
}

// Function to clear prayer times
async function clearPrayerTimes() {
  console.log("🗑️  Clearing prayer times...");

  try {
    const allPrayerTimes = await prayerTimesService.getAll();

    for (const prayerTimes of allPrayerTimes) {
      await prayerTimesService.deleteById(prayerTimes.id);
      console.log(`🗑️  Deleted: ${prayerTimes.title}`);
    }

    console.log(`✅ Cleared ${allPrayerTimes.length} prayer times`);
  } catch (error) {
    console.error("❌ Error clearing prayer times:", error);
  }
}

// Function to display prayer times
async function displayPrayerTimes() {
  console.log("📋 Displaying prayer times:");

  try {
    const allPrayerTimes = await prayerTimesService.getAll();

    if (allPrayerTimes.length === 0) {
      console.log("No prayer times found in database.");
      return;
    }

    allPrayerTimes.forEach((pt, index) => {
      console.log(`\n${index + 1}. ${pt.title} (ID: ${pt.id})`);
      console.log(`   Created: ${pt.createdAt.toLocaleDateString("he-IL")}`);

      pt.sections.forEach(section => {
        console.log(`   📍 ${section.title}:`);
        section.times.forEach(time => {
          const timeDisplay = time.hasTime ? time.time : "לא נקבע";
          console.log(`      • ${time.label}: ${timeDisplay}`);
        });
      });
    });
  } catch (error) {
    console.error("❌ Error displaying prayer times:", error);
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  switch (command) {
    case "seed":
      await seedPrayerTimes();
      break;
    case "clear":
      await clearPrayerTimes();
      break;
    case "display":
      await displayPrayerTimes();
      break;
    case "reset":
      await clearPrayerTimes();
      await seedPrayerTimes();
      break;
    default:
      console.log(
        "Usage: npm run seed:prayer-times [seed|clear|display|reset]"
      );
      console.log("  seed    - Add sample prayer times");
      console.log("  clear   - Remove all prayer times");
      console.log("  display - Show all prayer times");
      console.log("  reset   - Clear and reseed prayer times");
      break;
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { seedPrayerTimes, clearPrayerTimes, displayPrayerTimes };
