import { Prayer, PrayerCard } from "../model/Prayer";
import { HebrewDate } from "../model/HebrewDate";
import { PrayerEvent } from "../model/PrayerEvent";
import { AliyaGroup } from "../model/AliyaGroup";
import { AliyaType } from "../model/AliyaType";
import { AliyaTypeCategory } from "../model/AliyaTypeCategory";
import { PrayerEventType } from "../model/PrayerEventType";

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
export type AliyaHistory = Map<
  string, // prayerId
  {
    prayerId: string;
    prayerName: string;
    categoryData: Map<
      string, // categoryId
      {
        categoryName: string;
        categoryDisplayOrder: number;
        count: number;
        weeksSinceLastAliya: number;
        lastParashaDate: HebrewDate | null;
        lastParasha: string | null;
      }
    >;
  }
>;

export const calculateAliyaHistory = (
  prayerCards: PrayerCard[],
  aliyaGroups: AliyaGroup[],
  aliyaTypes: AliyaType[],
  categories: AliyaTypeCategory[]
): AliyaHistory => {
  if (!prayerCards || !aliyaGroups || !aliyaTypes || !categories)
    return new Map();

  const aliyaHistory: AliyaHistory = new Map();

  prayerCards.forEach(card => {
    aliyaHistory.set(card.prayer.id, {
      prayerId: card.prayer.id,
      prayerName: card.prayer.fullName,
      categoryData: new Map(),
    });
  });
  prayerCards.forEach(card => {
    card.children.forEach(child => {
      if (!isEligibleForAliya(child)) return;
      aliyaHistory.set(child.id, {
        prayerId: child.id,
        prayerName: `${child.fullName} בן של ${card.prayer.fullName}`,
        categoryData: new Map(),
      });
    });
  });

  const aliyaGroupMap = new Map<string, AliyaGroup>();
  aliyaGroups.forEach(group => {
    aliyaGroupMap.set(group.id, group);
  });

  const aliyaTypeMap = new Map<string, AliyaType>();
  aliyaTypes.forEach(type => {
    aliyaTypeMap.set(type.id, type);
  });

  const categoryMap = new Map<string, AliyaTypeCategory>();
  categories.forEach(category => {
    categoryMap.set(category.id, category);
  });

  const aliyaTypeIdToCategoryIdMap = new Map<string, Set<string>>();
  categories.forEach(category => {
    category.aliyaTypeIds.forEach(aliyaTypeId => {
      if (!aliyaTypeIdToCategoryIdMap.has(aliyaTypeId)) {
        aliyaTypeIdToCategoryIdMap.set(aliyaTypeId, new Set());
      }
      aliyaTypeIdToCategoryIdMap.get(aliyaTypeId)!.add(category.id);
    });
  });

  aliyaGroups.forEach(group => {
    Object.entries(group.assignments).forEach(([aliyaTypeId, prayerId]) => {
      if (!aliyaHistory.has(prayerId)) return;
      const categoriesIds = aliyaTypeIdToCategoryIdMap.get(aliyaTypeId);
      categoriesIds?.forEach(categoryId => {
        const category = categoryMap.get(categoryId);
        const categoryData = aliyaHistory
          .get(prayerId)
          ?.categoryData.get(categoryId);

        if (categoryData) {
          categoryData.count++;
          // Update last parasha if this is more recent
          if (
            !categoryData.lastParashaDate ||
            group.hebrewDate.isAfter(categoryData.lastParashaDate)
          ) {
            categoryData.lastParashaDate = group.hebrewDate;
            categoryData.lastParasha = group.hebrewDate.getParasha();
            categoryData.weeksSinceLastAliya = HebrewDate.now().weeksSince(
              group.hebrewDate
            );
          }
        } else {
          aliyaHistory.get(prayerId)?.categoryData.set(categoryId, {
            categoryName: category?.name || "",
            count: 1,
            weeksSinceLastAliya: HebrewDate.now().weeksSince(group.hebrewDate),
            lastParashaDate: group.hebrewDate,
            lastParasha: group.hebrewDate.getParasha(),
            categoryDisplayOrder: category?.displayOrder ?? Infinity,
          });
        }
      });
    });
  });

  return aliyaHistory;
};

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
