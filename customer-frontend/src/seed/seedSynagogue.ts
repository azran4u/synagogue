import { Synagogue } from "../model/Synagogue";
import { synagogueService } from "../services/SynagogueService";

// Simple synagogue seed script
async function seedSynagogue() {
  console.log("🌱 Seeding synagogue...");

  try {
    // Create a synagogue using the proper model
    const synagogue = Synagogue.create("בית כנסת מרכזי", "admin-user-id");

    // Insert with a specific ID
    const synagogueId = "main-synagogue";
    const id = await synagogueService.insertWithId(synagogueId, synagogue);

    console.log(`✅ Created synagogue: ${synagogue.name} (ID: ${id})`);
    console.log(`   Created by: ${synagogue.createdBy}`);
    console.log(`   Created at: ${synagogue.formattedCreatedAt}`);
    console.log(`🎉 Successfully seeded synagogue`);
  } catch (error) {
    console.error("❌ Error seeding synagogue:", error);
  }
}

// Main execution
async function main() {
  await seedSynagogue();
  process.exit(0);
}

main().catch(console.error);
