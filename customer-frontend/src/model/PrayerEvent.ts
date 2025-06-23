import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { v4 as uuidv4 } from "uuid";

// Aliya event types
export const AliyaEventType = {
  PTICHAT_HAHECHAL: "פתיחת ההיכל",
  HOLACHAT_SEFER_TORAH: "הולכת ספרת תורה",
  RISHON: "ראשון",
  SHENI: "שני",
  SHLISHI: "שלישי",
  REVIEI: "רביעי",
  HAMISHI: "חמישי",
  SHISHI: "שישי",
  SHVEI: "שביעי",
  MAFTIR: "מפטיר",
  HAFTARA: "חפטרה",
  MOSIF: "מוסיף",
  OTHER: "אחר",
} as const;

export type AliyaEventType =
  (typeof AliyaEventType)[keyof typeof AliyaEventType];

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

// Base DTO interface for Firestore serialization
export interface EventDto {
  id: string;
  date: HebrewDateDto;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

// Aliya Event DTO
export interface AliyaEventDto extends EventDto {
  type: AliyaEventType;
}

// Prayer Event DTO
export interface PrayerEventDto extends EventDto {
  type: PrayerEventType;
  isRecurring: boolean;
}

// Base Event class for non-recurring events
abstract class BaseEvent {
  public id: string;
  public date: HebrewDate;
  public description?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    date: HebrewDate,
    description?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.date = date;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Abstract method that subclasses must implement
  abstract toDto(): EventDto;
  abstract get typeDisplayName(): string;

  // Common methods
  equals(other: BaseEvent): boolean {
    return this.id === other.id;
  }

  clone(): BaseEvent {
    return this.createClone();
  }

  update(updates: Partial<Omit<BaseEvent, "id" | "createdAt">>): BaseEvent {
    return this.createUpdatedInstance(updates);
  }

  // Abstract methods for subclasses
  protected abstract createClone(): BaseEvent;
  protected abstract createUpdatedInstance(
    updates: Partial<Omit<BaseEvent, "id" | "createdAt">>
  ): BaseEvent;
}

// Base Event class for recurring events
abstract class BaseRecurringEvent extends BaseEvent {
  public isRecurring: boolean;

  constructor(
    id: string,
    date: HebrewDate,
    isRecurring: boolean = false,
    description?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, date, description, createdAt, updatedAt);
    this.isRecurring = isRecurring;
  }

  update(
    updates: Partial<Omit<BaseRecurringEvent, "id" | "createdAt">>
  ): BaseRecurringEvent {
    return this.createUpdatedInstance(updates);
  }

  // Abstract methods for subclasses
  protected abstract createClone(): BaseRecurringEvent;
  protected abstract createUpdatedInstance(
    updates: Partial<Omit<BaseRecurringEvent, "id" | "createdAt">>
  ): BaseRecurringEvent;
}

// Aliya Event class
export class AliyaEvent extends BaseEvent {
  public type: AliyaEventType;

