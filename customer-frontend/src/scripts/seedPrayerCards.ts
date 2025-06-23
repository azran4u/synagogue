import { prayerCardsSrevice } from "../services/prayerCardsSrevice";
import { PrayerCard } from "../model/PrayerCard";
import { Prayer } from "../model/Prayer";
import { PrayerEvent, PrayerEventType } from "../model/PrayerEvent";
import { AliyaEvent, AliyaEventType } from "../model/PrayerEvent";
import { HebrewDate } from "../model/HebrewDate";

// Hebrew names for realistic data
const HEBREW_FIRST_NAMES = [
  "אברהם",
  "יצחק",
  "יעקב",
  "משה",
  "דוד",
  "שלמה",
  "יוסף",
  "בנימין",
  "יהודה",
  "ראובן",
  "שמעון",
  "לוי",
  "דן",
  "נפתלי",
  "גד",
  "אשר",
  "אפרים",
  "מנשה",
  "אהרון",
  "שמואל",
  "חנה",
  "שרה",
  "רחל",
  "לאה",
  "מרים",
  "דבורה",
  "רות",
  "אסתר",
  "יוכבד",
  "ציפורה",
  "מיכל",
  "אביגיל",
  "תמר",
  "רבקה",
  "דינה",
  "בלהה",
  "זלפה",
  "בילהה",
  "עדה",
  "צילה",
];

const HEBREW_LAST_NAMES = [
  "כהן",
  "לוי",
  "גולדברג",
  "ברגר",
  "וייס",
  "גרוס",
  "שטיין",
  "בלום",
  "רוזן",
  "כץ",
  "מילר",
  "שוורץ",
  "גרינברג",
  "פרידמן",
  "בראון",
  "דייוויס",
  "וילסון",
  "גרסיה",
  "רודריגז",
  "מרטינז",
  "אנדרסון",
  "טיילור",
  "תומאס",
  "הרננדז",
  "מור",
  "מרטין",
  "גקסון",
  "תומפסון",
  "וייט",
  "לופז",
  "לי",
  "גונזלס",
  "האריס",
  "קלארק",
  "לואיס",
  "רובינסון",
  "ווקר",
  "פרז",
  "הול",
  "יאנג",
];

const HEBREW_STREETS = [
  "רחוב הרצל",
  "רחוב ויצמן",
  "רחוב בן גוריון",
  "רחוב זבוטינסקי",
  "רחוב בגין",
  "רחוב רבין",
  "רחוב פרס",
  "רחוב שרון",
  "רחוב אולמרט",
  "רחוב נתניהו",
  "רחוב לפיד",
  "רחוב גנץ",
  "רחוב בנט",
  "רחוב סער",
  "רחוב שקד",
  "רחוב כהנא",
  "רחוב בן ארי",
  "רחוב דרעי",
  "רחוב ליצמן",
  "רחוב גפני",
];

const HEBREW_CITIES = [
  "ירושלים",
  "תל אביב",
  "חיפה",
  "ראשון לציון",
  "פתח תקווה",
  "אשדוד",
  "נתניה",
  "באר שבע",
  "חולון",
  "רמת גן",
  "רחובות",
  "הרצליה",
  "כפר סבא",
  "רעננה",
  "קריית גת",
  "בית שמש",
  "אופקים",
  "דימונה",
  "ירוחם",
  "מצפה רמון",
];

// Helper function to get random item from array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to get random number between min and max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to get random Hebrew date within a range
function getRandomHebrewDate(
  startYear: number = 5700,
  endYear: number = 5784
): HebrewDate {
  const year = getRandomNumber(startYear, endYear);
  const month = getRandomNumber(1, 13); // Hebrew months 1-13
  const day = getRandomNumber(1, 30); // Most Hebrew months have 29-30 days

  try {
    return new HebrewDate(year, month, day);
  } catch {
    // If invalid date, try again
    return getRandomHebrewDate(startYear, endYear);
  }
}

// Helper function to get random Hebrew date in recent years (for events)
function getRandomRecentHebrewDate(): HebrewDate {
  const currentYear = new HebrewDate(new Date()).year;
  return getRandomHebrewDate(currentYear - 10, currentYear + 5);
}

// Generate random phone number
function generatePhoneNumber(): string {
  const prefixes = ["050", "051", "052", "053", "054", "055", "058"];
  const prefix = getRandomItem(prefixes);
  const number = Math.floor(Math.random() * 10000000)
    .toString()
    .padStart(7, "0");
  return `${prefix}-${number}`;
}

