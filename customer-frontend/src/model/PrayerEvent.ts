import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { v4 as uuidv4 } from "uuid";
import { EventDto } from "./AliyaEvent";

// Prayer event types
export const PrayerEventType = {
  BAR_MITZVAH: "בר מצווה",
  BAT_MITZVAH: "בת מצווה",
  AVI_HABEN: "אבי הבן",
  AVI_HABAT: "אבי הבת",
  SHABAT_HATAN: "שבת חתן",
  BIRTHDATE: "יומהולדת",
  AZKARA: "אזכרה",
  YARTZEIT: "יארצייט",
  OTHER: "אחר",
} as const;

export type PrayerEventType =
  (typeof PrayerEventType)[keyof typeof PrayerEventType];

// Prayer Event DTO
export interface PrayerEventDto extends EventDto {
  type: PrayerEventType;
}

export class PrayerEvent {
  public id: string;
  public type: PrayerEventType;
  public date: HebrewDate;
  public description?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    type: PrayerEventType,
    date: HebrewDate,
    description?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.type = type;
    this.date = date;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerEventDto {
    return {
      id: this.id,
      type: this.type,
      date: this.date.toDto(),
      description: this.description,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerEventDto): PrayerEvent {
    return new PrayerEvent(
      dto.id,
      dto.type,
      HebrewDate.fromDto(dto.date),
      dto.description,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new PrayerEvent without ID (for creation)
  static create(
    type: PrayerEventType,
    date: HebrewDate,
    isRecurring: boolean = false,
    description?: string
  ): PrayerEvent {
    return new PrayerEvent(
      uuidv4(),
      type,
      date,
      description,
      new Date(),
      new Date()
    );
  }

  // Get event type display name
  get typeDisplayName(): string {
    return this.type;
  }

  // Check if this is a life cycle event
  get isLifeCycleEvent(): boolean {
    const lifeCycleEvents: PrayerEventType[] = [
      PrayerEventType.BAR_MITZVAH,
      PrayerEventType.BAT_MITZVAH,
      PrayerEventType.AVI_HABEN,
      PrayerEventType.AVI_HABAT,
      PrayerEventType.SHABAT_HATAN,
      PrayerEventType.BIRTHDATE,
    ];
    return lifeCycleEvents.includes(this.type);
  }

  // Check if this is a recurring event
  get isRecurringEvent(): boolean {
    const recurringEvents: PrayerEventType[] = [
      PrayerEventType.AZKARA,
      PrayerEventType.YARTZEIT,
      PrayerEventType.BIRTHDATE,
    ];
    return recurringEvents.includes(this.type);
  }

  // Check if this is a milestone event
  get isMilestoneEvent(): boolean {
    const milestoneEvents: PrayerEventType[] = [
      PrayerEventType.BAR_MITZVAH,
      PrayerEventType.BAT_MITZVAH,
      PrayerEventType.SHABAT_HATAN,
    ];
    return milestoneEvents.includes(this.type);
  }

  // Common methods
  equals(other: PrayerEvent): boolean {
    return this.id === other.id;
  }

  clone(): PrayerEvent {
    return new PrayerEvent(
      this.id,
      this.type,
      this.date,
      this.description,
      this.createdAt,
      this.updatedAt
    );
  }

  update(updates: Partial<Omit<PrayerEvent, "id" | "createdAt">>): PrayerEvent {
    return new PrayerEvent(
      this.id,
      updates.type ?? this.type,
      updates.date ?? this.date,
      updates.description ?? this.description,
      this.createdAt,
      new Date()
    );
  }

  // Get all available prayer event types
  static getAllTypes(): PrayerEventType[] {
    return Object.values(PrayerEventType);
  }

  // Get life cycle event types
  static getLifeCycleTypes(): PrayerEventType[] {
    return [
      PrayerEventType.BAR_MITZVAH,
      PrayerEventType.BAT_MITZVAH,
      PrayerEventType.AVI_HABEN,
      PrayerEventType.AVI_HABAT,
      PrayerEventType.SHABAT_HATAN,
      PrayerEventType.BIRTHDATE,
    ];
  }

  // Get recurring event types
  static getRecurringTypes(): PrayerEventType[] {
    return [
      PrayerEventType.AZKARA,
      PrayerEventType.YARTZEIT,
      PrayerEventType.BIRTHDATE,
    ];
  }
}
