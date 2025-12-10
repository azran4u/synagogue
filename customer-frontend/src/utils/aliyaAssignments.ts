import { AliyaGroup } from "../model/AliyaGroup";
import { PrayerCard } from "../model/Prayer";
import { Prayer } from "../model/Prayer";
import { AliyaEvent } from "../model/AliyaEvent";

/**
 * Returns all aliyot from all groups with full context
 * This is the primary function - used by AdminAliyaAssignmentPage to replace the current `allAliyot` computed value
 * Can be filtered by group or prayerCard as needed
 */
export function getAllAliyot(
  aliyaGroups: AliyaGroup[],
  prayerCards: PrayerCard[]
): Array<{
  aliya: AliyaEvent;
  prayer: Prayer;
  prayerCard: PrayerCard;
  isChild: boolean;
}> {
  const result: Array<{
    aliya: AliyaEvent;
    prayer: Prayer;
    prayerCard: PrayerCard;
    isChild: boolean;
  }> = [];

  // Create a map of prayerId -> { prayer, prayerCard, isChild }
  const prayerMap = new Map<
    string,
    { prayer: Prayer; prayerCard: PrayerCard; isChild: boolean }
  >();

  prayerCards.forEach(card => {
    // Add main prayer
    prayerMap.set(card.prayer.id, {
      prayer: card.prayer,
      prayerCard: card,
      isChild: false,
    });

    // Add children
    card.children.forEach(child => {
      prayerMap.set(child.id, {
        prayer: child,
        prayerCard: card,
        isChild: true,
      });
    });
  });

  // Iterate through all groups and their assignments
  aliyaGroups.forEach(group => {
    Object.entries(group.assignments).forEach(([aliyaTypeId, prayerId]) => {
      const prayerInfo = prayerMap.get(prayerId);
      if (prayerInfo) {
        const aliya = AliyaEvent.create(group.id, aliyaTypeId);
        result.push({
          aliya,
          prayer: prayerInfo.prayer,
          prayerCard: prayerInfo.prayerCard,
          isChild: prayerInfo.isChild,
        });
      }
    });
  });

  return result;
}

/**
 * Returns all AliyaEvent objects for a given prayer by scanning all groups' assignments
 * Simple lookup: iterate groups, check if any assignment's prayerId matches the given prayerId
 * Used by PrayerCardPage and AdminPrayerCardsPage for individual prayers
 * Used by AdminAliyaHistoryPage when processing prayer history
 */
export function getAliyotForPrayer(
  prayerId: string,
  aliyaGroups: AliyaGroup[]
): AliyaEvent[] {
  const result: AliyaEvent[] = [];

  aliyaGroups.forEach(group => {
    Object.entries(group.assignments).forEach(
      ([aliyaTypeId, assignedPrayerId]) => {
        if (assignedPrayerId === prayerId) {
          result.push(AliyaEvent.create(group.id, aliyaTypeId));
        }
      }
    );
  });

  return result;
}