// Generate random address
function generateAddress(): string {
  const street = getRandomItem(HEBREW_STREETS);
  const number = getRandomNumber(1, 200);
  const city = getRandomItem(HEBREW_CITIES);
  return `${street} ${number}, ${city}`;
}

// Generate random events
function generateRandomEvents(): PrayerEvent[] {
  const events: PrayerEvent[] = [];
  const numEvents = getRandomNumber(0, 5); // 0-5 events per prayer card

  for (let i = 0; i < numEvents; i++) {
    const eventType = getRandomItem(Object.values(PrayerEventType));
    const date = getRandomRecentHebrewDate();
    const isRecurring = Math.random() > 0.5; // 50% chance of being recurring
    const description =
      Math.random() > 0.7 ? `תיאור לאירוע ${i + 1}` : undefined;

    const event = PrayerEvent.create(eventType, date, isRecurring, description);
    events.push(event);
  }

  return events;
}

// Generate random children
function generateRandomChildren(): Prayer[] {
  const children: Prayer[] = [];
  const numChildren = getRandomNumber(0, 4); // 0-4 children per prayer card

  for (let i = 0; i < numChildren; i++) {
    const firstName = getRandomItem(HEBREW_FIRST_NAMES);
    const lastName = getRandomItem(HEBREW_LAST_NAMES);
    const hebrewBirthDate = getRandomHebrewDate(5770, 5784); // Children born in recent years

    const child = Prayer.create(firstName, lastName, hebrewBirthDate);
    children.push(child);
  }

  return children;
}

// Generate a single prayer card
function generatePrayerCard(): PrayerCard {
  const firstName = getRandomItem(HEBREW_FIRST_NAMES);
  const lastName = getRandomItem(HEBREW_LAST_NAMES);
  const hebrewBirthDate = getRandomHebrewDate(5680, 5760); // Adults born in reasonable range
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

  const events = generateRandomEvents();
  const children = generateRandomChildren();

  // Create the main prayer
  const prayer = Prayer.create(firstName, lastName, hebrewBirthDate);

  // Create a PrayerCard instance
  return PrayerCard.create(prayer, events, children, email);
}

// Clear existing prayer cards
async function clearExistingPrayerCards(): Promise<void> {
  try {
    console.log("Clearing existing prayer cards...");
    const existingCards = await prayerCardsSrevice.getAll();
    const deletePromises = existingCards.map(card =>
      prayerCardsSrevice.deleteById(card.id)
    );
    await Promise.all(deletePromises);
    console.log(`Deleted ${existingCards.length} existing prayer cards`);
  } catch (error) {
    console.log(
      "Could not clear existing prayer cards (this is normal if the database is empty or has incompatible data):",
      (error as Error).message
    );
    console.log("Continuing with seeding...");
  }
}

// Seed prayer cards
async function seedPrayerCards(numCards: number = 50): Promise<void> {
  try {
    console.log(`Starting to seed ${numCards} prayer cards...`);

    // Try to clear existing data (but don't fail if it doesn't work)
    await clearExistingPrayerCards();

    // Generate and save prayer cards
    const promises: Promise<string>[] = [];

    for (let i = 0; i < numCards; i++) {
      const prayerCard = generatePrayerCard();

      const promise = prayerCardsSrevice.insertWithId(prayerCard);
      promises.push(promise);

      if ((i + 1) % 10 === 0) {
        console.log(`Generated ${i + 1}/${numCards} prayer cards`);
      }
    }

    await Promise.all(promises);
    console.log(`Successfully seeded ${numCards} prayer cards to Firestore!`);

    // Try to get final count (but don't fail if it doesn't work)
    try {
      const finalCards = await prayerCardsSrevice.getAll();
      console.log(`Total prayer cards in database: ${finalCards.length}`);
    } catch (error) {
      console.log(
        "Could not get final count, but seeding completed successfully"
      );
    }
  } catch (error) {
    console.error("Error seeding prayer cards:", error);
    throw error;
  }
}

// Main function to run the seed
export async function runSeed(): Promise<void> {
  const numCards = process.env.NUM_PRAYER_CARDS
    ? parseInt(process.env.NUM_PRAYER_CARDS)
    : 50;
  await seedPrayerCards(numCards);
}

// Run if this file is executed directly
runSeed()
  .then(() => {
    console.log("Seed completed successfully!");
    process.exit(0);
  })
  .catch(error => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