  constructor(
    id: string,
    type: AliyaEventType,
    date: HebrewDate,
    description?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, date, description, createdAt, updatedAt);
    this.type = type;
  }

  // Convert to DTO for Firestore storage
  toDto(): AliyaEventDto {
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
  static fromDto(dto: AliyaEventDto): AliyaEvent {
    return new AliyaEvent(
      dto.id,
      dto.type,
      HebrewDate.fromDto(dto.date),
      dto.description,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new AliyaEvent without ID (for creation)
  static create(
    type: AliyaEventType,
    date: HebrewDate,
    description?: string
  ): Omit<AliyaEvent, "id"> {
    return new AliyaEvent(
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

  // Check if this is a Torah reading aliya
  get isTorahReading(): boolean {
    const torahReadings = [
      AliyaEventType.RISHON,
      AliyaEventType.SHENI,
      AliyaEventType.SHLISHI,
      AliyaEventType.REVIEI,
      AliyaEventType.HAMISHI,
      AliyaEventType.SHISHI,
      AliyaEventType.SHVEI,
    ] as const;
    return torahReadings.includes(this.type as any);
  }

  // Check if this is a special aliya
  get isSpecialAliya(): boolean {
    const specialAliyas = [
      AliyaEventType.PTICHAT_HAHECHAL,
      AliyaEventType.HOLACHAT_SEFER_TORAH,
      AliyaEventType.MAFTIR,
      AliyaEventType.HAFTARA,
      AliyaEventType.MOSIF,
    ] as const;
    return specialAliyas.includes(this.type as any);
  }

  // Protected methods for base class
  protected createClone(): AliyaEvent {
    return new AliyaEvent(
      this.id,
      this.type,
      this.date,
      this.description,
      this.createdAt,
      this.updatedAt
    );
  }

  protected createUpdatedInstance(
    updates: Partial<Omit<BaseEvent, "id" | "createdAt">>
  ): AliyaEvent {
    return new AliyaEvent(
      this.id,
      this.type,
      updates.date ?? this.date,
      updates.description ?? this.description,
      this.createdAt,
      new Date() // updatedAt
    );
  }

  // Get all aliya event types
  static getAllTypes(): AliyaEventType[] {
    return Object.values(AliyaEventType);
  }
}

// Prayer Event class
export class PrayerEvent extends BaseRecurringEvent {
  public type: PrayerEventType;

  constructor(
    id: string,
    type: PrayerEventType,
    date: HebrewDate,
    isRecurring: boolean = false,
    description?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, date, isRecurring, description, createdAt, updatedAt);
    this.type = type;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerEventDto {
    return {
      id: this.id,
      type: this.type,
      date: this.date.toDto(),
      description: this.description,
      isRecurring: this.isRecurring,
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
      dto.isRecurring,
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
      isRecurring,
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
    const lifeCycleEvents = [
      PrayerEventType.BAR_MITZVAH,
      PrayerEventType.BAT_MITZVAH,
      PrayerEventType.AVI_HABEN,
      PrayerEventType.AVI_HABAT,
      PrayerEventType.SHABAT_HATAN,
    ] as const;
    return lifeCycleEvents.includes(this.type as any);
  }

  // Check if this is a recurring event
  get isRecurringEvent(): boolean {
    const recurringEvents = [
      PrayerEventType.BIRTHDATE,
      PrayerEventType.AZKARA,
      PrayerEventType.YARTZEIT,
    ] as const;
    return recurringEvents.includes(this.type as any) || this.isRecurring;
  }

  // Check if this is a milestone event
  get isMilestoneEvent(): boolean {
    const milestoneEvents = [
      PrayerEventType.BAR_MITZVAH,
      PrayerEventType.BAT_MITZVAH,
    ] as const;
    return milestoneEvents.includes(this.type as any);
  }

  // Protected methods for base class
  protected createClone(): PrayerEvent {
    return new PrayerEvent(
      this.id,
      this.type,
      this.date,
      this.isRecurring,
      this.description,
      this.createdAt,
      this.updatedAt
    );
  }

  protected createUpdatedInstance(
    updates: Partial<Omit<BaseRecurringEvent, "id" | "createdAt">>
  ): PrayerEvent {
    return new PrayerEvent(
      this.id,
      this.type,
      updates.date ?? this.date,
      updates.isRecurring ?? this.isRecurring,
      updates.description ?? this.description,
      this.createdAt,
      new Date() // updatedAt
    );
  }

  // Get all prayer event types
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
    ];
  }

  // Get recurring event types
  static getRecurringTypes(): PrayerEventType[] {
    return [
      PrayerEventType.BIRTHDATE,
      PrayerEventType.AZKARA,
      PrayerEventType.YARTZEIT,
    ];
  }
}

// Union type for all events
export type Event = AliyaEvent | PrayerEvent;

// Legacy type aliases for backward compatibility
export type PrayerRecurringEventType = PrayerEventType;
export const PrayerRecurringEventType = PrayerEventType;
