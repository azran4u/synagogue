import { Prayer, PrayerCard } from "../model/Prayer";
import { HebrewDate } from "../model/HebrewDate";
import { PrayerEvent } from "../model/PrayerEvent";

// Helper function to check if prayer is eligible (13+ or no birthdate)
export const isEligibleForAliya = (prayer: Prayer): boolean => {
  if (!prayer.hebrewBirthDate) {
    return true;
  }
  return prayer.hebrewBirthDate.isOlderThan(13);
};

// Get next occurrence of a Hebrew birthday in the current Hebrew year
export const getNextBirthdayOccurrence = (birthDate: HebrewDate): Date => {
  const today = new Date();
  const currentHebrewYear = new HebrewDate(today).year;

  // Try this year's birthday
  let nextBirthday = new HebrewDate(
    currentHebrewYear,
    birthDate.month,
    birthDate.day
  );
  let gregorianDate = nextBirthday.toGregorianDate();

  // If it's already passed, try next year
  if (gregorianDate < today) {
    nextBirthday = new HebrewDate(
      currentHebrewYear + 1,
      birthDate.month,
      birthDate.day
    );
    gregorianDate = nextBirthday.toGregorianDate();
  }

  return gregorianDate;
};

export interface UpcomingItem {
  type: "birthday" | "event";
  date: Date;
  hebrewDate: HebrewDate;
  prayer: Prayer;
  prayerCard: PrayerCard;
  isChild: boolean;
  event?: PrayerEvent;
  age?: number; // For birthdays
}

// Helper function to calculate upcoming items
export const calculateUpcomingItems = (
  prayerCards: PrayerCard[] | undefined,
  daysAhead: number
): UpcomingItem[] => {
  if (!prayerCards) return [];

  const items: UpcomingItem[] = [];
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + daysAhead);

  prayerCards.forEach(card => {
    // Process main prayer
    if (isEligibleForAliya(card.prayer)) {
      // Add birthday if exists
      if (card.prayer.hebrewBirthDate) {
        const nextBirthday = getNextBirthdayOccurrence(
          card.prayer.hebrewBirthDate
        );
        if (nextBirthday >= today && nextBirthday <= futureDate) {
          const age = card.prayer.hebrewBirthDate.calculateAge() + 1;
          items.push({
            type: "birthday",
            date: nextBirthday,
            hebrewDate: new HebrewDate(nextBirthday),
            prayer: card.prayer,
            prayerCard: card,
            isChild: false,
            age,
          });
        }
      }

      // Add events
      card.prayer.events.forEach(event => {
        const eventDate = event.hebrewDate.toGregorianDate();
        if (eventDate >= today && eventDate <= futureDate) {
          items.push({
            type: "event",
            date: eventDate,
            hebrewDate: event.hebrewDate,
            prayer: card.prayer,
            prayerCard: card,
            isChild: false,
            event,
          });
        }
      });
    }

    // Process children
    card.children.forEach(child => {
      if (isEligibleForAliya(child)) {
        // Add birthday if exists
        if (child.hebrewBirthDate) {
          const nextBirthday = getNextBirthdayOccurrence(child.hebrewBirthDate);
          if (nextBirthday >= today && nextBirthday <= futureDate) {
            const age = child.hebrewBirthDate.calculateAge() + 1;
            items.push({
              type: "birthday",
              date: nextBirthday,
              hebrewDate: new HebrewDate(nextBirthday),
              prayer: child,
              prayerCard: card,
              isChild: true,
              age,
            });
          }
        }

        // Add events
        child.events.forEach(event => {
          const eventDate = event.hebrewDate.toGregorianDate();
          if (eventDate >= today && eventDate <= futureDate) {
            items.push({
              type: "event",
              date: eventDate,
              hebrewDate: event.hebrewDate,
              prayer: child,
              prayerCard: card,
              isChild: true,
              event,
            });
          }
        });
      }
    });
  });

  // Sort by date (earliest first)
  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
};
