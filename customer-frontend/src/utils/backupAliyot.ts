import { PrayerCard, Prayer } from "../model/Prayer";
import { AliyaGroup } from "../model/AliyaGroup";
import { AliyaType } from "../model/AliyaType";

export interface AliyotBackupEntry {
  // Aliya data
  aliyaGroupId: string;
  aliyaType: string;
  aliyaTypeDisplayName: string;

  // Prayer data
  prayerId: string;
  firstName: string;
  lastName: string;
  isChild: boolean;
  parentName?: string;

  // Prayer card data
  prayerCardId: string;

  // Group data
  groupLabel: string;
  hebrewDate: string; // Hebrew date as string
}

export interface AliyotBackup {
  metadata: {
    backupDate: string;
    totalCount: number;
    version: string;
    synagogueId: string;
    synagogueName: string;
  };
  aliyot: AliyotBackupEntry[];
}

/**
 * Extracts all aliyot from groups (new model), creating a backup with full context
 */
export function extractAllAliyot(
  prayerCards: PrayerCard[],
  aliyaGroups: AliyaGroup[],
  aliyaTypes: AliyaType[]
): AliyotBackupEntry[] {
  const entries: AliyotBackupEntry[] = [];
  const groupMap = new Map(aliyaGroups.map(g => [g.id, g]));
  const aliyaTypeMap = new Map(aliyaTypes.map(t => [t.id, t]));

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
        const aliyaType = aliyaTypeMap.get(aliyaTypeId);
        entries.push({
          aliyaGroupId: group.id,
          aliyaType: aliyaTypeId,
          aliyaTypeDisplayName: aliyaType?.displayName || aliyaTypeId,
          prayerId: prayerInfo.prayer.id,
          firstName: prayerInfo.prayer.firstName,
          lastName: prayerInfo.prayer.lastName,
          isChild: prayerInfo.isChild,
          parentName: prayerInfo.isChild
            ? `${prayerInfo.prayerCard.prayer.firstName} ${prayerInfo.prayerCard.prayer.lastName}`
            : undefined,
          prayerCardId: prayerInfo.prayerCard.id,
          groupLabel: group.label,
          hebrewDate: group.hebrewDate.toString(),
        });
      }
    });
  });

  return entries;
}

/**
 * Creates a backup object with metadata
 */
export function createAliyotBackup(
  prayerCards: PrayerCard[],
  aliyaGroups: AliyaGroup[],
  aliyaTypes: AliyaType[],
  synagogueId: string,
  synagogueName: string
): AliyotBackup {
  const aliyot = extractAllAliyot(prayerCards, aliyaGroups, aliyaTypes);

  return {
    metadata: {
      backupDate: new Date().toISOString(),
      totalCount: aliyot.length,
      version: "1.0",
      synagogueId,
      synagogueName,
    },
    aliyot,
  };
}

/**
 * Downloads the backup as a JSON file
 */
export function downloadAliyotBackup(
  prayerCards: PrayerCard[],
  aliyaGroups: AliyaGroup[],
  aliyaTypes: AliyaType[],
  synagogueId: string,
  synagogueName: string
): void {
  const backup = createAliyotBackup(
    prayerCards,
    aliyaGroups,
    aliyaTypes,
    synagogueId,
    synagogueName
  );

  // Create filename with synagogue info and timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  // Sanitize synagogue name for filename (remove special characters)
  const sanitizedName = synagogueName.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `aliyot-backup-${synagogueId}-${sanitizedName}-${timestamp}.json`;

  // Convert to JSON string with pretty formatting
  const jsonString = JSON.stringify(backup, null, 2);

  // Create blob and download
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
